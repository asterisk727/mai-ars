import { db } from '$lib/server/db';
import { chartDb } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function getChartConstant(chartId: number) {
	const result = await db
		.select({ lv: chartDb.lv })
		.from(chartDb)
		.where(eq(chartDb.chartId, chartId))
		.get();
	return result?.lv ?? 0;
}
