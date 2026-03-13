import { db } from '$lib/server/db';
import { chartDb, musicDb, scores } from '$lib/server/db/schema';
import { asc, count, desc, eq } from 'drizzle-orm';

export type ChartType = 'STANDARD' | 'DELUXE';

export async function getChartType(chartId: number): Promise<ChartType> {
	const result = await db
		.select({ musicId: chartDb.musicId })
		.from(chartDb)
		.where(eq(chartDb.chartId, chartId))
		.get();
	return result && result.musicId > 9999 ? 'DELUXE' : 'STANDARD';
}

export async function getChartConstant(chartId: number) {
	const result = await db
		.select({ lv: chartDb.lv })
		.from(chartDb)
		.where(eq(chartDb.chartId, chartId))
		.get();
	return result?.lv ?? 0;
}

export async function getAllCharts() {
	return db
		.select({
			chartId: chartDb.chartId,
			musicId: chartDb.musicId,
			difficultyId: chartDb.difficultyId,
			chartConstant: chartDb.lv,
			chartDesigner: chartDb.notesDesigner,
			songName: musicDb.name,
			songArtist: musicDb.artist,
			totalScores: count(scores.scoreId)
		})
		.from(chartDb)
		.innerJoin(musicDb, eq(chartDb.musicId, musicDb.musicId))
		.leftJoin(scores, eq(chartDb.chartId, scores.chartId))
		.groupBy(
			chartDb.chartId,
			chartDb.musicId,
			chartDb.difficultyId,
			chartDb.lv,
			chartDb.notesDesigner,
			musicDb.name,
			musicDb.artist
		)
		.orderBy(desc(count(scores.scoreId)), asc(chartDb.musicId), asc(chartDb.difficultyId));
}

export async function getAllChartsPaginated(options: { limit: number; offset: number }) {
	let query = db
		.select({
			chartId: chartDb.chartId,
			musicId: chartDb.musicId,
			difficultyId: chartDb.difficultyId,
			chartConstant: chartDb.lv,
			chartDesigner: chartDb.notesDesigner,
			songName: musicDb.name,
			songArtist: musicDb.artist,
			totalScores: count(scores.scoreId)
		})
		.from(chartDb)
		.innerJoin(musicDb, eq(chartDb.musicId, musicDb.musicId))
		.leftJoin(scores, eq(chartDb.chartId, scores.chartId))
		.groupBy(
			chartDb.chartId,
			chartDb.musicId,
			chartDb.difficultyId,
			chartDb.lv,
			chartDb.notesDesigner,
			musicDb.name,
			musicDb.artist
		)
		.orderBy(desc(count(scores.scoreId)), asc(chartDb.musicId), asc(chartDb.difficultyId))
		.$dynamic();

	query = query.limit(options.limit).offset(options.offset);

	return query;
}

export async function getChartPlayCount() {
	const result = await db.select({ total: count() }).from(chartDb).get();
	return result?.total ?? 0;
}
