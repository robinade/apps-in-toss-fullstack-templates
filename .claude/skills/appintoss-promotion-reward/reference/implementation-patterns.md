# Production Implementation Patterns

Proven patterns from a production AppsInToss non-game mini-app handling rewarded ads with Toss Points. Based on actual project code.

## Contents
- [Server: mTLS Client (TLSClient class)](#server-mtls-client)
- [Server: Promotion Service](#server-promotion-service)
- [Server: API Routes](#server-api-routes)
- [Server: Database Schema](#server-database-schema)
- [Client: Ad Load Manager (IntegratedAd v2)](#client-ad-load-manager)
- [Client: Rewarded Ad Hook](#client-rewarded-ad-hook)
- [Client: API Client](#client-api-client)
- [Client: State Management](#client-state-management)

---

## Server: mTLS Client

The Toss API requires mutual TLS. The production implementation uses a class-based client with connection pooling.

```typescript
// tlsClient.ts
import https from 'https';

class TLSClient {
  private agent: https.Agent;

  constructor() {
    let cert: string | Buffer;
    let key: string | Buffer;

    if (process.env.MTLS_CERT_BASE64 && process.env.MTLS_KEY_BASE64) {
      // Cloud: decode from Base64 environment variables
      cert = Buffer.from(process.env.MTLS_CERT_BASE64, 'base64');
      key = Buffer.from(process.env.MTLS_KEY_BASE64, 'base64');
    } else {
      // Local dev: read from file paths
      const fs = require('fs');
      cert = fs.readFileSync(process.env.TOSS_CERT_PATH!);
      key = fs.readFileSync(process.env.TOSS_KEY_PATH!);
    }

    this.agent = new https.Agent({
      cert,
      key,
      rejectUnauthorized: true,
      keepAlive: true,
      maxSockets: 10,
      maxFreeSockets: 5,
      freeSocketTimeout: 25000,
    });
  }

  async request<T>(url: string, options: RequestInit): Promise<T> {
    const res = await fetch(url, {
      ...options,
      // @ts-ignore — agent for mTLS
      agent: this.agent,
    });
    return res.json() as T;
  }

  async requestWithRetry<T>(
    url: string,
    options: RequestInit,
    maxRetries = 2
  ): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.request<T>(url, options);
        // Retry on error 4110 (transient)
        const anyResult = result as any;
        if (anyResult.resultType === 'FAIL' && anyResult.error?.code === 4110) {
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, Math.min(500 * (attempt + 1), 1000)));
            continue;
          }
        }
        return result;
      } catch (error: any) {
        if (attempt === maxRetries) throw error;
        if (error.code === 'ECONNRESET' || error.message?.includes('socket hang up')) {
          await new Promise(r => setTimeout(r, Math.min(500 * (attempt + 1), 1000)));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Max retries exceeded');
  }
}

// Singleton
let tlsClientInstance: TLSClient | null = null;

export function getTLSClient(): TLSClient {
  if (!tlsClientInstance) {
    tlsClientInstance = new TLSClient();
  }
  return tlsClientInstance;
}
```

---

## Server: Promotion Service

Core service implementing the 3-step API with round-robin, failover, and ad token security.

### Round-Robin Promotion Code Selection

```typescript
const PROMOTION_CODES = (process.env.TOSS_PROMOTION_CODES || '')
  .split(',')
  .map(c => c.trim())
  .filter(Boolean);

let roundRobinIndex = 0;

function selectPromotionCode(): string {
  if (PROMOTION_CODES.length === 0) return '';
  if (PROMOTION_CODES.length === 1) return PROMOTION_CODES[0];
  const code = PROMOTION_CODES[roundRobinIndex];
  roundRobinIndex = (roundRobinIndex + 1) % PROMOTION_CODES.length;
  return code;
}
```

### 3-Step API Flow

```typescript
const TOSS_API = process.env.TOSS_API_BASE_URL || 'https://apps-in-toss-api.toss.im';

async function getPromotionKey(userKey: string): Promise<string> {
  const client = getTLSClient();
  const data = await client.requestWithRetry<any>(
    `${TOSS_API}/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-toss-user-key': userKey,
      },
    }
  );
  if (data.resultType !== 'SUCCESS') {
    throw new Error(`getKey failed: ${JSON.stringify(data)}`);
  }
  return data.success.key;
}

async function executePromotion(params: {
  promotionCode: string;
  key: string;
  amount: number;
  userKey: string;
}): Promise<void> {
  const client = getTLSClient();
  const data = await client.requestWithRetry<any>(
    `${TOSS_API}/api-partner/v1/apps-in-toss/promotion/execute-promotion`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-toss-user-key': params.userKey,
      },
      body: JSON.stringify({
        promotionCode: params.promotionCode,
        key: params.key,
        amount: params.amount,
      }),
    }
  );
  if (data.resultType !== 'SUCCESS') {
    throw new Error(`executePromotion failed: ${JSON.stringify(data)}`);
  }
}

async function getExecutionResult(params: {
  promotionCode: string;
  key: string;
  userKey: string;
}): Promise<'SUCCESS' | 'PENDING' | 'FAILED'> {
  const client = getTLSClient();
  const maxPolls = 10;
  const pollInterval = 500;

  for (let i = 0; i < maxPolls; i++) {
    const data = await client.request<any>(
      `${TOSS_API}/api-partner/v1/apps-in-toss/promotion/execution-result`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-toss-user-key': params.userKey,
        },
        body: JSON.stringify({
          promotionCode: params.promotionCode,
          key: params.key,
        }),
      }
    );
    if (data.resultType === 'SUCCESS' && data.success !== 'PENDING') {
      return data.success;
    }
    await new Promise(r => setTimeout(r, pollInterval));
  }
  return 'PENDING';
}
```

### Withdraw with Failover

```typescript
async function withdrawPoints(userKey: string, amount: number): Promise<{
  success: boolean;
  promotionCode?: string;
  error?: string;
}> {
  const selectedCode = selectPromotionCode();
  const codesToTry = [selectedCode, ...PROMOTION_CODES.filter(c => c !== selectedCode)];

  for (const code of codesToTry) {
    for (let retry = 0; retry < 2; retry++) {
      try {
        const key = await getPromotionKey(userKey);
        await executePromotion({ promotionCode: code, key, amount, userKey });
        const result = await getExecutionResult({ promotionCode: code, key, userKey });

        if (result === 'SUCCESS') return { success: true, promotionCode: code };
        if (result === 'FAILED') break; // Try next code
      } catch (error: any) {
        const errorCode = extractErrorCode(error);
        if (errorCode === 4109 || errorCode === 4112) break; // Budget exhausted
        if (errorCode === 4110 && retry < 1) continue;       // Retry transient
        if (errorCode === 4113) continue;                     // Key used, get new
        break;
      }
    }
  }
  return { success: false, error: 'All promotion codes failed' };
}

