<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import RankingRow from '$lib/ui/RankingRow.svelte';
	import PaginationControls from '$lib/ui/PaginationControls.svelte';

	let { data }: { data: PageData } = $props();

	const difficultyNames = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:MASTER'] as const;
	const jacketPath = $derived(
		`/d/jackets/${String(data.chart.musicId % 10000).padStart(6, '0')}.png`
	);
</script>

<div class="container">
	<h1>Chart Leaderboard</h1>
	<div class="main">
		<a class="back text-desc" href={resolve('/ranking/charts')}>← Back to chart list</a>

		<div class="chart-meta">
			<img src={jacketPath} alt={`${data.chart.songName} jacket`} class="jacket" />
			<div class="info">
				<p class="title">{data.chart.songName}</p>
				<p class="text-desc">{data.chart.songArtist}</p>
				<p class="text-desc">
					{difficultyNames[data.chart.difficultyId] ?? 'Unknown'} · Lv {data.chart.chartConstant.toFixed(
						1
					)} · {data.chart.chartDesigner || 'Unknown'}
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
					<RankingRow
						rank={entry.rank}
						displayName={entry.displayUsername ?? entry.name}
						username={entry.username ?? entry.name}
						achievement={entry.achievement}
					/>
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
	.container {
		max-width: 900px;
		margin: 96px max(32px, calc((100vw - 900px) / 2));
	}

	.main {
		background-color: var(--background-secondary);
		margin-top: 24px;
		padding: 16px 24px 24px;
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
		margin: 0;
	}

	.title {
		font-weight: 600;
	}

	.ranking-list {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
