import { getUserByUsername } from '$lib/server/users';
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
};

export const load = (async ({ params }) => {
	const profile = await getUserByUsername(params.uid);

	if (!profile) {
		error(404, 'User not found');
	}

	return {
		profile: {
			username: profile.username,
			displayUsername: profile.displayUsername,
			name: profile.name,
			image: profile.image,
			createdAt: profile.createdAt
		}
	};
}) satisfies PageServerLoad<ProfilePageData>;
