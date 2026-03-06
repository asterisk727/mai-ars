<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let email = $state('');
	let password = $state('');
	let name = $state('');
	let isSignUp = $state(false);
	let error = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			if (isSignUp) {
				await authClient.signUp.email({
					email,
					password,
					name,
					callbackURL: '/demo/better-auth'
				});
			} else {
				await authClient.signIn.email({
					email,
					password,
					callbackURL: '/demo/better-auth'
				});
			}

			// Redirect on success
			await goto(resolve('/demo/better-auth'));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Authentication failed';
		} finally {
			loading = false;
		}
	}

	function toggleMode() {
		isSignUp = !isSignUp;
		error = '';
	}
</script>

<div class="auth-container">
	<h1>{isSignUp ? 'Sign Up' : 'Sign In'}</h1>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<form onsubmit={handleSubmit}>
		{#if isSignUp}
			<div>
				<label for="name">Name</label>
				<input id="name" type="text" bind:value={name} required disabled={loading} />
			</div>
		{/if}

		<div>
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} required disabled={loading} />
		</div>

		<div>
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} required disabled={loading} />
		</div>

		<button type="submit" disabled={loading}>
			{loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
		</button>
	</form>

	<button type="button" onclick={toggleMode} disabled={loading}>
		{isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
	</button>
</div>

<style>
	.auth-container {
		max-width: 400px;
		margin: 2rem auto;
		padding: 2rem;
	}

	.error {
		color: red;
		padding: 0.5rem;
		background: #fee;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	form > div {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.25rem;
	}

	input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		width: 100%;
		padding: 0.75rem;
		margin-top: 0.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button[type='submit'] {
		background: #0066cc;
		color: white;
	}

	button[type='button'] {
		background: transparent;
		color: #0066cc;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
