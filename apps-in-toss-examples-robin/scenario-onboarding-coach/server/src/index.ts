import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import onboardingRoutes from './routes/onboarding.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

initDB(`
  CREATE TABLE IF NOT EXISTS onboarding (
    user_id TEXT PRIMARY KEY,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    coach_marks_seen INTEGER NOT NULL DEFAULT 0
  );
`);

app.use('/api/onboarding', onboardingRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Onboarding Coach] Server: http://localhost:${PORT}`);
});
