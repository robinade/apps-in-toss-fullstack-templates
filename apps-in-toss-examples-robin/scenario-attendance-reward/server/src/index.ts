import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import attendanceRoutes from './routes/attendance.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB(`
  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    check_date TEXT NOT NULL,
    reward_amount INTEGER NOT NULL DEFAULT 1,
    streak_bonus INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, check_date)
  );
`);

app.use('/api/attendance', attendanceRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Attendance Reward] Server: http://localhost:${PORT}`);
});
