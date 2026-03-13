<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import RankingRow from '$lib/ui/RankingRow.svelte';
	import PaginationControls from '$lib/ui/PaginationControls.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();
</script>

<div class="container">
	<h1>Global Rankings</h1>
	<div class="main">
		<h2>Standard rating leaderboard</h2>
		{#if data.pagination.totalItems > 0}
			<p class="text-desc">
				Showing {data.pagination.offset + 1}-{Math.min(
					data.pagination.offset + data.pagination.pageSize,
					data.pagination.totalItems
				)} of {data.pagination.totalItems} players
			</p>
		{/if}

		{#if data.ranking.length === 0}
			<p>No ranking data yet.</p>
		{:else}
			<div class="ranking-list">
				{#each data.ranking as entry (entry.rank)}
					<RankingRow
						rank={entry.rank}
						displayName={entry.displayUsername ?? entry.name}
						username={entry.username ?? entry.name}
						rating={entry.best50RatingStd}
					/>
				{/each}
			</div>
			<PaginationControls
				basePath={resolve('/ranking/rating')}
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

	.ranking-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 12px;
	}
</style>
