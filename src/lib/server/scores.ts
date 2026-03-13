import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	scores,
	userChartBestDx,
	userChartBestStd,
	userRatingSummaryDx,
	userRatingSummaryStd,
	chartDb,
	musicDb,
	marsUsers,
	user
} from '$lib/server/db/schema';

import { calculateRatingStd, calculateRatingDx } from '$lib/util/rating';
import type { RatingType } from '$lib/util/rating';

type ScoreRow = typeof scores.$inferSelect;
type ScoreInsert = typeof scores.$inferInsert;
type UserChartBestRowStd = typeof userChartBestStd.$inferSelect;
type UserChartBestRowDx = typeof userChartBestDx.$inferSelect;

type ScoreQueryOptions = {
	chartId?: number;
	limit?: number;
	offset?: number;
};

type BestScoreQueryOptions = ScoreQueryOptions & {
	ratingSystem?: RatingType;
};

type RefreshBestResult<TBest> = {
	best: TBest | null;
	changed: boolean;
};

function isScoreBetterStd(score: ScoreRow, currentBest: UserChartBestRowStd | undefined) {
	if (!currentBest) return true;
	if (score.achievement !== currentBest.achievement)
		return score.achievement > currentBest.achievement;
	if (score.dxScore !== currentBest.dxScore) return score.dxScore > currentBest.dxScore;
	return false;
}

function isScoreBetterDx(score: ScoreRow, currentBest: UserChartBestRowDx | undefined) {
	if (!currentBest) return true;
	if (score.dxScore !== currentBest.dxScore) return score.dxScore > currentBest.dxScore;
	if (score.achievement !== currentBest.achievement)
		return score.achievement > currentBest.achievement;
	return false;
}

export async function getUserRatingSummaryStd(userId: string) {
	return db
		.select()
		.from(userRatingSummaryStd)
		.where(eq(userRatingSummaryStd.userId, userId))
		.get();
}

export async function getUserRatingSummaryDx(userId: string) {
	return db.select().from(userRatingSummaryDx).where(eq(userRatingSummaryDx.userId, userId)).get();
}

export async function getUsersRankedByStdRating(options: { limit?: number; offset?: number } = {}) {
	let query = db
		.select({
			userId: userRatingSummaryStd.userId,
			best50RatingStd: userRatingSummaryStd.best50Rating,
			updatedAt: userRatingSummaryStd.updatedAt,
			username: user.username,
			displayUsername: user.displayUsername,
			name: user.name,
			image: user.image
		})
		.from(userRatingSummaryStd)
		.innerJoin(marsUsers, eq(userRatingSummaryStd.userId, marsUsers.id))
		.innerJoin(user, eq(marsUsers.authId, user.id))
		.orderBy(desc(userRatingSummaryStd.best50Rating))
		.$dynamic();

	if (options.offset !== undefined) query = query.offset(options.offset);
	if (options.limit !== undefined) query = query.limit(options.limit);

	return query;
}

// Todo: DX rating equivalent

export async function getUsersRankedByStdRatingCount() {
	const result = await db.select({ total: count() }).from(userRatingSummaryStd).get();
	return result?.total ?? 0;
}

// Todo: DX rating equivalent

export async function getChartLeaderboardInfo(chartId: number) {
	return db
		.select({
			chartId: chartDb.chartId,
			musicId: chartDb.musicId,
			difficultyId: chartDb.difficultyId,
			chartConstant: chartDb.lv,
			chartDesigner: chartDb.notesDesigner,
			songName: musicDb.name,
			songArtist: musicDb.artist
		})
		.from(chartDb)
		.innerJoin(musicDb, eq(chartDb.musicId, musicDb.musicId))
		.where(eq(chartDb.chartId, chartId))
		.get();
}