function extractErrorCode(error: any): number | null {
  const match = error.message?.match(/"code"\s*:\s*(\d+)/);
  return match ? parseInt(match[1]) : null;
}
```

### Ad Token Security

The ad token uses HMAC signature to prove the user watched an ad. Format: `{timestamp}.{userKeyHash}.{signature}`

```typescript
import crypto from 'crypto';

const AD_TOKEN_SECRET = process.env.AD_TOKEN_SECRET || 'your-secret-here';
const AD_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

function simpleHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function generateAdToken(userKey: string): string {
  const timestamp = Date.now();
  const userKeyHash = simpleHash(userKey);
  const signature = simpleHash(`${userKey}${timestamp}${AD_TOKEN_SECRET}`);
  return `${timestamp}.${userKeyHash}.${signature}`;
}

function verifyAdToken(userKey: string, adToken: string): boolean {
  const parts = adToken.split('.');
  if (parts.length !== 3) return false;

  const [timestampStr, userKeyHash, signature] = parts;
  const timestamp = parseInt(timestampStr);

  // Check expiry
  if (Date.now() - timestamp > AD_TOKEN_TTL_MS) return false;

  // Verify userKey matches
  if (simpleHash(userKey) !== userKeyHash) return false;

  // Verify signature
  const expectedSig = simpleHash(`${userKey}${timestamp}${AD_TOKEN_SECRET}`);
  return signature === expectedSig;
}

