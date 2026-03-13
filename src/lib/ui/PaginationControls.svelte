<script lang="ts">
	let {
		basePath,
		page,
		totalPages
	}: {
		basePath: string;
		page: number;
		totalPages: number;
	} = $props();

	const middleStart = $derived(Math.max(2, page - 2));
	const middleEnd = $derived(Math.min(totalPages - 1, page + 2));
	const showLeadingEllipsis = $derived(middleStart > 2);
	const showTrailingEllipsis = $derived(middleEnd < totalPages - 1);
	const middlePages = $derived(
		Array.from(
			{ length: Math.max(0, middleEnd - middleStart + 1) },
			(_, index) => middleStart + index
		)
	);

	function hrefFor(targetPage: number) {
		if (targetPage <= 1) return basePath;
		return `${basePath}?page=${targetPage}`;
	}

	function navigate(targetPage: number) {
		if (targetPage < 1 || targetPage > totalPages || targetPage === page) return;
		window.location.assign(hrefFor(targetPage));
	}
</script>

{#if totalPages > 1}
	<nav class="pagination" aria-label="Pagination">
		<button class="nav" type="button" onclick={() => navigate(page - 1)} disabled={page <= 1}
			>Previous</button
		>

		<div class="pages">
			<button class:active={page === 1} type="button" onclick={() => navigate(1)}>1</button>

			{#if showLeadingEllipsis}
				<span class="ellipsis" aria-hidden="true">...</span>
			{/if}

			{#each middlePages as p (p)}
				<button class:active={p === page} type="button" onclick={() => navigate(p)}>{p}</button>
			{/each}

			{#if showTrailingEllipsis}
				<span class="ellipsis" aria-hidden="true">...</span>
			{/if}

			{#if totalPages > 1}
				<button
					class:active={page === totalPages}
					type="button"
					onclick={() => navigate(totalPages)}
				>
					{totalPages}
				</button>
			{/if}
		</div>

		<button
			class="nav"
			type="button"
			onclick={() => navigate(page + 1)}
			disabled={page >= totalPages}>Next</button
		>
	</nav>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 16px;
	}

	.pages {
		display: flex;
		gap: 6px;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 6px 10px;
		border-radius: 8px;
		border: none;
		background: var(--background-primary);
		font-size: 0.9rem;
		cursor: pointer;
	}

	button.active {
		color: var(--background-primary);
		background: var(--color-primary);
	}

	span.ellipsis {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 6px 2px;
		font-size: 0.9rem;
		font-weight: 700;
	}

	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
</style>
