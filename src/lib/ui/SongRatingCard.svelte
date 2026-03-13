<script lang="ts">
	import { getDifficultyClass } from '$lib/util/difficulty';

	let {
		title,
		musicId,
		difficultyId,
		level,
		achievement,
		letterGrade,
		rating
	}: {
		title: string;
		musicId: number;
		difficultyId: number;
		level: number;
		achievement: number;
		letterGrade: string;
		rating: number;
	} = $props();

	const jacketPath = $derived(`/d/jackets/${String(musicId % 10000).padStart(6, '0')}.png`);
	const difficultyClass = $derived(getDifficultyClass(difficultyId));
</script>

<div class="score-card">
	<img class="jacket" alt={`${title} jacket`} src={jacketPath} />
	<div class="score-info">
		<div class="first-row">
			<span class="song-title">{title}</span>
			<span class={`song-constant ${difficultyClass}`}>{level.toFixed(1)}</span>
		</div>
		<div class="second-row">
			<div class="grade-info text-gradient">
				<span class="grade">{letterGrade}</span>
				<span class="achievement">{achievement.toFixed(4)}%</span>
			</div>
			<span class="rating">{Math.floor(rating)}</span>
		</div>
	</div>
</div>

<style>
	.score-card {
		display: flex;
		flex-direction: row;
		position: relative;
		padding: 0;
		border-radius: var(--border-radius);
		background-color: var(--background-primary);
		overflow: hidden;
		font-size: 0.9em;
	}

	.jacket {
		width: 50px;
		height: 50px;
		border-radius: var(--border-radius);
		object-fit: cover;
		background-color: var(--background-secondary);
	}

	.score-info {
		width: calc(100% - 62px);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-left: 12px;
	}

	.first-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.song-title {
		flex: 1;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		margin-right: 4px;
		padding-top: 4px;
	}

	.song-constant {
		width: 30px;
		text-align: center;
		padding: 0 4px;
		border-radius: 0px var(--border-radius);
		box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
	}

	.second-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 6px;
		margin-right: 8px;
	}

	.grade-info {
		color: var(--color-gradient);
	}

	.grade {
		display: inline-block;
		min-width: 40px;
	}

	.rating {
		color: var(--color-primary);
	}

	.level-0 {
		background-color: var(--color-level-0);
	}

	.level-1 {
		background-color: var(--color-level-1);
	}

	.level-2 {
		background-color: var(--color-level-2);
	}

	.level-3 {
		background-color: var(--color-level-3);
	}

	.level-4 {
		background-color: var(--color-level-4);
	}
</style>
