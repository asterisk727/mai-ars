import { scores } from '$lib/server/db/schema';

type Score = typeof scores.$inferSelect;

export function calculateRatingStd(score: Score) {
	return 0; //TODO
}
export function calculateRatingDx(score: Score) {
	return 0; //TODO
}
