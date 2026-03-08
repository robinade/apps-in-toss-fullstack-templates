import { Router } from 'express';
import db from '../db.js';

const router = Router();

const PRIZE_TABLE = [
  { tier: '1등', name: '대박!', amount: 100, probability: 0.01 },
  { tier: '2등', name: '럭키!', amount: 50, probability: 0.05 },
  { tier: '3등', name: '좋아요', amount: 10, probability: 0.20 },
  { tier: '4등', name: '아깝다', amount: 1, probability: 0.40 },
  { tier: '꽝', name: '다음에', amount: 0, probability: 0.34 },
];

function drawPrize() {
  const rand = Math.random();
  let cumulative = 0;
  for (const prize of PRIZE_TABLE) {
    cumulative += prize.probability;
    if (rand <= cumulative) {
      return { tier: prize.tier, prizeName: prize.name, prizeAmount: prize.amount };
    }
  }
  return { tier: '꽝', prizeName: '다음에', prizeAmount: 0 };
}

router.get('/status', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const userChances = db.prepare(
    'SELECT chances FROM user_chances WHERE user_id = ?'
  ).get(userId) as { chances: number } | undefined;

  const recentResults = db.prepare(
    'SELECT prize_tier as tier, prize_name as prizeName, prize_amount as prizeAmount FROM lottery_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(userId);

  res.json({
    success: true,
    data: {
      chances: userChances?.chances ?? 0,
      recentResults,
    },
  });
});

router.post('/watch-ad', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  db.prepare(
    `INSERT INTO user_chances (user_id, chances, last_ad_watched)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET chances = chances + 1, last_ad_watched = datetime('now')`
  ).run(userId);

  const row = db.prepare('SELECT chances FROM user_chances WHERE user_id = ?').get(userId) as { chances: number };

  res.json({ success: true, data: { chances: row.chances } });
});

router.post('/draw', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const userChances = db.prepare(
    'SELECT chances FROM user_chances WHERE user_id = ?'
  ).get(userId) as { chances: number } | undefined;

  if (!userChances || userChances.chances <= 0) {
    res.status(400).json({ success: false, error: '기회가 없어요. 광고를 시청하세요!' });
    return;
  }

  // Deduct chance
  db.prepare('UPDATE user_chances SET chances = chances - 1 WHERE user_id = ?').run(userId);

  // Draw
  const result = drawPrize();

  // Record result
  db.prepare(
    'INSERT INTO lottery_results (user_id, prize_tier, prize_name, prize_amount) VALUES (?, ?, ?, ?)'
  ).run(userId, result.tier, result.prizeName, result.prizeAmount);

  res.json({ success: true, data: result });
});

export default router;
