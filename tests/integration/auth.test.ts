import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import { hashPassword } from '../../src/utils/password';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '@prisma/client';

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockFindUnique = prisma.user.findUnique as unknown as jest.Mock;
const mockCreate = prisma.user.create as unknown as jest.Mock;

describe('Authentication API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: 'SecurePassword123!',
      role: 'PATIENT',
    };

    it('should register a new user successfully with HTTP 201', async () => {
      mockFindUnique.mockResolvedValue(null);

      const fakeDbUser = {
        id: 'uuid-user-1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        passwordHash: 'hashed_pw',
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreate.mockResolvedValue(fakeDbUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('jane.doe@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Must not expose passwordHash
    });

    it('should return HTTP 409 Conflict if email is already registered', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'existing-id',
        name: 'Existing User',
        email: 'jane.doe@example.com',
        passwordHash: 'hash',
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(validRegisterData);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should return HTTP 400 Bad Request for invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validRegisterData, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return HTTP 400 Bad Request if user attempts to register as ADMIN', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validRegisterData, role: 'ADMIN' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('ADMIN role is strictly forbidden');
    });
  });

  describe('POST /api/auth/login', () => {
    const loginData = {
      email: 'jane.doe@example.com',
      password: 'SecurePassword123!',
    };

    it('should login successfully and return JWT token with HTTP 200', async () => {
      const hashedPassword = await hashPassword('SecurePassword123!');

      mockFindUnique.mockResolvedValue({
        id: 'uuid-user-1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        passwordHash: hashedPassword,
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('jane.doe@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return HTTP 401 for non-existent email', async () => {
      mockFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return HTTP 401 for incorrect password', async () => {
      const hashedPassword = await hashPassword('DifferentPassword123!');

      mockFindUnique.mockResolvedValue({
        id: 'uuid-user-1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        passwordHash: hashedPassword,
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated user profile with HTTP 200', async () => {
      const user = {
        id: 'uuid-user-1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: Role.PATIENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      mockFindUnique.mockResolvedValue({
        ...user,
        passwordHash: 'hash',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe(user.id);
    });

    it('should return HTTP 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  describe('Role Authorization Endpoints', () => {
    it('should allow access to /api/auth/doctor-only for DOCTOR role', async () => {
      const token = generateToken({
        id: 'doc-1',
        email: 'doctor@curalink.com',
        role: Role.DOCTOR,
      });

      const res = await request(app)
        .get('/api/auth/doctor-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Doctor');
    });

    it('should deny access to /api/auth/doctor-only for PATIENT role with HTTP 403', async () => {
      const token = generateToken({
        id: 'patient-1',
        email: 'patient@curalink.com',
        role: Role.PATIENT,
      });

      const res = await request(app)
        .get('/api/auth/doctor-only')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return HTTP 200 and success status', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logout successful');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should return success and a token for existing email', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'user-id-123',
        email: 'jane.doe@example.com',
        passwordHash: 'hashedpassword123',
        name: 'Jane Doe',
        role: Role.PATIENT,
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'jane.doe@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should return success and generic message but no token for non-existent email', async () => {
      mockFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@curalink.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeUndefined();
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password successfully with valid inputs and token', async () => {
      const mockUser = {
        id: 'user-id-123',
        email: 'jane.doe@example.com',
        passwordHash: 'oldhash',
        name: 'Jane Doe',
        role: Role.PATIENT,
      };

      // Since we need to generate a real reset token for the test, let's do it using generateResetToken
      const { generateResetToken } = require('../../src/utils/jwt');
      const token = generateResetToken(mockUser.id, mockUser.passwordHash);

      mockFindUnique.mockResolvedValue(mockUser);
      // Mock prisma.user.update as well
      const mockUpdate = jest.fn().mockResolvedValue(mockUser);
      prisma.user.update = mockUpdate;

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token,
          password: 'NewSecurePassword123!',
          confirmPassword: 'NewSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('successful');
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should fail with HTTP 400 if passwords do not match', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          password: 'NewSecurePassword123!',
          confirmPassword: 'NonMatchingPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});

