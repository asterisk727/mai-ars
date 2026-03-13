<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import PaginationControls from '$lib/ui/PaginationControls.svelte';

	let { data }: { data: PageData } = $props();

	const difficultyNames = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:MASTER'] as const;

	function getJacketPath(musicId: number) {
		return `/d/jackets/${String(musicId % 10000).padStart(6, '0')}.png`;
	}
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
							<p class="title">{chart.songName}</p>
							<p class="sub text-desc">{chart.songArtist}</p>
							<p class="sub text-desc">
								{difficultyNames[chart.difficultyId] ?? 'Unknown'} · Designer: {chart.chartDesigner ||
									'Unknown'}
							</p>
						</div>
						<div class="stats">
							<span>Lv {chart.chartConstant.toFixed(1)}</span>
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
	.container {
		max-width: 1000px;
		margin: 96px max(32px, calc((100vw - 1000px) / 2));
	}

	.main {
		background-color: var(--background-secondary);
		margin-top: 24px;
		padding: 16px 24px 24px;
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

	.stats {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		font-size: 0.9rem;
		color: var(--color-secondary);
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
