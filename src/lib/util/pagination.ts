export type PaginationMeta = {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	offset: number;
	hasPrev: boolean;
	hasNext: boolean;
};

export const PAGE_SIZE = 50;

export function parsePageParam(value: string | null) {
	const parsed = Number.parseInt(value ?? '1', 10);
	if (!Number.isFinite(parsed) || parsed < 1) return 1;
	return parsed;
}

export function getPaginationMeta(
	totalItems: number,
	requestedPage: number,
	pageSize: number
): PaginationMeta {
	const safeTotalItems = Math.max(0, totalItems);
	const safePageSize = Math.max(1, pageSize);
	const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize));
	const page = Math.min(Math.max(1, requestedPage), totalPages);
	const offset = (page - 1) * safePageSize;

	return {
		page,
		pageSize: safePageSize,
		totalItems: safeTotalItems,
		totalPages,
		offset,
		hasPrev: page > 1,
		hasNext: page < totalPages
	};
}
