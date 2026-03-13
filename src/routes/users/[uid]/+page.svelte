<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container">
	<h1>{data.profile.displayUsername ?? data.profile.username}</h1>
	<div class="main">
		<p>@{data.profile.username}</p>
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
		padding: 32px;
		border-radius: var(--border-radius);
	}
</style>
