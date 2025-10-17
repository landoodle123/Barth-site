import { PrismaClient } from '@prisma/client';
import { json, type RequestHandler } from '@sveltejs/kit';

const prisma = new PrismaClient();
const MAX_COUNT = 2_000_000_000; // cap to avoid DB/overflow issues
const ANTICHEAT_JUMP = 500_000_000;

// helper: clamp and convert to safe BigInt for Prisma
function toSafeBigInt(v: unknown, def = 0): bigint {
  const n = Number(v ?? def);
  const clamped = Math.max(0, Math.min(MAX_COUNT, Math.floor(Number.isFinite(n) ? n : def)));
  return BigInt(clamped);
}

// helper: convert BigInt values (and nested) to JSON-friendly values
function serializeBigInts(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(serializeBigInts);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'bigint') out[k] = v.toString();
    else if (v instanceof Date) out[k] = v.toISOString();
    else if (v && typeof v === 'object') out[k] = serializeBigInts(v);
    else out[k] = v;
  }
  return out;
}

// simple anticheat: block giant absolute counts or giant jumps
function isAntiCheat(prev: any, nextCountNum: number) {
  const prevNum = Number(prev?.count ?? 0);
  const jump = nextCountNum - prevNum;
  if (nextCountNum > MAX_COUNT) return true;
  if (jump > ANTICHEAT_JUMP) return true;
  return false;
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

    const body = await request.json();

    // normalize client-sent count to a Number for validation
    const clientCountNum = Number(body?.count ?? 0);

    const prev = await prisma.gameState.findUnique({ where: { userId } });

    // anticheat check (absolute and jump)
    if (prev && isAntiCheat(prev, clientCountNum)) {
      // reset their state if cheating detected
      await prisma.gameState.update({
        where: { userId },
        data: {
          count: BigInt(0),
          amountGained: BigInt(1),
          clickerCount: BigInt(0),
          clickerCost: BigInt(100),
          multiplierCost: BigInt(150),
          clickerMultiplierCost: BigInt(1000),
          clickerGain: BigInt(1)
        }
      });
      return json({ error: 'anticheat' }, { status: 403 });
    }

    // prepare safe values for prisma (BigInt)
    // prepare safe values for prisma (BigInt)
        const safe = {
          count: toSafeBigInt(body?.count ?? 0),
          amountGained: toSafeBigInt(body?.amountGained ?? 1),
          clickerCount: toSafeBigInt(body?.clickerCount ?? 0),
          clickerCost: toSafeBigInt(body?.clickerCost ?? 100),
          multiplierCost: toSafeBigInt(body?.multiplierCost ?? 150),
          clickerMultiplierCost: toSafeBigInt(body?.clickerMultiplierCost ?? 1000),
          clickerGain: toSafeBigInt(body?.clickerGain ?? 1)
        };
        await prisma.gameState.upsert({
          where: { userId },
          update: safe,
          create: { userId, ...safe }
        });
    return json({ success: true });
  } catch (err) {
    console.error('API error:', err);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};