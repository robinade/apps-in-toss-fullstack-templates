import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock token exchange endpoint
app.post('/api/auth/token', (req, res) => {
  const { authorizationCode } = req.body;

  if (!authorizationCode) {
    return res.status(400).json({ error: 'authorizationCode is required' });
  }

  // In production: Exchange authCode with Toss server using mTLS
  // See: https://developers-apps-in-toss.toss.im/docs/auth
  const mockToken = 'jwt-' + Date.now();
  const mockUser = {
    id: 'user-' + authorizationCode.slice(-6),
    name: '토스 유저',
  };

  res.json({ token: mockToken, user: mockUser });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});
