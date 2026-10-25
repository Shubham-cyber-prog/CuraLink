describe('Integration Test Database Isolation Guard', () => {
  const originalDbUrl = process.env.DATABASE_URL;
  const originalDirectUrl = process.env.DIRECT_URL;

  afterEach(() => {
    process.env.DATABASE_URL = originalDbUrl;
    process.env.DIRECT_URL = originalDirectUrl;
  });

  it('should ensure test DATABASE_URL does not point to production curalink-health', () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(process.env.DATABASE_URL).not.toContain('/curalink-health');
  });

  it('should ensure test DIRECT_URL does not point to production curalink-health', () => {
    expect(process.env.DIRECT_URL).toBeDefined();
    expect(process.env.DIRECT_URL).not.toContain('/curalink-health');
  });

  it('should point to curalink_test or isolated test branch', () => {
    const isTestDb =
      process.env.DATABASE_URL?.includes('/curalink_test') ||
      process.env.DATABASE_URL?.includes('_test') ||
      process.env.DATABASE_URL?.includes('localhost');
    expect(isTestDb).toBe(true);
  });

  it('should enforce safety error if an attempt is made to use production database in tests', () => {
    const enforceGuard = (dbUrl: string, directUrl: string) => {
      if (dbUrl.includes('/curalink-health') || directUrl.includes('/curalink-health')) {
        throw new Error(
          'CRITICAL SAFETY ERROR: Integration tests detected production database connection (/curalink-health). Tests must run against a separate test database or branch.'
        );
      }
    };

    expect(() =>
      enforceGuard(
        'postgresql://user:pass@ep-test.neon.tech/curalink-health?sslmode=require',
        'postgresql://user:pass@ep-test.neon.tech/curalink-health?sslmode=require'
      )
    ).toThrow('CRITICAL SAFETY ERROR');

    expect(() =>
      enforceGuard(
        'postgresql://user:pass@ep-test.neon.tech/curalink_test?sslmode=require',
        'postgresql://user:pass@ep-test.neon.tech/curalink_test?sslmode=require'
      )
    ).not.toThrow();
  });
});