// Prevent token reuse via DB
async function consumeAdToken(adToken: string, userId: string): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(adToken).digest('hex');
  const { error } = await supabase
    .from('healthy_habit_used_ad_tokens')
    .insert({ token_hash: tokenHash, user_id: userId });
  // Unique constraint violation = already consumed
  return !error || error.code !== '23505';
}
```

### Idempotency Cache

```typescript
const idempotencyCache = new Map<string, { result: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function checkIdempotency(key: string): any | null {
  const entry = idempotencyCache.get(key);
  if (entry && Date.now() < entry.expiry) return entry.result;
  idempotencyCache.delete(key);
  return null;
}

function setIdempotency(key: string, result: any): void {
  idempotencyCache.set(key, { result, expiry: Date.now() + CACHE_TTL });
}
```

---

## Server: API Routes

```typescript
// routes/promotion.ts
import { Router } from 'express';

const router = Router();
// All routes require JWT auth (applied at mount point)

router.post('/ad-token', async (req, res) => {
  const { tossUserKey } = req.user;
  const token = generateAdToken(tossUserKey);
  res.json({ success: true, token });
});

router.post('/grant', async (req, res) => {
  const { amount, idempotencyKey, adToken } = req.body;
  const { tossUserKey } = req.user;

  // Verify ad token
  if (!verifyAdToken(tossUserKey, adToken)) {
    return res.status(403).json({ error: 'Invalid ad token' });
  }

  // Consume ad token (prevent reuse)
  const consumed = await consumeAdToken(adToken, req.user.userId);
  if (!consumed) {
    return res.status(403).json({ error: 'Ad token already used' });
  }

  // Check idempotency
  const cacheKey = `${tossUserKey}:${amount}:${idempotencyKey}`;
  const cached = checkIdempotency(cacheKey);
  if (cached) return res.json(cached);

  // Validate amount (ad-watch: 1-5)
  if (amount < 1 || amount > 5) {
    return res.status(400).json({ error: 'Amount must be 1-5' });
  }

  const result = await withdrawPoints(tossUserKey, amount);
  setIdempotency(cacheKey, result);
  res.json(result);
});

// Earn internal points (various event types)
router.post('/earn', async (req, res) => {
  const { amount, eventType, idempotencyKey } = req.body;
  const { tossUserKey } = req.user;

  // Validate amount by event type
  const allowedAmounts: Record<string, [number, number]> = {
    'habit-check': [1, 10],
    'ad-watch': [1, 5],
    'streak-bonus': [1, 50],
    'milestone-reward': [10, 1000],
  };

  const [min, max] = allowedAmounts[eventType] || [0, 0];
  if (amount < min || amount > max) {
    return res.status(400).json({ error: `Amount must be ${min}-${max} for ${eventType}` });
  }

  await addPoints(tossUserKey, amount, eventType);
  res.json({ success: true, amount });
});

router.post('/lottery-grant', async (req, res) => {
  const { idempotencyKey, adToken } = req.body;
  const { tossUserKey } = req.user;

  // Verify ad token
  if (!verifyAdToken(tossUserKey, adToken)) {
    return res.status(403).json({ error: 'Invalid ad token' });
  }

  // Server-side lottery draw
  const prize = drawLottery();
  const result = await withdrawPoints(tossUserKey, prize.amount);
  res.json({ ...result, prize });
});
```

### Lottery Prize Table

```typescript
const LOTTERY_PRIZES = [
  { rank: 1, amount: 3000, probability: 0.0001 },
  { rank: 2, amount: 1000, probability: 0.001 },
  { rank: 3, amount: 500,  probability: 0.005 },
  { rank: 4, amount: 100,  probability: 0.01 },
  { rank: 5, amount: 50,   probability: 0.05 },
  { rank: 6, amount: 10,   probability: 0.1 },
  { rank: 7, amount: 3,    probability: 0.3 },
  { rank: 8, amount: 1,    probability: 0.5339 }, // participation prize
];

function drawLottery(): { rank: number; amount: number } {
  const rand = Math.random();
  let cumulative = 0;
  for (const prize of LOTTERY_PRIZES) {
    cumulative += prize.probability;
    if (rand <= cumulative) return prize;
  }
  return LOTTERY_PRIZES[LOTTERY_PRIZES.length - 1];
}
```

---

## Server: Database Schema

Required tables for tracking (Supabase/PostgreSQL):

```sql
-- User records
CREATE TABLE healthy_habit_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  toss_user_key TEXT UNIQUE NOT NULL,
  nickname TEXT,
  profile_image_url TEXT,
  token_revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Point balance per user
CREATE TABLE healthy_habit_point_balance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES healthy_habit_users(id),
  points INTEGER DEFAULT 0,
  withdrawing BOOLEAN DEFAULT FALSE,
  withdraw_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Daily reward tracking (enforce daily limits)
CREATE TABLE healthy_habit_daily_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES healthy_habit_users(id),
  reward_date DATE DEFAULT CURRENT_DATE,
  points_earned INTEGER DEFAULT 0,
  ad_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reward_date)
);

