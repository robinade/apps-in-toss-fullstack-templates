import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock push notification endpoint
app.post('/api/push/test', (req, res) => {
  const { title, body, targetUserId } = req.body;

  if (!title || !body) {
    return res.status(400).json({ success: false, error: 'title and body are required' });
  }

  // In production: Call AppsInToss Push API
  // POST https://api-gateway.apps-in-toss.com/push/v1/messages
  // with mTLS authentication
  console.log(`[Push] Sending to ${targetUserId}: ${title} - ${body}`);

  res.json({
    success: true,
    messageId: 'msg-' + Date.now(),
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Push server running on http://localhost:${PORT}`);
});
