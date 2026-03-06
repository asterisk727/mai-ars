<script lang="ts">
	import { resolve } from '$app/paths';

	import '../app.css';

	let { children } = $props();
</script>

<div id="app">
	<nav>
		<a href={resolve('/')} class="logo text-gradient">
			<span>MaiARS</span>
		</a>
		<div class="nav-links">
			<a href={resolve('/ranking')}>
				<span>rankings</span>
			</a>
			<a href={resolve('/user')}>
				<span>account</span>
			</a>
		</div>
	</nav>

	{@render children()}
</div>

<style>
	#app {
		background: var(--background-primary);
		min-height: 100vh;
	}

	nav {
		display: flex;
		position: sticky;
		justify-content: space-between;
		align-items: center;

		top: 0;
		height: 2rem;
		z-index: 100;
		padding: 1rem 2.5rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 500;
	}

	.nav-links {
		display: flex;
		justify-content: flex-end;
		gap: 25px;
	}
</style>
