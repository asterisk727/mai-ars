import { sql } from 'drizzle-orm';
import {
	sqliteTable,
	text,
	integer,
	real,
	index,
	primaryKey,
	check
} from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

import { scorePlayLamps, scoreSyncLamps } from '../../types/score-lamps';

export * from './auth.schema';

function sqliteStringLiteral(value: string) {
	return `'${value.replaceAll("'", "''")}'`;
}

function sqliteEnumList(values: readonly string[]) {
	return sql.raw(values.map(sqliteStringLiteral).join(', '));
}

export const marsUsers = sqliteTable('mars_users', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	authId: text('auth_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' })
});

export const musicDb = sqliteTable('music_db', {
	musicId: integer('music_id').primaryKey(),
	name: text('name').notNull(),
	ver: text('ver').notNull(),
	artist: text('artist').notNull(),
	utageKanjiName: text('utage_kanji_name').notNull().default(''),
	genre: text('genre').notNull()
});

export const chartDb = sqliteTable(
	'chart_db',
	{
		chartId: integer('chart_id').primaryKey({ autoIncrement: true }),
		musicId: integer('music_id')
			.notNull()
			.references(() => musicDb.musicId, { onDelete: 'cascade' }),
		difficultyId: integer('difficulty_id').notNull(),
		lv: real('lv').notNull(),
		notesDesigner: text('notes_designer').notNull().default('')
	},
	(table) => [
		index('chart_db_music_id_idx').on(table.musicId),
		index('chart_db_music_id_difficulty_id_idx').on(table.musicId, table.difficultyId)
	]
);

export const scores = sqliteTable(
	'scores',
	{
		scoreId: text('score_id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text('user_id')
			.notNull()
			.references(() => marsUsers.id, { onDelete: 'cascade' }),
		chartId: integer('chart_id')
			.notNull()
			.references(() => chartDb.chartId, { onDelete: 'cascade' }),
		achievement: real('achievement').notNull(),
		dxScore: integer('dx_score').notNull(),
		judgeCritperfect: text('judge_critperfect'),
		judgePerfect: text('judge_perfect'),
		judgeGreat: text('judge_great'),
		judgeGood: text('judge_good'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		playedAt: integer('played_at', { mode: 'timestamp_ms' }),
		playLamp: text('play_lamp', { enum: scorePlayLamps }).notNull(),
		syncLamp: text('sync_lamp', { enum: scoreSyncLamps }).notNull()
	},
	(table) => [
		index('scores_user_id_idx').on(table.userId),
		index('scores_chart_id_idx').on(table.chartId),
		index('scores_user_id_chart_id_idx').on(table.userId, table.chartId),
		check('scores_lamp_check', sql`${table.playLamp} IN (${sqliteEnumList(scorePlayLamps)})`),
		check('scores_sync_lamp_check', sql`${table.syncLamp} IN (${sqliteEnumList(scoreSyncLamps)})`)
	]
);

export const userChartBestStd = sqliteTable(
	'user_chart_best_std',
	{
		userId: text('user_id')
			.notNull()
			.references(() => marsUsers.id, { onDelete: 'cascade' }),
		chartId: integer('chart_id')
			.notNull()
			.references(() => chartDb.chartId, { onDelete: 'cascade' }),
		sourceScoreId: text('source_score_id')
			.notNull()
			.references(() => scores.scoreId, { onDelete: 'cascade' }),
		previousBestScoreId: text('previous_best_score_id').references(() => scores.scoreId, {
			onDelete: 'set null'
		}),
		achievement: real('achievement').notNull(),
		dxScore: integer('dx_score').notNull(),
		rating: real('rating').notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.chartId] }),
		index('user_chart_best_std_chart_id_rating_idx').on(table.chartId, table.rating),
		index('user_chart_best_std_user_id_rating_idx').on(table.userId, table.rating)
	]
);

export const userChartBestDx = sqliteTable(
	'user_chart_best_dx',
	{
		userId: text('user_id')
			.notNull()
			.references(() => marsUsers.id, { onDelete: 'cascade' }),
		chartId: integer('chart_id')
			.notNull()
			.references(() => chartDb.chartId, { onDelete: 'cascade' }),
		sourceScoreId: text('source_score_id')
			.notNull()
			.references(() => scores.scoreId, { onDelete: 'cascade' }),
		previousBestScoreId: text('previous_best_score_id').references(() => scores.scoreId, {
			onDelete: 'set null'
		}),
		achievement: real('achievement').notNull(),
		dxScore: integer('dx_score').notNull(),
		rating: real('rating').notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.chartId] }),
		index('user_chart_best_dx_chart_id_rating_idx').on(table.chartId, table.rating),
		index('user_chart_best_dx_user_id_rating_idx').on(table.userId, table.rating)
	]
);

export const userRatingSummaryStd = sqliteTable(
	'user_rating_summary_std',
	{
		userId: text('user_id')
			.primaryKey()
			.references(() => marsUsers.id, { onDelete: 'cascade' }),
		best50Rating: real('best50_rating').notNull().default(0),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('user_rating_summary_std_best50_rating_idx').on(table.best50Rating)]
);

export const userRatingSummaryDx = sqliteTable(
	'user_rating_summary_dx',
	{
		userId: text('user_id')
			.primaryKey()
			.references(() => marsUsers.id, { onDelete: 'cascade' }),
		best50Rating: real('best50_rating').notNull().default(0),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull()
	},
	(table) => [index('user_rating_summary_dx_best50_rating_idx').on(table.best50Rating)]
);