export async function getChartPersonalBestsStd(
	chartId: number,
	options: { limit?: number; offset?: number } = {}
) {
	let query = db
		.select({
			userId: userChartBestStd.userId,
			achievement: userChartBestStd.achievement,
			dxScore: userChartBestStd.dxScore,
			rating: userChartBestStd.rating,
			updatedAt: userChartBestStd.updatedAt,
			username: user.username,
			displayUsername: user.displayUsername,
			name: user.name,
			image: user.image
		})
		.from(userChartBestStd)
		.innerJoin(marsUsers, eq(userChartBestStd.userId, marsUsers.id))
		.innerJoin(user, eq(marsUsers.authId, user.id))
		.where(eq(userChartBestStd.chartId, chartId))
		.orderBy(desc(userChartBestStd.achievement), desc(userChartBestStd.dxScore))
		.$dynamic();

	if (options.offset !== undefined) query = query.offset(options.offset);
	if (options.limit !== undefined) query = query.limit(options.limit);

	return query;
}

// Todo: DX rating equivalent

export async function getChartPersonalBestsStdCount(chartId: number) {
	const result = await db
		.select({ total: count() })
		.from(userChartBestStd)
		.where(eq(userChartBestStd.chartId, chartId))
		.get();

	return result?.total ?? 0;
}

// Todo: DX rating equivalent

export async function getUserTotalPlays(userId: string) {
	const result = await db
		.select({ totalPlays: count() })
		.from(scores)
		.where(eq(scores.userId, userId))
		.get();

	return result?.totalPlays ?? 0;
}

async function refreshUserChartBestStd(
	score: ScoreRow
): Promise<RefreshBestResult<UserChartBestRowStd>> {
	const userId = score.userId;
	const chartId = score.chartId;
	const currentBest = await db
		.select()
		.from(userChartBestStd)
		.where(and(eq(userChartBestStd.userId, userId), eq(userChartBestStd.chartId, chartId)))
		.get();

	if (!isScoreBetterStd(score, currentBest)) {
		return {
			best: currentBest ?? null,
			changed: false
		};
	}

	const scoreRating = await calculateRatingStd(score);

	await db
		.insert(userChartBestStd)
		.values({
			userId,
			chartId,
			sourceScoreId: score.scoreId,
			previousBestScoreId: currentBest?.sourceScoreId ?? null,
			achievement: score.achievement,
			dxScore: score.dxScore,
			rating: scoreRating
		})
		.onConflictDoUpdate({
			target: [userChartBestStd.userId, userChartBestStd.chartId],
			set: {
				sourceScoreId: score.scoreId,
				previousBestScoreId: currentBest?.sourceScoreId ?? null,
				achievement: score.achievement,
				dxScore: score.dxScore,
				rating: scoreRating,
				updatedAt: new Date()
			}
		});

	return {
		best:
			(await db
				.select()
				.from(userChartBestStd)
				.where(and(eq(userChartBestStd.userId, userId), eq(userChartBestStd.chartId, chartId)))
				.get()) ?? null,
		changed: true
	};
}

async function refreshUserChartBestDx(
	score: ScoreRow
): Promise<RefreshBestResult<UserChartBestRowDx>> {
	const userId = score.userId;
	const chartId = score.chartId;
	const currentBest = await db
		.select()
		.from(userChartBestDx)
		.where(and(eq(userChartBestDx.userId, userId), eq(userChartBestDx.chartId, chartId)))
		.get();

	if (!isScoreBetterDx(score, currentBest)) {
		return {
			best: currentBest ?? null,
			changed: false
		};
	}

	const scoreRating = await calculateRatingDx(score);

	await db
		.insert(userChartBestDx)
		.values({
			userId,
			chartId,
			sourceScoreId: score.scoreId,
			previousBestScoreId: currentBest?.sourceScoreId ?? null,
			achievement: score.achievement,
			dxScore: score.dxScore,
			rating: scoreRating
		})
		.onConflictDoUpdate({
			target: [userChartBestDx.userId, userChartBestDx.chartId],
			set: {
				sourceScoreId: score.scoreId,
				previousBestScoreId: currentBest?.sourceScoreId ?? null,
				achievement: score.achievement,
				dxScore: score.dxScore,
				rating: scoreRating,
				updatedAt: new Date()
			}
		});

	return {
		best:
			(await db
				.select()
				.from(userChartBestDx)
				.where(and(eq(userChartBestDx.userId, userId), eq(userChartBestDx.chartId, chartId)))
				.get()) ?? null,
		changed: true
	};
}

