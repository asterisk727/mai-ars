import type { PageServerLoad } from './$types';

export type StdRankingEntry = {
	rank: number;
	username: string | null;
	displayUsername: string | null;
	name: string;
	best50RatingStd: number;
};

export const load = (async ({ fetch }) => {
	const response = await fetch('/api/ranking/std');

	if (!response.ok) {
		return {
			ranking: [] as StdRankingEntry[]
		};
	}

	const data = (await response.json()) as {
		rankings: StdRankingEntry[];
	};

	return {
		ranking: data.rankings
	};
}) satisfies PageServerLoad;
