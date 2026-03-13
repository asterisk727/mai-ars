import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const file = formData.get('file');

		if (!file || !(file instanceof File)) {
			return fail(400, {
				success: false,
				error: 'No valid file uploaded.'
			});
		}

		try {
			const text = await file.text();
			const json = JSON.parse(text);

			if (!json || typeof json !== 'object' || !Array.isArray(json.scores)) {
				return fail(400, {
					success: false,
					error: 'Expected a valid Batch-Manual JSON file containing a scores array.'
				});
			}

			const res = await fetch('/api/import/batch-manual', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(json)
			});

			const data = await res.json();

			if (!res.ok) {
				return fail(res.status, {
					success: false,
					error: data.error || 'Failed to import scores.'
				});
			}

			return {
				success: true,
				importedCount: data.importedCount,
				rejectedCount: data.rejectedCount,
				rejected: data.rejected
			};
		} catch {
			return fail(500, {
				success: false,
				error: 'Failed to process file. Ensure it is valid JSON.'
			});
		}
	}
};
