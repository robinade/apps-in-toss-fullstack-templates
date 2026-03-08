import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/status', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const row = db.prepare(
    'SELECT * FROM onboarding WHERE user_id = ?'
  ).get(userId) as { completed: number; coach_marks_seen: number } | undefined;

  res.json({
    success: true,
    data: {
      completed: row?.completed === 1,
      coachMarksSeen: row?.coach_marks_seen === 1,
    },
  });
});

router.post('/complete', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  db.prepare(
    `INSERT INTO onboarding (user_id, completed, completed_at)
     VALUES (?, 1, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET completed = 1, completed_at = datetime('now')`
  ).run(userId);

  res.json({ success: true });
});

router.post('/coach-marks-seen', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  db.prepare(
    `INSERT INTO onboarding (user_id, coach_marks_seen)
     VALUES (?, 1)
     ON CONFLICT(user_id) DO UPDATE SET coach_marks_seen = 1`
  ).run(userId);

  res.json({ success: true });
});

export default router;
