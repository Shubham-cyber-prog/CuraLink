import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { validateRequest } from '../../src/middleware/validate.middleware';
import { errorHandler } from '../../src/middleware/error.middleware';

describe('Central Zod Request Validation Middleware', () => {
  const setupTestApp = () => {
    const app = express();
    app.use(express.json());

    const bodySchema = z.object({
      age: z.coerce.number().min(18, 'Must be at least 18'),
      email: z.string().email('Invalid email address'),
    });

    const querySchema = z.object({
      page: z.coerce.number().int().min(1),
    });

    const paramsSchema = z.object({
      id: z.string().uuid('ID must be a valid UUID'),
    });

    app.post(
      '/users/:id',
      validateRequest({
        body: bodySchema,
        query: querySchema,
        params: paramsSchema,
      }),
      (req, res) => {
        res.status(200).json({
          success: true,
          data: {
            body: req.body,
            query: req.query,
            params: req.params,
          },
        });
      }
    );

    app.use(errorHandler);
    return app;
  };

  const app = setupTestApp();
  const validUuid = '123e4567-e89b-12d3-a456-426614174000';

  it('should pass validation and coerce types when body, query, and params are valid', async () => {
    const response = await request(app)
      .post(`/users/${validUuid}?page=2`)
      .send({ age: '25', email: 'test@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.body.age).toBe(25);
    expect(response.body.data.query.page).toBe(2);
    expect(response.body.data.params.id).toBe(validUuid);
  });

  it('should reject invalid body with 400 and clear error details', async () => {
    const response = await request(app)
      .post(`/users/${validUuid}?page=1`)
      .send({ age: 15, email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Must be at least 18/);
  });

  it('should reject invalid query with 400', async () => {
    const response = await request(app)
      .post(`/users/${validUuid}?page=0`)
      .send({ age: 20, email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/page/);
  });

  it('should reject invalid params with 400', async () => {
    const response = await request(app)
      .post('/users/not-a-uuid?page=1')
      .send({ age: 20, email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/ID must be a valid UUID/);
  });
});