async function refreshUserRatingSummaryStd(userId: string) {
	const bestScores = await db
		.select({ rating: userChartBestStd.rating })
		.from(userChartBestStd)
		.where(eq(userChartBestStd.userId, userId))
		.orderBy(desc(userChartBestStd.rating))
		.limit(50);

	const best50Rating = bestScores.reduce((sum, score) => sum + score.rating, 0);

	await db
		.insert(userRatingSummaryStd)
		.values({ userId, best50Rating })
		.onConflictDoUpdate({
			target: userRatingSummaryStd.userId,
			set: {
				best50Rating,
				updatedAt: new Date()
			}
		});

	return db
		.select()
		.from(userRatingSummaryStd)
		.where(eq(userRatingSummaryStd.userId, userId))
		.get();
}

async function refreshUserRatingSummaryDx(userId: string) {
	const bestScores = await db
		.select({ rating: userChartBestDx.rating })
		.from(userChartBestDx)
		.where(eq(userChartBestDx.userId, userId))
		.orderBy(desc(userChartBestDx.rating))
		.limit(50);

	const best50Rating = bestScores.reduce((sum, score) => sum + score.rating, 0);

	await db
		.insert(userRatingSummaryDx)
		.values({ userId, best50Rating })
		.onConflictDoUpdate({
			target: userRatingSummaryDx.userId,
			set: {
				best50Rating,
				updatedAt: new Date()
			}
		});

	return db.select().from(userRatingSummaryDx).where(eq(userRatingSummaryDx.userId, userId)).get();
}

export async function userUpsertScore(input: ScoreInsert) {
	const insertedScore = await db
		.insert(scores)
		.values({
			userId: input.userId,
			chartId: input.chartId,
			achievement: input.achievement,
			dxScore: input.dxScore,
			judgeCritperfect: input.judgeCritperfect ?? null,
			judgePerfect: input.judgePerfect ?? null,
			judgeGreat: input.judgeGreat ?? null,
			judgeGood: input.judgeGood ?? null,
			playedAt: input.playedAt ?? null,
			playLamp: input.playLamp,
			syncLamp: input.syncLamp
		})
		.returning()
		.get();

	const stdBestResult = await refreshUserChartBestStd(insertedScore);
	const dxBestResult = await refreshUserChartBestDx(insertedScore);

	const stdSummary = stdBestResult.changed
		? await refreshUserRatingSummaryStd(input.userId)
		: ((await getUserRatingSummaryStd(input.userId)) ?? null);
	const dxSummary = dxBestResult.changed
		? await refreshUserRatingSummaryDx(input.userId)
		: ((await getUserRatingSummaryDx(input.userId)) ?? null);

	return {
		score: insertedScore,
		stdBest: stdBestResult.best,
		dxBest: dxBestResult.best,
		stdSummary,
		dxSummary
	};
}

export async function userGetBestScores(userId: string, options: BestScoreQueryOptions = {}) {
	const { ratingSystem = 'STD', chartId, limit, offset } = options;

	if (ratingSystem === 'DX') {
		let query = db
			.select()
			.from(userChartBestDx)
			.where(
				chartId === undefined
					? eq(userChartBestDx.userId, userId)
					: and(eq(userChartBestDx.userId, userId), eq(userChartBestDx.chartId, chartId))
			)
			.orderBy(
				desc(userChartBestDx.rating),
				desc(userChartBestDx.achievement),
				desc(userChartBestDx.dxScore)
			)
			.$dynamic();

		if (offset !== undefined) query = query.offset(offset);
		if (limit !== undefined) query = query.limit(limit);

		return query;
	}

	let query = db
		.select()
		.from(userChartBestStd)
		.where(
			chartId === undefined
				? eq(userChartBestStd.userId, userId)
				: and(eq(userChartBestStd.userId, userId), eq(userChartBestStd.chartId, chartId))
		)
		.orderBy(
			desc(userChartBestStd.rating),
			desc(userChartBestStd.achievement),
			desc(userChartBestStd.dxScore)
		)
		.$dynamic();

	if (offset !== undefined) query = query.offset(offset);
	if (limit !== undefined) query = query.limit(limit);

	return query;
}

