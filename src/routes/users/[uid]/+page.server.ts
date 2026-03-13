import {
	getUserRatingSummaryStd,
	getUserTotalPlays,
	userGetBestScoresStd
} from '$lib/server/scores';
import { getMarsUserByAuthId, getUserByUsername } from '$lib/server/users';
import { auth } from '$lib/server/auth';
import { getLetterGrade } from '$lib/util/rating';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type ProfilePageData = {
	profile: {
		username: string | null;
		displayUsername: string | null;
		name: string;
		image: string | null;
		createdAt: Date;
	};
	isOwner: boolean;
	best50RatingStd: number;
	totalPlays: number;
	best50Std: {
		chartId: number;
		musicId: number;
		title: string;
		difficultyId: number;
		level: number;
		achievement: number;
		dxScore: number;
		rating: number;
		letterGrade: string;
		updatedAt: Date;
	}[];
};

export const load = (async ({ params, request }) => {
	const profile = await getUserByUsername(params.uid);

	if (!profile) {
		error(404, 'User not found');
	}

	const session = await auth.api.getSession({ headers: request.headers });
	const isOwner = session?.user?.username === profile.username;

	const marsUser = await getMarsUserByAuthId(profile.id);
	const [ratingSummaryStd, totalPlays] = marsUser
		? await Promise.all([getUserRatingSummaryStd(marsUser.id), getUserTotalPlays(marsUser.id)])
		: [null, 0];
	const best50StdRows = marsUser
		? await userGetBestScoresStd(marsUser.id, { ratingSystem: 'STD', limit: 50 })
		: [];
	const best50Std = best50StdRows.map((row) => ({
		...row,
		letterGrade: getLetterGrade(row.achievement, 'STD') ?? 'D'
	}));

	return {
		profile: {
			username: profile.username,
			displayUsername: profile.displayUsername,
			name: profile.name,
			image: profile.image,
			createdAt: profile.createdAt
		},
		isOwner,
		best50RatingStd: ratingSummaryStd?.best50Rating ?? 0,
		totalPlays,
		best50Std
	};
}) satisfies PageServerLoad<ProfilePageData>;
