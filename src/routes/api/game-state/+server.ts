import { PrismaClient } from '@prisma/client';
import { json, type RequestHandler } from '@sveltejs/kit';

const prisma = new PrismaClient();

const MAX_COUNT = 2_000_000_000; // cap to avoid DB/overflow issues
const ANTICHEAT_JUMP = 500_000_000;

/* -------------------- helpers -------------------- */

// clamp and convert to BigInt safely
function toSafeBigInt(v: unknown, def = 0): bigint {
  const n = Number(v ?? def);
  const clamped = Math.max(
    0,
    Math.min(MAX_COUNT, Math.floor(Number.isFinite(n) ? n : def))
  );
  return BigInt(clamped);
}

export function _serializeBigInts(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(_serializeBigInts);

  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'bigint') out[k] = v.toString();
    else if (v instanceof Date) out[k] = v.toISOString();
    else if (v && typeof v === 'object') out[k] = _serializeBigInts(v);
    else out[k] = v;
  }
  return out;
}

function isAntiCheat(prev: any, nextCountNum: number) {
  const prevNum = Number(prev?.count ?? 0);
  const jump = nextCountNum - prevNum;

  if (nextCountNum > MAX_COUNT) return true;
  if (jump > ANTICHEAT_JUMP) return true;

  return false;
}

/* -------- session validation (NO locals.user) -------- */

async function getUserFromSession(cookies: any) {
  const token = cookies.get('session');
  if (!token) return null;

  return prisma.user.findUnique({
    where: { sessionToken: token }
  });
}

/* -------------------- GET -------------------- */

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const user = await getUserFromSession(cookies);
    if (!user) {
      return json({ error: 'Not logged in' }, { status: 401 });
    }

    let gameState = await prisma.gameState.findUnique({
      where: { userId: user.id }
    });

    if (!gameState) {
      await prisma.gameState.create({
        data: { userId: user.id }
      });

      gameState = await prisma.gameState.findUnique({
        where: { userId: user.id }
      });
    }

    return json(_serializeBigInts(gameState));
  } catch (err) {
    console.error('GET /api/game-state error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

/* -------------------- POST -------------------- */

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const user = await getUserFromSession(cookies);
    if (!user) {
      return json({ error: 'Not logged in' }, { status: 401 });
    }

    const body = await request.json();

    const clientCountNum = Number(body?.count ?? 0);
    const prev = await prisma.gameState.findUnique({
      where: { userId: user.id }
    });

    if (prev && isAntiCheat(prev, clientCountNum)) {
      // reset on anticheat
      await prisma.gameState.update({
        where: { userId: user.id },
        data: {
          count: BigInt(0),
          amountGained: BigInt(1),
          clickerCount: BigInt(0),
          clickerCost: BigInt(100),
          multiplierCost: BigInt(150),
          clickerMultiplierCost: BigInt(1000),
          clickerGain: BigInt(1),
          offlineClickerCount: BigInt(0),
          offlineClickerCost: BigInt(500)
        }
      });

      return json({ error: 'anticheat' }, { status: 403 });
    }

    const safe = {
      count: toSafeBigInt(body?.count ?? 0),
      amountGained: toSafeBigInt(body?.amountGained ?? 1),
      clickerCount: toSafeBigInt(body?.clickerCount ?? 0),
      clickerCost: toSafeBigInt(body?.clickerCost ?? 100),
      multiplierCost: toSafeBigInt(body?.multiplierCost ?? 150),
      clickerMultiplierCost: toSafeBigInt(
        body?.clickerMultiplierCost ?? 1000
      ),
      clickerGain: toSafeBigInt(body?.clickerGain ?? 1),

      ...(body?.offlineClickerCount !== undefined
        ? { offlineClickerCount: toSafeBigInt(body.offlineClickerCount) }
        : {}),

      ...(body?.offlineClickerCost !== undefined
        ? { offlineClickerCost: toSafeBigInt(body.offlineClickerCost) }
        : {})
    };

    await prisma.gameState.upsert({
      where: { userId: user.id },
      update: safe,
      create: { userId: user.id, ...safe }
    });

    const saved = await prisma.gameState.findUnique({
      where: { userId: user.id }
    });

    return json(_serializeBigInts(saved));
  } catch (err) {
    console.error('POST /api/game-state error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