-- Withdrawal audit log
CREATE TABLE healthy_habit_withdraw_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES healthy_habit_users(id),
  points INTEGER NOT NULL,
  status TEXT NOT NULL, -- 'PENDING', 'COMPLETED', 'FAILED'
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent ad token replay
CREATE TABLE healthy_habit_used_ad_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES healthy_habit_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Performance indexes
CREATE INDEX idx_users_toss_key ON healthy_habit_users(toss_user_key);
CREATE INDEX idx_balance_withdrawing ON healthy_habit_point_balance(user_id)
  WHERE withdrawing = TRUE;
CREATE INDEX idx_withdraw_history_user ON healthy_habit_withdraw_history(user_id);
```

---

## Client: Ad Load Manager

SDK constraint: only one ad can load at a time. Uses IntegratedAd v2 API from `@apps-in-toss/web-framework`.

```typescript
// adManager.ts — Singleton managing ad load serialization
type AdSlot = 'lottery' | 'reward';
const PRIORITIES: Record<AdSlot, number> = {
  lottery: 0,   // highest priority
  reward: 10,   // lower priority
};

class AdLoadManager {
  private static instance: AdLoadManager;
  private queue: Array<{ slot: AdSlot; resolve: Function; reject: Function }> = [];
  private activeSlot: AdSlot | null = null;
  private sdk: any = null;

  static getInstance() {
    if (!this.instance) this.instance = new AdLoadManager();
    return this.instance;
  }

  async ensureSDK() {
    if (!this.sdk) {
      this.sdk = await import('@apps-in-toss/web-framework');
    }
    return this.sdk;
  }

  async requestLoad(slot: AdSlot, loadFn: () => Promise<void>): Promise<void> {
    if (this.activeSlot) {
      return new Promise((resolve, reject) => {
        this.queue.push({ slot, resolve, reject });
        this.queue.sort((a, b) => PRIORITIES[a.slot] - PRIORITIES[b.slot]);
      });
    }
    this.activeSlot = slot;
    try {
      await loadFn();
    } finally {
      this.activeSlot = null;
      this.processQueue();
    }
  }

