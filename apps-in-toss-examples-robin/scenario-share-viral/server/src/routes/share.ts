import { Router } from 'express';
import db from '../db.js';

const router = Router();
const MAX_DAILY_SHARES = 10;

// GET /api/share/status — 공유 현황
router.get('/status', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const today = new Date().toISOString().split('T')[0];

  const todayCount = db.prepare(
    'SELECT COUNT(*) as count FROM shares WHERE user_id = ? AND date(created_at) = ?'
  ).get(userId, today) as { count: number };

  const totalRewards = db.prepare(
    'SELECT COALESCE(SUM(reward_amount), 0) as total FROM shares WHERE user_id = ? AND success = 1'
  ).get(userId) as { total: number };

  const recentShares = db.prepare(
    'SELECT * FROM shares WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(userId);

  res.json({
    success: true,
    data: {
      todayShareCount: todayCount.count,
      remainingShares: Math.max(0, MAX_DAILY_SHARES - todayCount.count),
      totalRewards: totalRewards.total,
      canShare: todayCount.count < MAX_DAILY_SHARES,
      recentShares,
    },
  });
});

// POST /api/share/record — 공유 기록
router.post('/record', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const { success, rewardAmount = 1, rewardUnit = '기회' } = req.body;
  const today = new Date().toISOString().split('T')[0];

  // 일일 제한 체크
  const todayCount = db.prepare(
    'SELECT COUNT(*) as count FROM shares WHERE user_id = ? AND date(created_at) = ?'
  ).get(userId, today) as { count: number };

  if (todayCount.count >= MAX_DAILY_SHARES) {
    res.status(429).json({
      success: false,
      error: '오늘의 공유 횟수를 모두 사용했어요.',
    });
    return;
  }

  const result = db.prepare(
    'INSERT INTO shares (user_id, success, reward_amount, reward_unit) VALUES (?, ?, ?, ?)'
  ).run(userId, success ? 1 : 0, success ? rewardAmount : 0, rewardUnit);

  res.json({
    success: true,
    data: {
      id: result.lastInsertRowid,
      rewardAmount: success ? rewardAmount : 0,
      rewardUnit,
      remainingShares: MAX_DAILY_SHARES - todayCount.count - 1,
    },
  });
});

export default router;
