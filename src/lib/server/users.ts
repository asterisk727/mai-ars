import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { marsUsers, user } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';

export async function getUserFromSession(headers: Headers) {
	const session = await auth.api.getSession({ headers });
	if (!session?.user) return null;
	return session.user;
}

export async function getUserByUsername(username: string) {
	const result = await db.select().from(user).where(eq(user.username, username)).get();
	return result ?? null;
}

export async function getMarsUserByAuthId(authUserId: string) {
	const result = await db.select().from(marsUsers).where(eq(marsUsers.authId, authUserId)).get();
	return result ?? null;
}

export async function getMarsUserById(id: string) {
	const result = await db.select().from(marsUsers).where(eq(marsUsers.id, id)).get();
	return result ?? null;
}
