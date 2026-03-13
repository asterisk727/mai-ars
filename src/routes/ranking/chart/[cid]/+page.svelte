<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import RankingRow from '$lib/ui/RankingRow.svelte';
	import PaginationControls from '$lib/ui/PaginationControls.svelte';
	import { getChartTypeIcon, getJacketPath } from '$lib/util/charts';
	import { getDifficultyClass, getDifficultyName } from '$lib/util/difficulty';

	let { data }: { data: PageData } = $props();
	const jacketPath = $derived(getJacketPath(data.chart.musicId));
</script>

<div class="container">
	<h1>Chart Leaderboard</h1>
	<div class="main">
		<a class="back text-desc" href={resolve('/ranking/charts')}>← Back to chart list</a>

		<div class="chart-meta">
			<img src={jacketPath} alt={`${data.chart.songName} jacket`} class="jacket" />
			<div class="info">
				<div class="chart-title-row">
					<p class="title">{data.chart.songName}</p>
					<img
						src={getChartTypeIcon(data.chart.chartType)}
						alt={`${data.chart.chartType} chart`}
						class="chart-type-icon"
					/>
				</div>
				<p class="text-desc">{data.chart.songArtist}</p>
				<p class="text-desc">
					<span class={`difficulty-name ${getDifficultyClass(data.chart.difficultyId)}`}>
						{getDifficultyName(data.chart.difficultyId)}
					</span>
					·
					<span class={`difficulty-level ${getDifficultyClass(data.chart.difficultyId)}`}>
						Lv {data.chart.chartConstant.toFixed(1)}
					</span>
					· {data.chart.chartDesigner || 'Unknown'}
				</p>
			</div>
		</div>

		{#if data.pagination.totalItems > 0}
			<p class="text-desc">
				Showing {data.pagination.offset + 1}-{Math.min(
					data.pagination.offset + data.pagination.pageSize,
					data.pagination.totalItems
				)} of {data.pagination.totalItems} players
			</p>
		{/if}

		{#if data.leaderboard.length === 0}
			<p>No personal best scores recorded for this chart yet.</p>
		{:else}
			<div class="ranking-list">
				{#each data.leaderboard as entry (entry.rank)}
					<a class="ranking-link" href={resolve(`/users/${entry.username}`)}>
						<RankingRow
							rank={entry.rank}
							displayName={entry.displayUsername ?? entry.name}
							username={entry.username}
							achievement={entry.achievement}
						/>
					</a>
				{/each}
			</div>
			<PaginationControls
				basePath={resolve(`/ranking/chart/${data.chart.chartId}`)}
				page={data.pagination.page}
				totalPages={data.pagination.totalPages}
			/>
		{/if}
	</div>
</div>

<style>
	.main {
		background-color: var(--background-secondary);
		margin-top: 24px;
		padding: 32px;
		border-radius: var(--border-radius);
	}

	.back {
		display: inline-block;
		margin-bottom: 12px;
	}

	.chart-meta {
		display: grid;
		grid-template-columns: 64px 1fr;
		gap: 12px;
		align-items: center;
		margin-bottom: 14px;
	}

	.jacket {
		width: 64px;
		height: 64px;
		object-fit: cover;
		border-radius: 8px;
		background-color: var(--background-primary);
	}

	.title {
		font-weight: 600;
		margin: 0;
	}

	.chart-title-row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.chart-type-icon {
		width: 46px;
		height: auto;
		flex-shrink: 0;
	}

	.difficulty-name,
	.difficulty-level {
		font-weight: 600;
	}

	.difficulty-name.level-0,
	.difficulty-level.level-0 {
		color: var(--color-level-0);
	}

	.difficulty-name.level-1,
	.difficulty-level.level-1 {
		color: var(--color-level-1);
	}

	.difficulty-name.level-2,
	.difficulty-level.level-2 {
		color: var(--color-level-2);
	}

	.difficulty-name.level-3,
	.difficulty-level.level-3 {
		color: var(--color-level-3);
	}

	.difficulty-name.level-4,
	.difficulty-level.level-4 {
		color: var(--color-level-4);
	}

	.ranking-list {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ranking-link {
		display: block;
	}
</style>
