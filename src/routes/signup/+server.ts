import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
  const { email, name, password } = await request.json();

  if (!email || !password || password.length < 8) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return json({ error: 'Email already in use' }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashed
    }
  });

  return json({ success: true });
};