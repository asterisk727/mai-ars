import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { marsUsers, chartDb, musicDb } from '$lib/server/db/schema';
import { userUpsertScore } from '$lib/server/scores';
import { eq } from 'drizzle-orm';
import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';
import { scorePlayLamps } from '$lib/types/score-lamps';

type BatchManualScore = {
	percent: number;
	lamp: string;
	matchType: string;
	identifier: string;
	difficulty: string;
	timeAchieved: number;
	judgements: {
		pcrit: number;
		perfect: number;
		great: number;
		good: number;
		miss: number;
	};
};

const difficultyMap: Record<string, number> = {
	basic: 0,
	advanced: 1,
	expert: 2,
	master: 3,
	're:master': 4
};

function getDifficultyId(diffString: string | undefined): number {
	if (!diffString) return -1;
	const s = diffString.toLowerCase().replace('dx ', '').trim();
	return difficultyMap[s] ?? -1;
}

function parseLamp(lampStr: string | undefined): (typeof scorePlayLamps)[number] {
	if (!lampStr) return 'UNKNOWN';
	const l = lampStr.toUpperCase();
	if (l.includes('ALL PERFECT+') || l === 'AP+') return 'ALL_PERFECT_PLUS';
	if (l.includes('ALL PERFECT') || l === 'AP') return 'ALL_PERFECT';
	if (l.includes('FULL COMBO+') || l === 'FC+') return 'FULL_COMBO_PLUS';
	if (l.includes('FULL COMBO') || l === 'FC') return 'FULL_COMBO';
	if (l === 'CLEAR' || l === 'FAILED') return 'NONE';
	return 'UNKNOWN';
}

export const POST: RequestHandler = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) {
		return error(401, 'Unauthorized');
	}

	const marsUser = await db
		.select()
		.from(marsUsers)
		.where(eq(marsUsers.authId, session.user.id))
		.get();

	if (!marsUser) {
		return error(404, 'Associated MaiARS user not found.');
	}

	let body: { meta?: { game?: string }; scores?: BatchManualScore[] };
	try {
		body = await request.json();
	} catch {
		return error(400, 'Invalid JSON body');
	}

	if (body.meta?.game !== 'maimaidx' && body.meta?.game !== 'maimai') {
		return error(400, 'Invalid game specified in meta data. Must be maimaidx or maimai.');
	}

	if (!Array.isArray(body.scores)) {
		return error(400, 'Invalid payload: scores must be an array');
	}

	const allCharts = await db
		.select({
			chartId: chartDb.chartId,
			musicId: chartDb.musicId,
			difficultyId: chartDb.difficultyId,
			title: musicDb.name
		})
		.from(chartDb)
		.innerJoin(musicDb, eq(chartDb.musicId, musicDb.musicId));

	const chartMap = new Map<string, number>();
	const titleMap = new Map<string, number>();

	for (const chart of allCharts) {
		chartMap.set(`${chart.musicId}-${chart.difficultyId}`, chart.chartId);
		titleMap.set(chart.title, chart.musicId);
	}

	const validInserts: Parameters<typeof userUpsertScore>[0][] = [];
	const rejected: { score: BatchManualScore; reason: string }[] = [];

	for (const score of body.scores) {
		if (typeof score.percent !== 'number' || score.percent < 0 || score.percent > 101.0) {
			rejected.push({ score, reason: `Invalid percent value: ${score.percent}` });
			continue;
		}

		if (
			!score.judgements ||
			typeof score.judgements.pcrit !== 'number' ||
			typeof score.judgements.perfect !== 'number' ||
			typeof score.judgements.great !== 'number' ||
			typeof score.judgements.good !== 'number' ||
			typeof score.judgements.miss !== 'number'
		) {
			rejected.push({
				score,
				reason: 'Missing or invalid judgement counts.'
			});
			continue;
		}

		const { pcrit, perfect, great, good, miss } = score.judgements;
		if (pcrit < 0 || perfect < 0 || great < 0 || good < 0 || miss < 0) {
			rejected.push({ score, reason: 'Judgement values cannot be negative.' });
			continue;
		}

		let musicId: number | undefined;

		if (score.matchType === 'inGameID' || score.matchType === 'songID') {
			musicId = parseInt(score.identifier);
		} else if (score.matchType === 'songTitle') {
			musicId = titleMap.get(score.identifier);
		}

		if (!musicId) {
			rejected.push({ score, reason: `Unrecognized music identifier: ${score.identifier}` });
			continue;
		}

		const difficultyId = getDifficultyId(score.difficulty);
		if (difficultyId === -1) {
			rejected.push({
				score,
				reason: `Unrecognized or unsupported difficulty: ${score.difficulty}`
			});
			continue;
		}

		const chartId = chartMap.get(`${musicId}-${difficultyId}`);
		if (!chartId) {
			rejected.push({
				score,
				reason: `Chart not found in database for musicId ${musicId} and difficulty ${score.difficulty}`
			});
			continue;
		}

		const dxScore = pcrit * 3 + perfect * 2 + great * 1;

		validInserts.push({
			userId: marsUser.id,
			chartId: chartId,
			achievement: score.percent,
			dxScore,
			judgeCritperfect: pcrit.toString(),
			judgePerfect: perfect.toString(),
			judgeGreat: great.toString(),
			judgeGood: good.toString(),
			playedAt: score.timeAchieved ? new Date(score.timeAchieved) : null,
			playLamp: parseLamp(score.lamp),
			syncLamp: 'UNKNOWN'
		});
	}

	let importedCount = 0;
	const CHUNK_SIZE = 50;

	for (let i = 0; i < validInserts.length; i += CHUNK_SIZE) {
		const chunk = validInserts.slice(i, i + CHUNK_SIZE);
		await Promise.all(chunk.map((insert) => userUpsertScore(insert)));
		importedCount += chunk.length;
	}

	return json({
		success: true,
		importedCount,
		rejectedCount: rejected.length,
		totalCount: body.scores.length,
		rejected
	});
};
