<script lang="ts">
	import type { PageData } from './$types';
	import RankingRow from '$lib/ui/RankingRow.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();
</script>

<div class="container">
	<h1>Global Rankings</h1>
	<div class="main">
		<h2>Standard rating leaderboard</h2>

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
		padding: 16px 32px 32px;
		border-radius: var(--border-radius);
	}

	.ranking-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 12px;
	}
</style>
