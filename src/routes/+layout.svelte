<script lang="ts">
	import { resolve } from '$app/paths';
	import { useSession } from '$lib/auth-client';

	import '../app.css';

	let { children } = $props();
	const session = useSession();
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
			{#if $session.data?.user}
				<a href={resolve('/users/')}>
					<span>account</span>
				</a>
			{:else}
				<a href={resolve('/account')}><span>log in</span></a>
			{/if}
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

	.nav-links a {
		cursor: pointer;
		transition: all var(--transition);
		text-decoration: underline 1px solid transparent;
		text-underline-offset: 0.1em;
	}

	.nav-links a:hover {
		text-decoration-color: var(--color-primary);
		text-underline-offset: 0.5em;
	}

	span:hover {
		color: var(--color-primary);
		transition: color var(--transition);
	}
</style>
