process.env.PORT = '5000';
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';
process.env.JWT_SECRET = 'db3d76e73c8d19ab42668fc1ec50efdbf5d8e137f8469e32a24fa68b9cf19a3b6807eb8e2a33ffb909f2b3e85e4a838be812d45a90d859fa3b16dbb67cf9d564';
process.env.JWT_EXPIRES_IN = '1h';
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

