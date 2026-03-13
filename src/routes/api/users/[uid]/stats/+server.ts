import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMarsUserByAuthId, getUserByUsername } from '$lib/server/users';
import { getUserRatingSummaryStd, getUserTotalPlays } from '$lib/server/scores';

export const GET: RequestHandler = async ({ params }) => {
	const profile = await getUserByUsername(params.uid);

	if (!profile) {
		return error(404, 'User not found');
	}

	const marsUser = await getMarsUserByAuthId(profile.id);

	if (!marsUser) {
		return json({
			username: profile.username,
			best50RatingStd: 0,
			totalPlays: 0
		});
	}

	const [ratingSummaryStd, totalPlays] = await Promise.all([
		getUserRatingSummaryStd(marsUser.id),
		getUserTotalPlays(marsUser.id)
	]);

	return json({
		username: profile.username,
		best50RatingStd: ratingSummaryStd?.best50Rating ?? 0,
		totalPlays
	});
};