  notifyDismissed(slot: AdSlot) {
    if (this.activeSlot === slot) {
      this.activeSlot = null;
      this.processQueue();
    }
  }

  private processQueue() {
    const next = this.queue.shift();
    if (next) {
      this.requestLoad(next.slot, () => Promise.resolve())
        .then(next.resolve)
        .catch(next.reject);
    }
  }
}
```

---

## Client: Rewarded Ad Hook

```typescript
// useRewardedAd.ts
import { useCallback, useRef, useState, useEffect } from 'react';

const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || 'ait-ad-test-rewarded-id';
const MAX_DAILY_ADS = 3;
const REWARD_AMOUNT = 3; // Toss Points per ad watch

export function useRewardedAd(onRewarded: (amount: number) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const adRef = useRef<any>(null);
  const manager = AdLoadManager.getInstance();

  const loadAd = useCallback(async () => {
    setIsLoading(true);
    try {
      const sdk = await manager.ensureSDK();

      await manager.requestLoad('reward', async () => {
        const ad = sdk.createIntegratedAd({ adGroupId: AD_GROUP_ID });

        ad.addEventListener('loaded', () => { setIsReady(true); setIsLoading(false); });
        ad.addEventListener('failedToLoad', () => { setIsLoading(false); });
        ad.addEventListener('userEarnedReward', async () => {
          // Get ad token then grant reward via Toss API
          const tokenRes = await promotionApi.requestAdToken();
          const grantRes = await promotionApi.grantReward({
            amount: REWARD_AMOUNT,
            adToken: tokenRes.token,
            idempotencyKey: crypto.randomUUID(),
          });
          if (grantRes.success) onRewarded(REWARD_AMOUNT);
        });
        ad.addEventListener('dismissed', () => {
          setIsReady(false);
          manager.notifyDismissed('reward');
          loadAd(); // Pre-load next ad
        });

        adRef.current = ad;
        await ad.load();
      });
    } catch (e) {
      setIsLoading(false);
    }
  }, [onRewarded]);

  const showAd = useCallback(() => {
    adRef.current?.show();
  }, []);

  // Pre-load on mount
  useEffect(() => { loadAd(); }, []);

  return { loadAd, showAd, isLoading, isReady };
}
```

---

## Client: API Client

```typescript
// lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export const promotionApi = {
  requestAdToken: () =>
    apiFetch(`${API_URL}/api/promotion/ad-token`, { method: 'POST' }),

  grantReward: (params: { amount: number; idempotencyKey: string; adToken: string }) =>
    apiFetch(`${API_URL}/api/promotion/grant`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  lotteryGrant: (params: { idempotencyKey: string; adToken: string }) =>
    apiFetch(`${API_URL}/api/promotion/lottery-grant`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  earnPoints: (params: { amount: number; eventType: string; idempotencyKey: string }) =>
    apiFetch(`${API_URL}/api/promotion/earn`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getBalance: () =>
    apiFetch(`${API_URL}/api/promotion/balance`),

  withdrawPoints: (params: { amount: number; idempotencyKey: string }) =>
    apiFetch(`${API_URL}/api/promotion/withdraw`, {
      method: 'POST',
      body: JSON.stringify(params),
    }),
};

// apiFetch attaches JWT token and handles 401/token-revoked
async function apiFetch(url: string, options: RequestInit = {}) {
  const token = getStoredJWT();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401) {
    // Handle token refresh or redirect to login
  }
  return res.json();
}
```

---

## Client: State Management

Track rewards in Zustand store (or equivalent):

```typescript
interface RewardState {
  totalTossPointsReceived: number;
  totalHabitRewards: number;
  rewardedSlotsToday: { date: string; slots: string[] };

  recordTossPointsReceived: (amount: number) => void;
  recordHabitReward: (amount: number) => void;
}
```

Key patterns:
- Persist to localStorage for offline resilience
- Auto-reset daily counters on date change
- Track cumulative totals for display (banner showing "total earned")
