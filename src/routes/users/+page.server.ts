import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request }) => {
	const session = await auth.api.getSession({ headers: request.headers });

	if (session?.user) {
		return redirect(302, '/users/account/'); //TODO: redirect to user profile page instead of account page
	} else {
		return redirect(302, '/users/account/');
	}
};
