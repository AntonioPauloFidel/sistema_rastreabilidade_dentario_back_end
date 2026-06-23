export type PaginatedResult<T> = {
  data: T[];
  total: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0
  };
}

export function paginatedResponse<T>(result: PaginatedResult<T>, params: PaginationParams) {
  return {
    data: result.data,
    meta: paginationMeta(result.total, params.page, params.limit)
  };
}
