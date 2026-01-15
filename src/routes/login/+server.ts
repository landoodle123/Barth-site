import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password, remember, sessionID } = await request.json();

  if (!email || !password || password.length < 8) {
    return json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  cookies.set('session', sessionID, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: remember ? 60 * 60 * 24 * 30 : undefined // 30 days if remember, else session cookie
  });

  return json({ success: true });
};