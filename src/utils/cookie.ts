import { Response } from 'express';
import { env } from '../config/env';

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
  const isProduction = env.NODE_ENV === 'production';

  res.cookie('curalink_access', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  if (refreshToken) {
    res.cookie('curalink_refresh', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/api/auth/refresh', // Restrict refresh token to refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}

export function clearAuthCookies(res: Response) {
  const isProduction = env.NODE_ENV === 'production';
  
  res.cookie('curalink_access', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });

  res.cookie('curalink_refresh', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/api/auth/refresh',
    expires: new Date(0),
  });
}
