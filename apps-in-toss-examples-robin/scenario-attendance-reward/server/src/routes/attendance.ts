import { Router } from 'express';
import db from '../db.js';

const router = Router();

const STREAK_BONUSES: Record<number, number> = {
  3: 1, 7: 3, 14: 5, 28: 10,
};

function getStreakBonus(streak: number): number {
  return STREAK_BONUSES[streak] ?? 0;
}

router.get('/status', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const today = new Date().toISOString().split('T')[0];

  const todayCheck = db.prepare(
    'SELECT * FROM attendance WHERE user_id = ? AND check_date = ?'
  ).get(userId, today);

  // Calculate streak
  let streak = 0;
  const date = new Date();
  if (todayCheck) {
    streak = 1;
    date.setDate(date.getDate() - 1);
  }
  while (true) {
    const dateStr = date.toISOString().split('T')[0];
    const check = db.prepare(
      'SELECT * FROM attendance WHERE user_id = ? AND check_date = ?'
    ).get(userId, dateStr);
    if (!check) break;
    streak++;
    date.setDate(date.getDate() - 1);
  }

  const monthStart = `${today.substring(0, 7)}-01`;
  const monthlyDays = db.prepare(
    'SELECT COUNT(*) as count FROM attendance WHERE user_id = ? AND check_date >= ?'
  ).get(userId, monthStart) as { count: number };

  res.json({
    success: true,
    data: {
      checked: !!todayCheck,
      streak,
      todayReward: 1 + getStreakBonus(streak),
      monthlyDays: monthlyDays.count,
    },
  });
});

router.get('/history', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const rows = db.prepare(
    'SELECT check_date FROM attendance WHERE user_id = ? ORDER BY check_date DESC LIMIT 90'
  ).all(userId) as Array<{ check_date: string }>;

  res.json({
    success: true,
    data: { dates: rows.map((r) => r.check_date) },
  });
});

router.post('/check-in', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const today = new Date().toISOString().split('T')[0];

  const existing = db.prepare(
    'SELECT * FROM attendance WHERE user_id = ? AND check_date = ?'
  ).get(userId, today);

  if (existing) {
    res.status(400).json({ success: false, error: '오늘은 이미 출석했어요.' });
    return;
  }

  // Calculate streak before insert
  let streak = 1;
  const date = new Date();
  date.setDate(date.getDate() - 1);
  while (true) {
    const dateStr = date.toISOString().split('T')[0];
    const check = db.prepare(
      'SELECT * FROM attendance WHERE user_id = ? AND check_date = ?'
    ).get(userId, dateStr);
    if (!check) break;
    streak++;
    date.setDate(date.getDate() - 1);
  }

  const streakBonus = getStreakBonus(streak);
  const reward = 1;

  db.prepare(
    'INSERT INTO attendance (user_id, check_date, reward_amount, streak_bonus) VALUES (?, ?, ?, ?)'
  ).run(userId, today, reward, streakBonus);

  res.json({
    success: true,
    data: { reward, streakBonus, streak },
  });
});

export default router;
