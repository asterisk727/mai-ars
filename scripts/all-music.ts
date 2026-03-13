/*

    maimai All-Music generator
    Run this with Bun, with all options in a folder named `option`
    It will populate the database according to `src/lib/server/db/schema.ts`

*/

import { XMLParser } from 'fast-xml-parser';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { musicDb, chartDb } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in .env');

const client = createClient({ url: process.env.DATABASE_URL });
const db = drizzle(client);

const optionDir = path.join(__dirname, 'Option');
const options = fs
	.readdirSync(optionDir)
	.filter((f) => fs.statSync(path.join(optionDir, f)).isDirectory());

function getXmlContents(file: string) {
	if (!fs.existsSync(file)) return;
	if (!fs.statSync(file).isFile()) return;
	const data = fs.readFileSync(file).toString();
	const parser = new XMLParser();
	return parser.parse(data);
}

async function main() {
	const allExistingCharts = await db.select().from(chartDb);
	const chartMap = new Map(
		allExistingCharts.map((c) => [`${c.musicId}-${c.difficultyId}`, c.chartId])
	);

	for (const option of options) {
		const spinner = ora(`Processing ${option}`).start();
		if (fs.existsSync(path.join(optionDir, option, 'music'))) {
			const folders = fs
				.readdirSync(path.join(optionDir, option, 'music'))
				.filter((v) => fs.statSync(path.join(optionDir, option, 'music', v)).isDirectory());

			for (const songFolder of folders) {
				const xmlData = getXmlContents(
					path.join(optionDir, option, 'music', songFolder, 'Music.xml')
				);
				if (!xmlData) continue;

				const musicId = parseInt(xmlData.MusicData.name.id);
				const utageKanjiName =
					xmlData.MusicData.utageKanjiName?.str ?? xmlData.MusicData.utageKanjiName ?? '';

				// Upsert Music
				await db
					.insert(musicDb)
					.values({
						musicId,
						name: xmlData.MusicData.name.str,
						ver: xmlData.MusicData.releaseTagName.str,
						artist: xmlData.MusicData.artistName.str,
						genre: xmlData.MusicData.genreName.str ?? 'Unknown'
					})
					.onConflictDoUpdate({
						target: musicDb.musicId,
						set: {
							name: xmlData.MusicData.name.str,
							ver: xmlData.MusicData.releaseTagName.str,
							artist: xmlData.MusicData.artistName.str,
							genre: xmlData.MusicData.genreName.str ?? 'Unknown'
						}
					});

				const notesData = xmlData.MusicData.notesData.Notes;
				const notesArray = Array.isArray(notesData) ? notesData : [notesData];

				for (let i = 0; i < notesArray.length; i++) {
					const noteInfo = notesArray[i];
					if (!noteInfo || !noteInfo.isEnable) continue;

					const lv = parseInt(noteInfo.level) + parseInt(noteInfo.levelDecimal ?? 0) / 10;
					const notesDesigner = noteInfo.notesDesigner?.str ?? '';

					const chartKey = `${musicId}-${i}`;
					if (chartMap.has(chartKey)) {
						// Update existing chart
						const chartId = chartMap.get(chartKey)!;
						await db
							.update(chartDb)
							.set({ lv, utageKanjiName, notesDesigner })
							.where(eq(chartDb.chartId, chartId));
					} else {
						// Insert new chart
						const [inserted] = await db
							.insert(chartDb)
							.values({
								musicId,
								difficultyId: i,
								lv,
								utageKanjiName,
								notesDesigner
							})
							.returning({ chartId: chartDb.chartId });

						chartMap.set(chartKey, inserted.chartId);
					}
				}
			}
		}
		spinner.stop();
	}

	console.log('Database sync complete!');
	process.exit(0);
}

main().catch((err) => {
	console.error('Error during processing:', err);
	process.exit(1);
});
