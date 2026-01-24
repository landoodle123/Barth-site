import { prisma } from '$lib/server/prisma';
import { json } from '@sveltejs/kit';
import { _serializeBigInts } from '../game-state/+server';

export const GET = async () => {
  try {
    const leaderboard = await prisma.gameState.findMany({
      orderBy: { count: 'desc' },
      include: { user: { select: { name: true } } },
      take: 10, // top 10
    });

    return json(_serializeBigInts(leaderboard));
  } catch (err) {
    console.error('GET /api/leaderboard error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
