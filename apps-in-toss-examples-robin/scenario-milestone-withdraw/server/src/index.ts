import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import milestoneRoutes from './routes/milestones.js';
import withdrawRoutes from './routes/withdraw.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB(`
  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    required_days INTEGER NOT NULL,
    reward_amount INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS milestone_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    milestone_key TEXT NOT NULL,
    reward_amount INTEGER NOT NULL,
    claimed_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, milestone_key)
  );

  CREATE TABLE IF NOT EXISTS user_balance (
    user_id TEXT PRIMARY KEY,
    points INTEGER NOT NULL DEFAULT 0,
    total_withdrawn INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

app.use('/api/milestones', milestoneRoutes);
app.use('/api/balance', withdrawRoutes);
app.use('/api/withdraw', withdrawRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Milestone Withdraw] Server: http://localhost:${PORT}`);
});
