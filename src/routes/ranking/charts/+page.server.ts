import type { PageServerLoad } from './$types';
import { getAllChartsPaginated, getChartPlayCount } from '$lib/server/charts';
import { type ChartType } from '$lib/util/charts';
import { PAGE_SIZE, getPaginationMeta, parsePageParam } from '$lib/util/pagination';

export type ChartBrowseEntry = {
	chartId: number;
	musicId: number;
	difficultyId: number;
	chartConstant: number;
	chartDesigner: string;
	songName: string;
	songArtist: string;
	totalScores: number;
	chartType: ChartType;
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
