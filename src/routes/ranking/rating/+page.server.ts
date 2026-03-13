import type { PageServerLoad } from './$types';
import type { PaginationMeta } from '$lib/util/pagination';

export type StdRankingEntry = {
	rank: number;
	userId: string;
	username: string | null;
	displayUsername: string | null;
	name: string;
	best50RatingStd: number;
};

export const load = (async ({ fetch, url }) => {
	const page = url.searchParams.get('page') ?? '1';
	const response = await fetch(`/api/ranking/std?page=${page}`);

	if (!response.ok) {
		return {
			ranking: [] as StdRankingEntry[],
			pagination: {
				page: 1,
				pageSize: 50,
				totalItems: 0,
				totalPages: 1,
				offset: 0,
				hasPrev: false,
				hasNext: false
			} as PaginationMeta
		};
	}

	const data = (await response.json()) as {
		rankings: StdRankingEntry[];
		pagination: PaginationMeta;
	};

	return {
		ranking: data.rankings,
		pagination: data.pagination
	};
}) satisfies PageServerLoad;
