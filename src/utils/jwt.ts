import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '../types/role';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export function generateToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(userId: string, jti: string): string {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'],
    jwtid: jti,
  };
  return jwt.sign({ id: userId }, env.JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

export function verifyRefreshToken(token: string): { id: string, jti: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string, jti: string };
    if (!decoded || !decoded.id || !decoded.jti) {
      throw new Error('Invalid refresh token payload');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    throw new Error('Invalid refresh token');
  }
}

export function generateResetToken(userId: string, passwordHash: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET + passwordHash, { expiresIn: '15m' });
}

export function verifyResetToken(token: string, passwordHash: string): { id: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET + passwordHash) as { id: string };
    if (!decoded || !decoded.id) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Reset token expired');
    }
    throw new Error('Invalid reset token');
  }
}

export function decodeToken(token: string): any {
  return jwt.decode(token);
}


