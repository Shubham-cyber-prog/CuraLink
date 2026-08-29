import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../src/middleware/auth.middleware';
import { authorize } from '../../src/middleware/role.middleware';
import { generateToken } from '../../src/utils/jwt';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../../src/utils/errors';

describe('Middleware Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('authenticate Middleware', () => {
    it('should reject request when Authorization header is missing', () => {
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect(mockNext.mock.calls[0][0].message).toBe('Authentication token is required');
    });

    it('should reject request when Authorization header does not start with Bearer', () => {
      mockReq.headers = { authorization: 'Basic token123' };
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should reject request when token is invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid.token.str' };
      authenticate(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should attach user context to req.user when token is valid', () => {
      const validToken = generateToken({
        id: 'user-1',
        email: 'patient@curalink.com',
        role: Role.PATIENT,
      });

      mockReq.headers = { authorization: `Bearer ${validToken}` };

      authenticate(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.user).toEqual({
        id: 'user-1',
        email: 'patient@curalink.com',
        role: Role.PATIENT,
      });
    });
  });

  describe('authorize Middleware', () => {
    it('should call next with UnauthorizedError if req.user is missing', () => {
      const middleware = authorize(Role.DOCTOR);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should call next with ForbiddenError if user role is not authorized', () => {
      mockReq.user = { id: 'user-1', email: 'p@c.com', role: Role.PATIENT };
      const middleware = authorize(Role.DOCTOR, Role.ADMIN);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });

    it('should call next without error if user role matches allowed roles', () => {
      mockReq.user = { id: 'user-1', email: 'd@c.com', role: Role.DOCTOR };
      const middleware = authorize(Role.DOCTOR, Role.ADMIN);
      middleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
