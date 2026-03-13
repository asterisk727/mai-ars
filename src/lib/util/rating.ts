import { scores } from '$lib/server/db/schema';

import { getChartConstant } from '$lib/server/charts';

type Score = typeof scores.$inferSelect;

export type RatingType = 'STD' | 'DX';

type RatingMultRow = [number, number, string];

const ratingMultTable: Record<RatingType, RatingMultRow[]> = {
	STD: [
		[100.5, 22.4, 'SSS+'],
		[100.0, 21.6, 'SSS'],
		[99.5, 21.1, 'SSp'],
		[99, 20.8, 'SS'],
		[98, 20.3, 'Sp'],
		[97, 20, 'S'],
		[94, 16.8, 'AAA'],
		[90, 15.2, 'AA'],
		[80, 13.6, 'A'],
		[75, 12, 'BBB'],
		[70, 11.2, 'BB'],
		[60, 9.6, 'B'],
		[50, 8, 'C'],
		[40, 6.4, 'D'],
		[30, 4.8, 'D'],
		[20, 3.2, 'D'],
		[10, 1.6, 'D'],
		[0, 0, 'D']
	],
	DX: [[1000, 1, 'X']]
};

function getScoreMult(score: number, ratingType: RatingType) {
	const table = ratingMultTable[ratingType];
	for (const [threshold, mult] of table) {
		if (score >= threshold) {
			return mult;
		}
	}
}

export function getLetterGrade(score: number, ratingType: RatingType) {
	const table = ratingMultTable[ratingType];
	for (const [threshold, , grade] of table) {
		if (score >= threshold) {
			return grade;
		}
	}
}

export async function calculateRatingStd(score: Score) {
	return (
		score.achievement *
		(getScoreMult(score.achievement, 'STD') ?? 0) *
		(await getChartConstant(score.chartId))
	);
}
export async function calculateRatingDx(score: Score) {
	return score.dxScore; //TODO
}
