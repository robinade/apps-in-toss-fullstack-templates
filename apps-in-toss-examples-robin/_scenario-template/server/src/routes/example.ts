import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/status', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const rows = db.prepare(
    'SELECT * FROM example WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(userId);

  res.json({ success: true, data: rows });
});

router.post('/action', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const { data } = req.body;

  const result = db.prepare(
    'INSERT INTO example (user_id, data) VALUES (?, ?)'
  ).run(userId, JSON.stringify(data));

  res.json({ success: true, data: { id: result.lastInsertRowid } });
});

export default router;
