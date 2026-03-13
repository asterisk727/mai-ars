import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUsersRankedByStdRating, getUsersRankedByStdRatingCount } from '$lib/server/scores';
import { getPaginationMeta, parsePageParam } from '$lib/util/pagination';

export const GET: RequestHandler = async ({ url }) => {
	const pageSize = 50;
	const totalItems = await getUsersRankedByStdRatingCount();
	const pagination = getPaginationMeta(
		totalItems,
		parsePageParam(url.searchParams.get('page')),
		pageSize
	);

	const rankings = await getUsersRankedByStdRating({
		limit: pageSize,
		offset: pagination.offset
	});

	return json({
		ratingSystem: 'STD',
		count: totalItems,
		pagination,
		rankings: rankings.map((entry, index) => ({
			rank: pagination.offset + index + 1,
			userId: entry.userId,
			username: entry.username,
			displayUsername: entry.displayUsername,
			name: entry.name,
			image: entry.image,
			best50RatingStd: entry.best50RatingStd,
			updatedAt: entry.updatedAt
		}))
	});
};
