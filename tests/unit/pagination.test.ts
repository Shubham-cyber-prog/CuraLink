import {
  paginationQuerySchema,
  parsePaginationParams,
  buildPaginatedResponse,
} from '../../src/validators/pagination.validator';

describe('Pagination Utilities and Validation', () => {
  describe('paginationQuerySchema', () => {
    it('should default limit to 20 and page to 1 when empty', () => {
      const result = paginationQuerySchema.parse({});
      expect(result.limit).toBe(20);
      expect(result.page).toBe(1);
      expect(result.cursor).toBeUndefined();
    });

    it('should parse valid string inputs for limit and page', () => {
      const result = paginationQuerySchema.parse({ limit: '50', page: '3' });
      expect(result.limit).toBe(50);
      expect(result.page).toBe(3);
    });

    it('should enforce max limit of 100', () => {
      expect(() => {
        paginationQuerySchema.parse({ limit: '101' });
      }).toThrow();
    });

    it('should enforce min limit of 1', () => {
      expect(() => {
        paginationQuerySchema.parse({ limit: '0' });
      }).toThrow();
    });
  });

  describe('parsePaginationParams', () => {
    it('should correctly calculate skip when page is used', () => {
      const params = parsePaginationParams({ page: '2', limit: '20' });
      expect(params.page).toBe(2);
      expect(params.limit).toBe(20);
      expect(params.skip).toBe(20);
      expect(params.cursor).toBeUndefined();
    });

    it('should prioritize cursor and set skip to 0 when cursor is provided', () => {
      const params = parsePaginationParams({ cursor: 'some-uuid-cursor', limit: '10' });
      expect(params.cursor).toBe('some-uuid-cursor');
      expect(params.skip).toBe(0);
      expect(params.limit).toBe(10);
    });
  });

  describe('buildPaginatedResponse', () => {
    it('should slice data to limit and provide nextCursor when more records exist', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
        { id: '3', name: 'Item 3' },
      ];

      const res = buildPaginatedResponse(items, 10, 2, 1);
      expect(res.data).toHaveLength(2);
      expect(res.data[0].id).toBe('1');
      expect(res.data[1].id).toBe('2');
      expect(res.total).toBe(10);
      expect(res.nextCursor).toBe('2');
    });

    it('should set nextCursor to null on the final page', () => {
      const items = [{ id: '9', name: 'Item 9' }, { id: '10', name: 'Item 10' }];

      const res = buildPaginatedResponse(items, 10, 20, 1);
      expect(res.data).toHaveLength(2);
      expect(res.total).toBe(10);
      expect(res.nextCursor).toBeNull();
    });
  });
});
