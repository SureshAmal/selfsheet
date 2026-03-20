'use server';

import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'selfsheet_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECRET = process.env.SESSION_SECRET || 'default-dev-secret-change-in-production';

interface SessionUser {
  id: string;
  username: string;
  theme: string;
}

function sign(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payload);
  return hmac.digest('hex');
}

function encode(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64');
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function decode(cookie: string): SessionUser | null {
  try {
    const [payload, signature] = cookie.split('.');
    if (!payload || !signature) return null;

    const expectedSignature = sign(payload);
    if (signature !== expectedSignature) return null;

    const json = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(json) as SessionUser;
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const cookieStore = await cookies();
  const value = encode(user);
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  return decode(cookie.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
