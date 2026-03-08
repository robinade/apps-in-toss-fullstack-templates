import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import shareRoutes from './routes/share.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB(`
  CREATE TABLE IF NOT EXISTS shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    success INTEGER NOT NULL DEFAULT 0,
    reward_amount INTEGER NOT NULL DEFAULT 0,
    reward_unit TEXT DEFAULT '기회',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

app.use('/api/share', shareRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Share Viral] Server: http://localhost:${PORT}`);
});
