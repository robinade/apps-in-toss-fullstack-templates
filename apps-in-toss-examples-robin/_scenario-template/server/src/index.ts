import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import exampleRoutes from './routes/example.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// DB 초기화
initDB(`
  CREATE TABLE IF NOT EXISTS example (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    data TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// 라우트
app.use('/api/example', exampleRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
