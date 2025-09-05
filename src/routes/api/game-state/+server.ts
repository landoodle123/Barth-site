import { PrismaClient } from '@prisma/client';
import { json, type RequestHandler } from '@sveltejs/kit';

const prisma = new PrismaClient();

// Obfuscated anti-cheat: resets if account <1 day old and jump is huge
function _ac(prev, next, createdAt) {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const age = (now - created) / (1000 * 60 * 60 * 24); // days since account creation
  const jump = (next.count ?? 0) - (prev.count ?? 0);
  // If account is less than 1 day old and jump is more than 10,000, flag as cheat
  return age < 1 && jump > 500000000;
}

export const GET: RequestHandler = async ({ locals }) => {
  try {
    const userId = locals.user?.id;
    if (!userId) return json({ error: 'Not logged in' }, { status: 401 });

    let gameState = await prisma.gameState.findUnique({ where: { userId } });
    if (!gameState) {
      await prisma.gameState.create({ data: { userId } });
      gameState = await prisma.gameState.findUnique({ where: { userId } });
    }
    return json(gameState);
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
    const prev = await prisma.gameState.findUnique({ where: { userId } });
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, name: true, email: true, password: true }
    });

    // Remove 'createdAt' from user select, since it's not in your schema
    // Instead, use the createdAt from the GameState model (if you want creation time)
    if (prev && prev.userId && prev.updatedAt && _ac(prev, { count: data.count ?? 0 }, prev.updatedAt)) {
      await prisma.gameState.update({
      where: { userId },
      data: {
        count: 0,
        amountGained: 1,
        clickerCount: 0,
        clickerCost: 100,
        multiplierCost: 150,
        clickerMultiplierCost: 1000,
        clickerGain: 1
      }
      });
      return json({ error: 'anticheat' }, { status: 403 });
    }

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