import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getChartLeaderboardInfo,
	getChartPersonalBestsStd,
	getChartPersonalBestsStdCount
} from '$lib/server/scores';
import { getChartTypeByMusicId } from '$lib/util/charts';
import { PAGE_SIZE, getPaginationMeta, parsePageParam } from '$lib/util/pagination';

export type ChartLeaderboardEntry = {
	rank: number;
	username: string | null;
	displayUsername: string | null;
	name: string;
	achievement: number;
	dxScore: number;
	rating: number;
	updatedAt: Date;
};

export const load = (async ({ params, url }) => {
	const chartId = Number.parseInt(params.cid, 10);

	if (!Number.isFinite(chartId)) {
		throw error(400, 'Invalid chart id');
	}

	const chart = await getChartLeaderboardInfo(chartId);

	if (!chart) {
		throw error(404, 'Chart not found');
	}

	const totalItems = await getChartPersonalBestsStdCount(chartId);
	const pagination = getPaginationMeta(
		totalItems,
		parsePageParam(url.searchParams.get('page')),
		PAGE_SIZE
	);

	const rows = await getChartPersonalBestsStd(chartId, {
		limit: PAGE_SIZE,
		offset: pagination.offset
	});
	const leaderboard = rows.map((entry, index) => ({
		rank: pagination.offset + index + 1,
		...entry
	}));

	return {
		chart: {
			...chart,
			chartType: getChartTypeByMusicId(chart.musicId)
		},
		pagination,
		leaderboard: leaderboard as ChartLeaderboardEntry[]
	};
}) satisfies PageServerLoad;
