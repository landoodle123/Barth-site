// src/routes/api/check-session/+server.ts
import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserFromSession(cookies: any) {
  const token = cookies.get('session');
  if (!token) return null;

  return prisma.user.findUnique({ where: { sessionToken: token } });
}

export const GET = async ({ cookies }) => {
  const user = await getUserFromSession(cookies);
  if (!user) return json({ loggedIn: false }, { status: 401 });
  return json({ loggedIn: true });
};