export async function userGetBestScoresStdDetailed(
	userId: string,
	options: BestScoreQueryOptions = {}
) {
	const { ratingSystem = 'STD', chartId, limit = 50, offset } = options;

	if (ratingSystem === 'DX') {
		let query = db
			.select({
				chartId: userChartBestDx.chartId,
				achievement: userChartBestDx.achievement,
				dxScore: userChartBestDx.dxScore,
				rating: userChartBestDx.rating,
				updatedAt: userChartBestDx.updatedAt,
				musicId: chartDb.musicId,
				difficultyId: chartDb.difficultyId,
				level: chartDb.lv,
				title: musicDb.name
			})
			.from(userChartBestDx)
			.innerJoin(chartDb, eq(userChartBestDx.chartId, chartDb.chartId))
			.innerJoin(musicDb, eq(chartDb.musicId, musicDb.musicId))
			.where(
				chartId === undefined
					? eq(userChartBestDx.userId, userId)
					: and(eq(userChartBestDx.userId, userId), eq(userChartBestDx.chartId, chartId))
			)
			.orderBy(
				desc(userChartBestDx.rating),
				desc(userChartBestDx.achievement),
				desc(userChartBestDx.dxScore)
			)
			.$dynamic();

		if (offset !== undefined) query = query.offset(offset);
		query = query.limit(limit);

		return query;
	}

	let query = db
		.select({
			chartId: userChartBestStd.chartId,
			achievement: userChartBestStd.achievement,
			dxScore: userChartBestStd.dxScore,
			rating: userChartBestStd.rating,
			updatedAt: userChartBestStd.updatedAt,
			musicId: chartDb.musicId,
			difficultyId: chartDb.difficultyId,
			level: chartDb.lv,
			title: musicDb.name
		})
		.from(userChartBestStd)
		.innerJoin(chartDb, eq(userChartBestStd.chartId, chartDb.chartId))
		.innerJoin(musicDb, eq(chartDb.musicId, musicDb.musicId))
		.where(
			chartId === undefined
				? eq(userChartBestStd.userId, userId)
				: and(eq(userChartBestStd.userId, userId), eq(userChartBestStd.chartId, chartId))
		)
		.orderBy(
			desc(userChartBestStd.rating),
			desc(userChartBestStd.achievement),
			desc(userChartBestStd.dxScore)
		)
		.$dynamic();

	if (offset !== undefined) query = query.offset(offset);
	query = query.limit(limit);

	return query;
}

export async function userGetRecentScores(userId: string, options: ScoreQueryOptions = {}) {
	const { chartId, limit = 50, offset } = options;

	let query = db
		.select()
		.from(scores)
		.where(
			chartId === undefined
				? eq(scores.userId, userId)
				: and(eq(scores.userId, userId), eq(scores.chartId, chartId))
		)
		.orderBy(desc(scores.playedAt), desc(scores.createdAt))
		.$dynamic();

	if (offset !== undefined) query = query.offset(offset);
	query = query.limit(limit);

	return query;
}

export async function userGetAllScores(userId: string, options: ScoreQueryOptions = {}) {
	const { chartId, limit, offset } = options;

	let query = db
		.select()
		.from(scores)
		.where(
			chartId === undefined
				? eq(scores.userId, userId)
				: and(eq(scores.userId, userId), eq(scores.chartId, chartId))
		)
		.orderBy(desc(scores.createdAt))
		.$dynamic();

	if (offset !== undefined) query = query.offset(offset);
	if (limit !== undefined) query = query.limit(limit);

	return query;
}
