import { PrismaClient } from '@prisma/client';
import { json, type RequestHandler } from '@sveltejs/kit';

const prisma = new PrismaClient();

// Utility to safely serialize BigInt values
function serializeBigInts(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'bigint' ? value.toString() : value
    ])
  );
}

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) return json({ error: 'Not logged in' }, { status: 401 });

    let gameState = await prisma.gameState.findUnique({ where: { userId } });
    if (!gameState) {
      gameState = await prisma.gameState.create({ data: { userId } });
    }

    return json(serializeBigInts(gameState));
  } catch (err) {
    console.error('GET /api/game-state error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) return json({ error: 'Not logged in' }, { status: 401 });

    const data = await request.json();
    await prisma.gameState.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data }
    });

    return json({ success: true });
  } catch (err) {
    console.error('API error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};