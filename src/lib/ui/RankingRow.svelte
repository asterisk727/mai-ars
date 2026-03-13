<script lang="ts">
	let {
		rank,
		displayName,
		username,
		rating
	}: {
		rank: number;
		displayName: string;
		username: string;
		rating: number;
	} = $props();
</script>

<div class="ranking-row">
	<span class="rank">#{rank}</span>
	<div class="identity">
		<span class="name">{displayName}</span>
		<span class="username">@{username}</span>
	</div>
	<span class="rating">{Math.floor(rating)}</span>
</div>

<style>
	.ranking-row {
		display: grid;
		grid-template-columns: 48px 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: var(--border-radius);
		background-color: var(--background-primary);
	}

	.rank {
		text-align: center;
		color: var(--color-primary);
	}

	.identity {
		display: flex;
		align-items: baseline;
		gap: 12px;
		min-width: 0;
	}

	.name,
	.username {
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.username {
		font-size: 0.8rem;
		opacity: 0.6;
	}

	.rating {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-secondary);
		margin-right: 12px;
	}
</style>
