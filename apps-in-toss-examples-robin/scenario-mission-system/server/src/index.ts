import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import missionRoutes from './routes/missions.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB(`
  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'daily',
    target_count INTEGER NOT NULL DEFAULT 1,
    reward_amount INTEGER NOT NULL DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS mission_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    mission_key TEXT NOT NULL,
    current_count INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    claimed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, mission_key)
  );
`);

app.use('/api/missions', missionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Mission System] Server: http://localhost:${PORT}`);
});
