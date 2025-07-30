import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handle({ event, resolve }) {
  const session = event.cookies.get('session');
  if (session) {
    try {
      const user = await prisma.user.findUnique({ where: { id: session } });
      if (user) {
        event.locals.user = { id: user.id, email: user.email };
      }
    } catch (e) {
      // Optionally log error
    }
  }
  return resolve(event);
}