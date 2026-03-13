export const DIFFICULTY_NAMES = ['Basic', 'Advanced', 'Expert', 'Master', 'Re:MASTER'] as const;

export const DIFFICULTY_CLASSES = ['level-0', 'level-1', 'level-2', 'level-3', 'level-4'] as const;

export function getDifficultyName(difficultyId: number) {
	return DIFFICULTY_NAMES[difficultyId] ?? 'Unknown';
}

export function getDifficultyClass(difficultyId: number) {
	return DIFFICULTY_CLASSES[difficultyId] ?? '';
}
