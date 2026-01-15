import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma'; // if you moved the above global client there

async function getUserFromSession(cookies: any) {
  const token = cookies.get('session');
  if (!token) return null;

  return prisma.user.findUnique({ where: { sessionToken: token } });
}

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const user = await getUserFromSession(cookies);
    if (!user) return json({ loggedIn: false }, { status: 401 });

    return json({ loggedIn: true });
  } catch (err) {
    console.error('Error checking session:', err);
    return json({ loggedIn: false, error: 'Server error' }, { status: 500 });
  }
};
