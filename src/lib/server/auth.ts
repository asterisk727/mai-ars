import { betterAuth } from 'better-auth/minimal';
import { username } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { marsUser } from '$lib/server/db/schema';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: { enabled: true },
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60
		}
	},
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await db.insert(marsUser).values({
						userId: user.id,
						displayName: user.name
					});
				}
			}
		}
	},
	plugins: [username(), sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});
