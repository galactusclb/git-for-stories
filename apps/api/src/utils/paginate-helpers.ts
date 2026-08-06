import { PaginationQuery } from '@/schemas/pagination.schema';

export const paginate = (query: PaginationQuery) => ({
    skip: (query.page - 1) * query.limit,
    take: query.limit,
});

export const paginatedResponse = <T>(data: T[], total: number, query: PaginationQuery) => ({
    data,
    meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
    },
});
