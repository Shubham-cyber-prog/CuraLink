import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { requestId } from '../../src/middleware/request-id.middleware';
import { errorHandler } from '../../src/middleware/error.middleware';

describe('Central Error Handler & Request ID Security Tests', () => {
  const createTestApp = () => {
    const app = express();
    app.use(requestId);

    app.get('/ok', (req, res) => {
      res.status(200).json({ status: 'ok', reqId: req.id });
    });

    app.get('/trigger-error', (_req, _res, next) => {
      next(new Error('Sensitive database connection string: postgresql://admin:secret123@neon.db'));
    });

    app.use(errorHandler);
    return app;
  };

  const app = createTestApp();

  it('should generate and return X-Request-Id header on all responses', async () => {
    const response = await request(app).get('/ok');

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBeDefined();
    expect(typeof response.headers['x-request-id']).toBe('string');
    expect(response.headers['x-request-id'].length).toBeGreaterThan(10);
    expect(response.body.reqId).toBe(response.headers['x-request-id']);
  });

  it('should propagate incoming X-Request-Id header if provided by client or proxy', async () => {
    const customId = 'client-req-uuid-999';
    const response = await request(app)
      .get('/ok')
      .set('X-Request-Id', customId);

    expect(response.status).toBe(200);
    expect(response.headers['x-request-id']).toBe(customId);
    expect(response.body.reqId).toBe(customId);
  });

  it('should NEVER leak stack trace or internal database error messages in production responses', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      const response = await request(app)
        .get('/trigger-error')
        .set('X-Request-Id', 'test-trace-id-123');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.stack).toBeUndefined();
      expect(response.body.requestId).toBe('test-trace-id-123');
      expect(JSON.stringify(response.body)).not.toContain('postgresql://admin:secret123');

      // Verify that server console logs logged with the request ID
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[RequestID: test-trace-id-123]'),
        expect.any(Error)
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    }
  });
});
