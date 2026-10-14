import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getSessionSecret } from '@/lib/config/env';

export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production' ? '__Host-admin-session' : 'admin_session';

export const SESSION_DURATION_SECONDS = 30 * 60; // 30분 무활동 자동 만료

export interface SessionPayload {
  sub: string;
  username: string;
  role: 'admin' | 'editor';
  name: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secret = getSessionSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSessionSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      sub: payload.sub as string,
      username: payload.username as string,
      role: payload.role as 'admin' | 'editor',
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });
    return true;
  } catch {
    return false;
  }
}

export async function clearSessionCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return true;
  } catch {
    return false;
  }
}

export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
