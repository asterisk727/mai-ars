export function validateUsername(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed) return 'Username is required.';
	if (trimmed.length < 3) return 'Username must be more than 3 characters.';
	if (trimmed.length > 24) return 'Username must be less than 24 characters.';
	if (/\s/.test(trimmed)) return 'Username must not contain spaces.';
	if (!/^[a-zA-Z0-9_]+$/.test(trimmed))
		return 'Username must only contain letters, numbers, and underscores.';
	return null;
}

export function validateEmail(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed) return 'Email is required.';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.';
	return null;
}

export function validatePassword(value: string): string | null {
	if (!value) return 'Password is required.';
	if (value.length <= 8) return 'Password must be more than 8 characters.';
	if (!/[a-zA-Z]/.test(value)) return 'Password must include at least one letter.';
	if (!/[0-9]/.test(value)) return 'Password must include at least one number.';
	if (!/[^a-zA-Z0-9]/.test(value)) return 'Password must include at least one special character.';
	return null;
}

export function validateSignUp(fields: { username: string; email: string; password: string }) {
	return {
		username: validateUsername(fields.username),
		email: validateEmail(fields.email),
		password: validatePassword(fields.password)
	};
}

export function isFieldNull(errors: Record<string, string | null>): boolean {
	return Object.values(errors).every((v) => v === null);
}
