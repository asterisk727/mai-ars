import type { PageServerLoad } from './$types';
import { getAllChartsPaginated, getChartPlayCount } from '$lib/server/charts';
import { getPaginationMeta, parsePageParam } from '$lib/util/pagination';

const PAGE_SIZE = 50;

export type ChartBrowseEntry = {
	chartId: number;
	musicId: number;
	difficultyId: number;
	chartConstant: number;
	chartDesigner: string;
	songName: string;
	songArtist: string;
	totalScores: number;
};

export const load = (async ({ url }) => {
	const requestedPage = parsePageParam(url.searchParams.get('page'));
	const totalCharts = await getChartPlayCount();
	const pagination = getPaginationMeta(totalCharts, requestedPage, PAGE_SIZE);
	const charts = await getAllChartsPaginated({
		limit: pagination.pageSize,
		offset: pagination.offset
	});

	return {
		charts: charts as ChartBrowseEntry[],
		pagination
	};
}) satisfies PageServerLoad;
