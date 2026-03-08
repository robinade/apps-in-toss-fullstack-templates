import { Router } from 'express';
import db from '../db.js';

const router = Router();

const MILESTONE_DEFS = [
  { key: 'day3', label: '3일 출석', required_days: 3, reward_amount: 5 },
  { key: 'day7', label: '7일 출석', required_days: 7, reward_amount: 15 },
  { key: 'day14', label: '14일 출석', required_days: 14, reward_amount: 30 },
  { key: 'day21', label: '21일 출석', required_days: 21, reward_amount: 50 },
  { key: 'day28', label: '28일 출석', required_days: 28, reward_amount: 100 },
];

// Seed milestones
for (const m of MILESTONE_DEFS) {
  db.prepare(
    'INSERT OR IGNORE INTO milestones (key, label, required_days, reward_amount) VALUES (?, ?, ?, ?)'
  ).run(m.key, m.label, m.required_days, m.reward_amount);
}

router.get('/status', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  // Demo: use a simulated current_days (could be from attendance table)
  const balanceRow = db.prepare('SELECT points FROM user_balance WHERE user_id = ?').get(userId) as { points: number } | undefined;

  // For demo, calculate days based on number of milestone claims + some base
  const claimCount = db.prepare(
    'SELECT COUNT(*) as count FROM milestone_claims WHERE user_id = ?'
  ).get(userId) as { count: number };
  const currentDays = Math.max(claimCount.count * 3 + 5, 5); // Demo progression

  const milestones = db.prepare('SELECT * FROM milestones ORDER BY required_days').all() as Array<{
    key: string; label: string; required_days: number; reward_amount: number;
  }>;

  const claims = db.prepare(
    'SELECT milestone_key FROM milestone_claims WHERE user_id = ?'
  ).all(userId) as Array<{ milestone_key: string }>;
  const claimedSet = new Set(claims.map((c) => c.milestone_key));

  const result = milestones.map((m) => ({
    key: m.key,
    label: m.label,
    requiredDays: m.required_days,
    rewardAmount: m.reward_amount,
    isReached: currentDays >= m.required_days,
    isClaimed: claimedSet.has(m.key),
  }));

  res.json({ success: true, data: { milestones: result, currentDays } });
});

router.post('/claim', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const { key } = req.body;

  const milestone = db.prepare('SELECT * FROM milestones WHERE key = ?').get(key) as {
    reward_amount: number;
  } | undefined;

  if (!milestone) {
    res.status(404).json({ success: false, error: '마일스톤을 찾을 수 없어요.' });
    return;
  }

  const existing = db.prepare(
    'SELECT * FROM milestone_claims WHERE user_id = ? AND milestone_key = ?'
  ).get(userId, key);

  if (existing) {
    res.status(400).json({ success: false, error: '이미 수령한 마일스톤이에요.' });
    return;
  }

  db.prepare(
    'INSERT INTO milestone_claims (user_id, milestone_key, reward_amount) VALUES (?, ?, ?)'
  ).run(userId, key, milestone.reward_amount);

  // Add to balance
  db.prepare(
    `INSERT INTO user_balance (user_id, points)
     VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET points = points + ?`
  ).run(userId, milestone.reward_amount, milestone.reward_amount);

  res.json({ success: true, data: { rewardAmount: milestone.reward_amount } });
});

export default router;
