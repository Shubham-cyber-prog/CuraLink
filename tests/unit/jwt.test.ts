import { generateToken, verifyToken, JwtPayload } from '../../src/utils/jwt';
import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { env } from '../../src/config/env';

describe('JWT Utilities', () => {
  const samplePayload: JwtPayload = {
    id: 'user-uuid-1234',
    email: 'test@curalink.com',
    role: Role.PATIENT,
  };

  it('should generate a valid JWT token and verify it correctly', () => {
    const token = generateToken(samplePayload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);

    const decoded = verifyToken(token);
    expect(decoded.id).toBe(samplePayload.id);
    expect(decoded.email).toBe(samplePayload.email);
    expect(decoded.role).toBe(samplePayload.role);
  });

  it('should throw an error when token signature is invalid', () => {
    const fakeToken = jwt.sign(samplePayload, 'wrong-secret-key-12345678901234567890');
    expect(() => verifyToken(fakeToken)).toThrow('Invalid token');
  });

  it('should throw an error when token is expired', () => {
    const expiredToken = jwt.sign(samplePayload, env.JWT_SECRET, { expiresIn: -10 });
    expect(() => verifyToken(expiredToken)).toThrow('Token expired');
  });
});
