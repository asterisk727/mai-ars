import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUsersRankedByStdRating } from '$lib/server/scores';

export const GET: RequestHandler = async () => {
	const rankings = await getUsersRankedByStdRating();

	return json({
		ratingSystem: 'STD',
		count: rankings.length,
		rankings: rankings.map((entry, index) => ({
			rank: index + 1,
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
