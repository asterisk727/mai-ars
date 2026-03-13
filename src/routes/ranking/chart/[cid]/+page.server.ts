import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getChartLeaderboardInfo,
	getChartPersonalBestsStd,
	getChartPersonalBestsStdCount
} from '$lib/server/scores';
import { getChartType } from '$lib/server/charts';
import { getPaginationMeta, parsePageParam } from '$lib/util/pagination';

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
	const chartType = await getChartType(chartId);

	if (!chart) {
		throw error(404, 'Chart not found');
	}

	const pageSize = 50;
	const totalItems = await getChartPersonalBestsStdCount(chartId);
	const pagination = getPaginationMeta(
		totalItems,
		parsePageParam(url.searchParams.get('page')),
		pageSize
	);

	const rows = await getChartPersonalBestsStd(chartId, {
		limit: pageSize,
		offset: pagination.offset
	});
	const leaderboard = rows.map((entry, index) => ({
		rank: pagination.offset + index + 1,
		...entry
	}));

	return {
		chart: {
			...chart,
			chartType
		},
		pagination,
		leaderboard: leaderboard as ChartLeaderboardEntry[]
	};
}) satisfies PageServerLoad;
