<script lang="ts">
	import { authClient, useSession } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	// Reactive session store from client
	const session = useSession();

	async function handleSignOut() {
		await authClient.signOut();
		await goto('/demo/better-auth/login');
	}
</script>

<div>
	<h1>Protected Page</h1>

	{#if $session.data?.user}
		<p>Welcome, {$session.data.user.name || $session.data.user.email}!</p>
		<p>User ID: {$session.data.user.id}</p>
		<p>Session expires: {new Date($session.data.session.expiresAt).toLocaleString()}</p>
		<button onclick={handleSignOut}>Sign Out</button>
	{:else}
		<p>Loading session...</p>
	{/if}
</div>
