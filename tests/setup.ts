process.env.PORT = '5000';
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test', writable: true });
process.env.DATABASE_URL = 'postgresql://user:password@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret-key-must-be-at-least-32-chars-long';
process.env.JWT_EXPIRES_IN = '1h';
