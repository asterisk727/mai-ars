<script lang="ts">
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import SongRatingCard from '$lib/ui/SongRatingCard.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="container">
	<h1>{data.profile.displayUsername ?? data.profile.username}</h1>
	<div class="main">
		<p>@{data.profile.username}</p>

		<div class="best50">
			<h2>Best 50 (Standard Rating)</h2>
			<hr class="divider" />
			{#if data.best50Std.length === 0}
				<p class="text-desc">No score records yet.</p>
			{:else}
				<div class="best50-grid">
					{#each data.best50Std as entry (entry.chartId)}
						<SongRatingCard
							title={entry.title}
							musicId={entry.musicId}
							difficultyId={entry.difficultyId}
							level={entry.level}
							achievement={entry.achievement}
							letterGrade={entry.letterGrade}
							rating={entry.rating}
						/>
					{/each}
				</div>
			{/if}
		</div>

		{#if data.isOwner}
			<div class="actions">
				<h2>My Account</h2>
				<hr class="divider" />
				<h3>Import Scores</h3>
				<a href={resolve('/import/batch-manual')}>
					<button>Import Batch Manual Scores</button>
				</a>
				<h3>Account Management</h3>
				<a href={resolve('/account')}>
					<button>Account and Session Settings</button>
				</a>
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

	.actions {
		padding-top: 24px;
	}

	.best50 {
		margin-top: 24px;
	}

	.best50-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 15px;
	}

	@media (max-width: 980px) {
		.best50-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 760px) {
		.best50-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
