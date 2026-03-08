import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import lotteryRoutes from './routes/lottery.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB(`
  CREATE TABLE IF NOT EXISTS lottery_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    prize_tier TEXT NOT NULL,
    prize_name TEXT NOT NULL,
    prize_amount INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_chances (
    user_id TEXT PRIMARY KEY,
    chances INTEGER NOT NULL DEFAULT 0,
    last_ad_watched TEXT
  );
`);

app.use('/api/lottery', lotteryRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Lottery Reward] Server: http://localhost:${PORT}`);
});
