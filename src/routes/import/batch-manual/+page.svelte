<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form } = $props<{ form: ActionData }>();

	let loading = $state(false);
	let fileInput: HTMLInputElement | undefined = $state();
	let dragActive = $state(false);
	let selectedFileName = $state<string | null>(null);

	const handleDrop = (e: DragEvent) => {
		e.preventDefault();
		dragActive = false;
		if (e.dataTransfer?.files.length && fileInput) {
			fileInput.files = e.dataTransfer.files;
			selectedFileName = e.dataTransfer.files[0].name;
		}
	};

	const handleChange = () => {
		if (fileInput?.files?.length) {
			selectedFileName = fileInput.files[0].name;
		} else {
			selectedFileName = null;
		}
	};
</script>

<div class="container">
	<h1>Import Batch Manual</h1>
	<div class="main">
		<p>Upload a valid JSON file conforming to the Batch-Manual score format.</p>
		<p class="text-desc">Judgement breakdown is required for all scores to derive DX Score.</p>

		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
		>
			<label
				class="dropzone {dragActive ? 'active' : ''}"
				ondragenter={(e) => {
					e.preventDefault();
					dragActive = true;
				}}
				ondragleave={(e) => {
					e.preventDefault();
					dragActive = false;
				}}
				ondragover={(e) => e.preventDefault()}
				ondrop={handleDrop}
			>
				<input
					type="file"
					name="file"
					accept="application/json"
					bind:this={fileInput}
					onchange={handleChange}
					required
				/>
				<div class="message">
					{#if selectedFileName}
						<strong>Selected:</strong><br />
						<span>{selectedFileName}</span>
					{:else}
						<strong>Click to upload</strong> or drag and drop<br />
						<span>.json files only</span>
					{/if}
				</div>
			</label>

			<hr class="divider" />

			<button type="submit" disabled={loading}>
				{#if loading}
					Processing Submission...
				{:else}
					Import Scores
				{/if}
			</button>
		</form>

		{#if form}
			<div class="results" class:error={!form.success}>
				{#if form.success}
					<h2>Import Summary</h2>
					<div class="stats">
						<div class="stat good">
							<span class="label">Scores Imported: </span>
							<span class="num">{form.importedCount}</span>
						</div>
						<div class="stat bad">
							<span class="label">Scores Rejected: </span>
							<span class="num">{form.rejectedCount}</span>
						</div>
					</div>

					{#if form.rejected && form.rejected.length > 0}
						<div class="rejected-list">
							<h3>Rejected Entries Details</h3>
							<div class="rejected-scroll">
								{#each form.rejected as reject, i (i)}
									<div class="reject-item">
										<span class="text-desc"
											>{reject.score.percent}% score on song {reject.score.identifier}
											{reject.score.difficulty}</span
										>
										<br />
										<span>{reject.reason}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					<h2>Error Importing File</h2>
					<p>{form.error || 'An unexpected error occurred.'}</p>
				{/if}
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

	h1 {
		margin-bottom: 8px;
	}

	.dropzone {
		display: flex;
		position: relative;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		padding: 48px 24px;
		margin-bottom: 24px;
		border: 1.5px dashed var(--color-primary);
		border-radius: var(--border-radius);
		background-color: var(--background);
		cursor: pointer;
		transition: all var(--transition);
	}

	.dropzone input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		white-space: nowrap;
		border-width: 0;
	}

	.dropzone .message {
		text-align: center;
	}

	.dropzone .message span {
		font-size: 0.85em;
		opacity: 0.6;
		display: block;
		margin-top: 4px;
	}

	.results {
		padding-top: 32px;
	}

	.results h2 {
		margin-bottom: 24px;
	}

	.results.error h2 {
		color: var(--color-error);
	}

	.stats {
		display: flex;
		gap: 24px;
		margin-bottom: 16px;
	}

	.stat {
		flex: 1;
		background-color: var(--background);
		padding: 24px;
		border-radius: var(--border-radius);
		text-align: center;
	}

	.stat .num {
		display: block;
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 8px;
	}

	.stat.good .num {
		color: var(--color-secondary);
	}
	.stat.bad .num {
		color: var(--color-error);
	}

	.rejected-list {
		background-color: var(--background);
		border-radius: var(--border-radius);
		overflow: hidden;
	}

	.rejected-list h3 {
		padding: 16px;
		background-color: var(--background-primary);
		color: var(--color-error);
		margin: 0;
		font-size: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.rejected-scroll {
		max-height: 400px;
		overflow-y: auto;
	}

	.reject-item {
		padding: 16px;
		border-bottom: 4px solid var(--background-primary);
	}

	.reject-item:last-child {
		border-bottom: none;
	}

	form .divider {
		width: 110px;
		margin: auto;
	}
</style>
