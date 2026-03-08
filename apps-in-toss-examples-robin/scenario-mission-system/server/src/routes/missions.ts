import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Seed 데모 미션 (서버 시작 시)
const DEMO_MISSIONS = [
  { key: 'visit', title: '앱 방문하기', description: '앱에 방문하세요', type: 'daily', target_count: 1, reward_amount: 10 },
  { key: 'share', title: '공유하기', description: '친구에게 3번 공유하세요', type: 'daily', target_count: 3, reward_amount: 30 },
  { key: 'attend', title: '출석하기', description: '5일 출석하세요', type: 'weekly', target_count: 5, reward_amount: 50 },
  { key: 'watch_ad', title: '광고 보기', description: '광고를 2번 시청하세요', type: 'daily', target_count: 2, reward_amount: 20 },
  { key: 'profile', title: '프로필 완성', description: '프로필을 완성하세요', type: 'achievement', target_count: 1, reward_amount: 15 },
];

// Seed on import
for (const m of DEMO_MISSIONS) {
  db.prepare(
    `INSERT OR IGNORE INTO missions (key, title, description, type, target_count, reward_amount)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(m.key, m.title, m.description, m.type, m.target_count, m.reward_amount);
}

// GET /api/missions/list
router.get('/list', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const missions = db.prepare('SELECT * FROM missions').all() as Array<{
    key: string; title: string; description: string; type: string;
    target_count: number; reward_amount: number;
  }>;

  const progressRows = db.prepare(
    'SELECT * FROM mission_progress WHERE user_id = ?'
  ).all(userId) as Array<{
    mission_key: string; current_count: number; completed: number; claimed: number;
  }>;

  const progressMap = new Map(progressRows.map((p) => [p.mission_key, p]));

  const result = missions.map((m) => {
    const p = progressMap.get(m.key);
    return {
      key: m.key,
      title: m.title,
      description: m.description,
      type: m.type,
      targetCount: m.target_count,
      currentCount: p?.current_count ?? 0,
      rewardAmount: m.reward_amount,
      completed: p?.completed === 1,
      claimed: p?.claimed === 1,
    };
  });

  const totalEarned = progressRows
    .filter((p) => p.claimed === 1)
    .reduce((sum, p) => {
      const m = missions.find((mi) => mi.key === p.mission_key);
      return sum + (m?.reward_amount ?? 0);
    }, 0);

  res.json({ success: true, data: { missions: result, totalEarned } });
});

// POST /api/missions/progress
router.post('/progress', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const { key, count = 1 } = req.body;

  const mission = db.prepare('SELECT * FROM missions WHERE key = ?').get(key) as {
    target_count: number;
  } | undefined;

  if (!mission) {
    res.status(404).json({ success: false, error: '미션을 찾을 수 없어요.' });
    return;
  }

  db.prepare(
    `INSERT INTO mission_progress (user_id, mission_key, current_count)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, mission_key) DO UPDATE SET
       current_count = MIN(current_count + ?, ?),
       updated_at = datetime('now')`
  ).run(userId, key, Math.min(count, mission.target_count), count, mission.target_count);

  // Check completion
  const progress = db.prepare(
    'SELECT current_count FROM mission_progress WHERE user_id = ? AND mission_key = ?'
  ).get(userId, key) as { current_count: number };

  if (progress.current_count >= mission.target_count) {
    db.prepare(
      'UPDATE mission_progress SET completed = 1 WHERE user_id = ? AND mission_key = ?'
    ).run(userId, key);
  }

  res.json({ success: true, data: { currentCount: progress.current_count } });
});

// POST /api/missions/claim
router.post('/claim', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const { key } = req.body;

  const progress = db.prepare(
    'SELECT * FROM mission_progress WHERE user_id = ? AND mission_key = ?'
  ).get(userId, key) as { completed: number; claimed: number } | undefined;

  if (!progress || progress.completed !== 1) {
    res.status(400).json({ success: false, error: '미션을 아직 완료하지 않았어요.' });
    return;
  }

  if (progress.claimed === 1) {
    res.status(400).json({ success: false, error: '이미 보상을 수령했어요.' });
    return;
  }

  const mission = db.prepare('SELECT reward_amount FROM missions WHERE key = ?').get(key) as {
    reward_amount: number;
  };

  db.prepare(
    'UPDATE mission_progress SET claimed = 1, updated_at = datetime(\'now\') WHERE user_id = ? AND mission_key = ?'
  ).run(userId, key);

  res.json({ success: true, data: { rewardAmount: mission.reward_amount } });
});

export default router;
