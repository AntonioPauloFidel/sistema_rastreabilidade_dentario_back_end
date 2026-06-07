import { CookieOptions, Request, Response } from 'express';
import { env } from '../config/env';

export const ACCESS_TOKEN_COOKIE = 'sirde_access_token';
export const REFRESH_TOKEN_COOKIE = 'sirde_refresh_token';

const isProduction = env.NODE_ENV === 'production';

const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/'
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 5 * 60 * 1000
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function setAccessTokenCookie(res: Response, accessToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 5 * 60 * 1000
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseCookieOptions);
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions);
}

export function getCookie(req: Request, name: string) {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .map((cookie) => {
      const separatorIndex = cookie.indexOf('=');
      return {
        name: cookie.slice(0, separatorIndex),
        value: decodeURIComponent(cookie.slice(separatorIndex + 1))
      };
    })
    .find((cookie) => cookie.name === name)?.value;
}
