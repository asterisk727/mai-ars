<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import PaginationControls from '$lib/ui/PaginationControls.svelte';
	import { getChartTypeIcon, getJacketPath } from '$lib/util/charts';
	import { getDifficultyClass, getDifficultyName } from '$lib/util/difficulty';

	let { data }: { data: PageData } = $props();
</script>

<div class="container">
	<h1>Chart Leaderboards</h1>
	<div class="main">
		<p class="text-desc">Choose a chart leaderboard to view player personal best rankings.</p>
		{#if data.pagination.totalItems > 0}
			<p class="text-desc">
				Showing {data.pagination.offset + 1}-{Math.min(
					data.pagination.offset + data.pagination.pageSize,
					data.pagination.totalItems
				)} of {data.pagination.totalItems} charts
			</p>
		{/if}

		{#if data.charts.length === 0}
			<p>No chart data found.</p>
		{:else}
			<div class="chart-list">
				{#each data.charts as chart (chart.chartId)}
					<a class="chart-row" href={resolve(`/ranking/chart/${chart.chartId}`)}>
						<img
							src={getJacketPath(chart.musicId)}
							alt={`${chart.songName} jacket`}
							class="jacket"
						/>
						<div class="meta">
							<div class="chart-title-row">
								<p class="title">{chart.songName}</p>
								<img
									src={getChartTypeIcon(chart.chartType)}
									alt={`${chart.chartType} chart`}
									class="chart-type-icon"
								/>
							</div>
							<p class="sub text-desc">{chart.songArtist}</p>
							<p class="sub text-desc">Designer: {chart.chartDesigner || 'Unknown'}</p>
						</div>
						<div class="stats">
							<div class="difficulty-stats">
								<span class={`difficulty-name ${getDifficultyClass(chart.difficultyId)}`}>
									{getDifficultyName(chart.difficultyId)}
								</span>
								<span class={`difficulty-level ${getDifficultyClass(chart.difficultyId)}`}>
									Lv {chart.chartConstant.toFixed(1)}
								</span>
							</div>
							<span>{chart.totalScores} plays</span>
						</div>
					</a>
				{/each}
			</div>
			<PaginationControls
				basePath={resolve('/ranking/charts')}
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

	.chart-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 12px;
	}

	.chart-row {
		display: grid;
		grid-template-columns: 56px 1fr auto;
		gap: 12px;
		align-items: center;
		padding: 8px 16px 8px 8px;
		border-radius: var(--border-radius);
		background-color: var(--background-primary);
		transition: transform var(--transition);
	}

	.chart-row:hover {
		transform: translateY(-1px);
	}

	.jacket {
		width: 56px;
		height: 56px;
		object-fit: cover;
		border-radius: 8px;
		background-color: var(--background-secondary);
	}

	.meta {
		min-width: 0;
	}

	.title,
	.sub {
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title {
		font-weight: 600;
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

	.stats {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		font-size: 0.9rem;
		color: var(--color-secondary);
	}

	.difficulty-stats {
		display: flex;
		align-items: baseline;
		gap: 8px;
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

	@media (max-width: 720px) {
		.chart-row {
			grid-template-columns: 44px 1fr;
		}

		.jacket {
			width: 44px;
			height: 44px;
		}

		.stats {
			grid-column: 2;
			align-items: flex-start;
			font-size: 0.85rem;
		}
	}
</style>
