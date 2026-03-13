<script lang="ts">
	import { authClient, useSession } from '$lib/auth-client';
	import {
		validateSignUp,
		validateUsername,
		validateEmail,
		validatePassword,
		isFieldNull
	} from '$lib/util/validation';

	const session = useSession();

	let isSignUp = $state(false);
	let title = $derived(isSignUp ? 'Sign up' : 'Log in');

	let email = $state('');
	let password = $state('');
	let username = $state('');
	let loginId = $state('');
	let error = $state('');
	let loading = $state(false);

	let fieldErrors = $state<Record<string, string | null>>({});
	let submitted = $state(false);

	function validateField(field: string, value: string) {
		if (!submitted) return;
		if (isSignUp) {
			if (field === 'username') fieldErrors.username = validateUsername(value);
			if (field === 'email') fieldErrors.email = validateEmail(value);
			if (field === 'password') fieldErrors.password = validatePassword(value);
		}
	}

	async function handleSignOut() {
		await authClient.signOut();
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		submitted = true;

		if (isSignUp) {
			fieldErrors = validateSignUp({ username, email, password });
			if (!isFieldNull(fieldErrors)) return;
		} else {
			fieldErrors = {
				loginId: loginId.trim() ? null : 'This field is required.',
				password: password ? null : 'This field is required.'
			};
			if (!isFieldNull(fieldErrors)) return;
		}

		loading = true;

		try {
			let result: {
				data: unknown;
				error: { message?: string; status?: number; statusText?: string; code?: string } | null;
			};

			if (isSignUp) {
				result = await authClient.signUp.email({
					email: email,
					password: password,
					name: username,
					username: username,
					displayUsername: username
				});
			} else {
				const isEmail = loginId.includes('@');
				if (isEmail) {
					result = await authClient.signIn.email({
						email: loginId,
						password: password
					});
				} else {
					result = await authClient.signIn.username({
						username: loginId,
						password: password
					});
				}
			}

			if (result.error) {
				error = result.error.message || result.error.statusText || 'Authentication failed';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown Internal Error';
		} finally {
			loading = false;
		}
	}
</script>

<div class="container">
	{#if $session.data?.user}
		<h1>Account</h1>
		<div class="main">
			<p>Signed in as <strong>{$session.data.user.name}</strong> ({$session.data.user.email})</p>
			<button onclick={handleSignOut}>Sign out</button>
		</div>
	{:else}
		<h1>{title}</h1>

		<div class="main">
			<form onsubmit={handleSubmit}>
				{#if isSignUp}
					<label for="username">Username</label>
					<span class="text-desc"
						>Must be unique with &lt; 24 alphanumeric characters and no spaces.</span
					>
					<input
						id="username"
						type="text"
						bind:value={username}
						onblur={() => validateField('username', username)}
						disabled={loading}
					/>
					{#if fieldErrors.username}<span class="field-error">{fieldErrors.username}</span>{/if}

					<label for="email">Email</label>
					<span class="text-desc"
						>Only used for account verification and recovery. We'll never share this with anyone
						else.</span
					>
					<input
						id="email"
						type="email"
						bind:value={email}
						onblur={() => validateField('email', email)}
						disabled={loading}
					/>
					{#if fieldErrors.email}<span class="field-error">{fieldErrors.email}</span>{/if}

					<label for="password">Password</label>
					<span class="text-desc"
						>Must include a mix of letters, numbers, and special characters with &gt; 8 characters.</span
					>
					<input
						id="password"
						type="password"
						bind:value={password}
						onblur={() => validateField('password', password)}
						disabled={loading}
					/>
					{#if fieldErrors.password}<span class="field-error">{fieldErrors.password}</span>{/if}
				{:else}
					<label for="loginId">Username or Email</label>
					<input id="loginId" type="text" bind:value={loginId} disabled={loading} />
					{#if fieldErrors.loginId}<span class="field-error">{fieldErrors.loginId}</span>{/if}

					<label for="password">Password</label>
					<input id="password" type="password" bind:value={password} disabled={loading} />
					{#if fieldErrors.password}<span class="field-error">{fieldErrors.password}</span>{/if}
				{/if}

				{#if error}
					<p class="error">{error}</p>
				{/if}

				<button type="submit" disabled={loading}>
					{loading ? 'Loading...' : title}
				</button>
			</form>

			<button
				class="toggle hoverable"
				onclick={() => {
					isSignUp = !isSignUp;
					fieldErrors = {};
				}}
				disabled={loading}
			>
				{isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
			</button>
		</div>
	{/if}
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

	.error {
		color: var(--color-error);
		margin: 0;
	}

	.field-error {
		color: var(--color-error);
		font-family: var(--text-font);
		font-size: 0.8rem;
		margin-top: -0.4em;
	}

	.toggle {
		width: 100%;
		margin-top: 12px;
		background: transparent;
		border-color: transparent;
	}
</style>
