CREATE TABLE `chart_db` (
	`chart_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`music_id` integer NOT NULL,
	`difficulty_id` integer NOT NULL,
	`lv` real NOT NULL,
	`utage_kanji_name` text DEFAULT '' NOT NULL,
	`notes_designer` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`music_id`) REFERENCES `music_db`(`music_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `chart_db_music_id_idx` ON `chart_db` (`music_id`);--> statement-breakpoint
CREATE INDEX `chart_db_music_id_difficulty_id_idx` ON `chart_db` (`music_id`,`difficulty_id`);--> statement-breakpoint
CREATE TABLE `mars_users` (
	`id` text PRIMARY KEY NOT NULL,
	`auth_id` text NOT NULL,
	FOREIGN KEY (`auth_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `mars_users_auth_id_unique` ON `mars_users` (`auth_id`);--> statement-breakpoint
CREATE TABLE `music_db` (
	`music_id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`ver` text NOT NULL,
	`artist` text NOT NULL,
	`genre` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`score_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`chart_id` integer NOT NULL,
	`achievement` real NOT NULL,
	`dx_score` integer NOT NULL,
	`judge_critperfect` text,
	`judge_perfect` text,
	`judge_great` text,
	`judge_good` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`played_at` integer,
	`play_lamp` text NOT NULL,
	`sync_lamp` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `mars_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chart_id`) REFERENCES `chart_db`(`chart_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "scores_lamp_check" CHECK("scores"."play_lamp" IN ('UNKNOWN', 'NONE', 'FULL_COMBO', 'FULL_COMBO_PLUS', 'ALL_PERFECT', 'ALL_PERFECT_PLUS')),
	CONSTRAINT "scores_sync_lamp_check" CHECK("scores"."sync_lamp" IN ('UNKNOWN', 'NONE', 'SYNC_PLAY', 'FULL_SYNC', 'FULL_SYNC_PLUS', 'FULL_DX', 'FULL_DX_PLUS'))
);
--> statement-breakpoint
CREATE INDEX `scores_user_id_idx` ON `scores` (`user_id`);--> statement-breakpoint
CREATE INDEX `scores_chart_id_idx` ON `scores` (`chart_id`);--> statement-breakpoint
CREATE INDEX `scores_user_id_chart_id_idx` ON `scores` (`user_id`,`chart_id`);--> statement-breakpoint
CREATE TABLE `user_chart_best_dx` (
	`user_id` text NOT NULL,
	`chart_id` integer NOT NULL,
	`source_score_id` text NOT NULL,
	`previous_best_score_id` text,
	`achievement` real NOT NULL,
	`dx_score` integer NOT NULL,
	`rating` real NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `chart_id`),
	FOREIGN KEY (`user_id`) REFERENCES `mars_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chart_id`) REFERENCES `chart_db`(`chart_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_score_id`) REFERENCES `scores`(`score_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`previous_best_score_id`) REFERENCES `scores`(`score_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_chart_best_dx_chart_id_rating_idx` ON `user_chart_best_dx` (`chart_id`,`rating`);--> statement-breakpoint
CREATE INDEX `user_chart_best_dx_user_id_rating_idx` ON `user_chart_best_dx` (`user_id`,`rating`);--> statement-breakpoint
CREATE TABLE `user_chart_best_std` (
	`user_id` text NOT NULL,
	`chart_id` integer NOT NULL,
	`source_score_id` text NOT NULL,
	`previous_best_score_id` text,
	`achievement` real NOT NULL,
	`dx_score` integer NOT NULL,
	`rating` real NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `chart_id`),
	FOREIGN KEY (`user_id`) REFERENCES `mars_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`chart_id`) REFERENCES `chart_db`(`chart_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_score_id`) REFERENCES `scores`(`score_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`previous_best_score_id`) REFERENCES `scores`(`score_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `user_chart_best_std_chart_id_rating_idx` ON `user_chart_best_std` (`chart_id`,`rating`);--> statement-breakpoint
CREATE INDEX `user_chart_best_std_user_id_rating_idx` ON `user_chart_best_std` (`user_id`,`rating`);--> statement-breakpoint
CREATE TABLE `user_rating_summary_dx` (
	`user_id` text PRIMARY KEY NOT NULL,
	`best50_rating` real DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `mars_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_rating_summary_dx_best50_rating_idx` ON `user_rating_summary_dx` (`best50_rating`);--> statement-breakpoint
CREATE TABLE `user_rating_summary_std` (
	`user_id` text PRIMARY KEY NOT NULL,
	`best50_rating` real DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `mars_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user_rating_summary_std_best50_rating_idx` ON `user_rating_summary_std` (`best50_rating`);--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`username` text,
	`display_username` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);