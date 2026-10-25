import { z } from 'zod';

export const paginationQuerySchema = z.object({
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 20;
      const n = typeof val === 'number' ? val : parseInt(String(val), 10);
      return isNaN(n) ? 20 : n;
    })
    .pipe(z.number().int().min(1).max(100)),
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 1;
      const n = typeof val === 'number' ? val : parseInt(String(val), 10);
      return isNaN(n) ? 1 : n;
    })
    .pipe(z.number().int().min(1)),
  cursor: z.string().optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function parsePaginationParams(query: Record<string, any>): {
  limit: number;
  page: number;
  cursor?: string;
  skip: number;
} {
  const parsed = paginationQuerySchema.safeParse(query);
  const limit = parsed.success ? parsed.data.limit : 20;
  const page = parsed.success ? parsed.data.page : 1;
  const cursor = parsed.success && parsed.data.cursor ? parsed.data.cursor : undefined;
  const skip = cursor ? 0 : (page - 1) * limit;

  return { limit, page, cursor, skip };
}

export function buildPaginatedResponse<T extends { id?: string | number }>(
  items: T[],
  total: number,
  limit: number,
  page: number = 1
): {
  data: T[];
  total: number;
  nextCursor: string | null;
} {
  const hasMore = items.length > limit || (page * limit < total);
  const sliced = items.slice(0, limit);
  const lastItem = sliced[sliced.length - 1];
  const nextCursor = hasMore && lastItem?.id ? String(lastItem.id) : null;

  return {
    data: sliced,
    total,
    nextCursor,
  };
}
