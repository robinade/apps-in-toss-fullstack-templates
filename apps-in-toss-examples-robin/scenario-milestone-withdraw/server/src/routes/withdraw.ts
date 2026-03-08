import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';

  const row = db.prepare('SELECT * FROM user_balance WHERE user_id = ?').get(userId) as {
    points: number; total_withdrawn: number;
  } | undefined;

  res.json({
    success: true,
    data: {
      balance: row?.points ?? 0,
      totalWithdrawn: row?.total_withdrawn ?? 0,
    },
  });
});

router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] as string || 'demo-user-1';
  const { amount } = req.body;

  if (!amount || amount < 10) {
    res.status(400).json({ success: false, error: '최소 10P부터 출금 가능해요.' });
    return;
  }

  const row = db.prepare('SELECT points FROM user_balance WHERE user_id = ?').get(userId) as {
    points: number;
  } | undefined;

  if (!row || row.points < amount) {
    res.status(400).json({ success: false, error: '잔고가 부족해요.' });
    return;
  }

  db.prepare(
    'UPDATE user_balance SET points = points - ?, total_withdrawn = total_withdrawn + ? WHERE user_id = ?'
  ).run(amount, amount, userId);

  db.prepare(
    'INSERT INTO withdrawals (user_id, amount) VALUES (?, ?)'
  ).run(userId, amount);

  res.json({ success: true });
});

export default router;
