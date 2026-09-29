export interface PaginationInput {
  page: number;
  limit: number;
}

export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildPaginationMeta(pagination: PaginationInput, total: number) {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: Math.ceil(total / pagination.limit),
  };
}

export function buildPage<T>(pagination: PaginationInput, result: { rows: T[]; count: number }) {
  return { items: result.rows, meta: buildPaginationMeta(pagination, result.count) };
}
