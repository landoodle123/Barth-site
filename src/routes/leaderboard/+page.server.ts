// src/routes/leaderboard/+page.server.ts
import { prisma } from '$lib/server/prisma'; // this file must exist

export async function load() {
  const leaderboard = await prisma.gameState.findMany({
    orderBy: {
      count: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    leaderboard
  };
}
