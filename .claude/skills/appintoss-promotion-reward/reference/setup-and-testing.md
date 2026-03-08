# Setup and Testing Guide

Step-by-step guide for setting up mTLS, activating test promotion codes, and verifying the integration. Designed to be followed interactively with AskUserQuestion prompts.

## Contents
- [Interactive Information Gathering](#interactive-information-gathering)
- [mTLS Certificate Setup](#mtls-certificate-setup)
- [Getting User IDs from Supabase](#getting-user-ids-from-supabase)
- [Test Promotion Code Activation](#test-promotion-code-activation)
- [Base64 Encoding for Cloud Deployment](#base64-encoding-for-cloud-deployment)
- [Vercel Environment Variable Setup](#vercel-environment-variable-setup)
- [Promotion Code Management](#promotion-code-management)

---

## Interactive Information Gathering

Before running any test, use AskUserQuestion to collect required values from the user. Each piece of information is essential — explain why as you ask.

### Required Values Checklist

Gather these before proceeding to the test:

1. **mTLS certificate files** — Ask: "Where are your mTLS cert and key files? (file paths or Base64 env var names)"
2. **ALL test promotion codes** — Ask: "Please provide ALL your TEST_ prefixed test promotion codes. Each promotion code has a matching test code (e.g., code '01KH...' → test code 'TEST_01KH...'). You can find them in the AppsInToss Console by clicking the 'Test' button on each promotion."
3. **User's Supabase table name** — Ask: "What is the name of your users table in Supabase? We need to query a toss_user_key from it."
4. **tossUserKey** — Retrieved via Supabase MCP (see next section)

If any value is missing, guide the user to obtain it before continuing.

### Finding Certificate Files

If the user says they have cert files but isn't sure of the exact path, search the project directory:

```
Use Glob tool with patterns:
  **/*.pem
  **/*.crt
  **/*.key
```

Certificate files from Toss typically have the app name in the filename (e.g., `앱이름_public.crt`, `앱이름_private.key`). Node.js accepts `.pem`, `.crt`, and `.key` file extensions interchangeably for mTLS — no conversion is needed.

---

## mTLS Certificate Setup

The Toss API requires mutual TLS (client certificates). You need:
1. A certificate file (`.pem`, `.crt`, or similar)
2. A private key file (`.pem`, `.key`, or similar)

These are issued by Toss when your partner account is approved. Node.js handles all common certificate formats (`.pem`, `.crt`, `.key`) natively — no format conversion is required.

### Local Development

Store cert files locally and reference via environment variables:

```bash
# .env.local
TOSS_CERT_PATH=./certs/toss-cert.pem
TOSS_KEY_PATH=./certs/toss-key.pem
```

### Cloud Deployment (Vercel, etc.)

Base64-encode the certificates and store as environment variables:

```bash
# Mac/Linux — encode to base64 (single line, no wrapping)
base64 -w 0 < toss-cert.pem > cert_b64.txt
base64 -w 0 < toss-key.pem > key_b64.txt

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("toss-cert.pem")) > cert_b64.txt
[Convert]::ToBase64String([IO.File]::ReadAllBytes("toss-key.pem")) > key_b64.txt

# Verify by decoding
base64 -d < cert_b64.txt | head -1
# Should show: -----BEGIN CERTIFICATE-----
```

Store as env vars:
```
MTLS_CERT_BASE64=<output-from-cert-encoding>
MTLS_KEY_BASE64=<output-from-key-encoding>
```

---

## Getting User IDs from Supabase

A valid `toss_user_key` is required for API testing. Query it from Supabase.

### Using Supabase MCP (recommended)

Use the Supabase MCP `execute_sql` tool to query a test user:

```sql
SELECT toss_user_key FROM your_users_table WHERE toss_user_key IS NOT NULL LIMIT 1;
```

Replace `your_users_table` with the actual table name. Ask the user if you don't know it:

```
AskUserQuestion: "What is the name of your users table in Supabase that
stores toss_user_key? (e.g., users, healthy_habit_users, app_users)"
```

### If No Users Exist Yet

The user needs to:
1. Open the mini-app in the Toss app
2. Complete Toss Login flow
3. This creates a user record with `toss_user_key` in the database
4. Then re-query Supabase MCP

### Using Supabase Dashboard

1. Go to Table Editor in Supabase Dashboard
2. Open the users table
3. Find a row with a non-null `toss_user_key` value
4. Copy the value

---

## Test Promotion Code Activation

### Why This Step is Required
- At least **1 successful test API call** is required for promotion review approval
- Test codes use `TEST_` prefix (e.g., `TEST_01KHXFH8DYGH5R146ZATFDTNWJ`)
- No real points are deducted or issued during testing
- Must confirm `resultType: SUCCESS` at each step
- **Each test code must be activated separately** — activate ALL test codes

### What You Need
1. ALL your test promotion codes (from the console "Test" button on each promotion)
2. A valid `tossUserKey` (from Supabase query above)
3. mTLS certificates (file paths)

### Cross-Platform Warning

**Do NOT use `curl`** for this test. On Windows, the default `curl` uses the Schannel SSL backend, which does not support PEM/CRT certificate files. This causes `curl` to fail with **exit code 58** ("SSL client certificate problem"). Even Git Bash's `curl` on Windows has this limitation.

Use the **Node.js test script** below — it works identically on Windows, Mac, and Linux because Node.js has its own TLS implementation that handles PEM/CRT/KEY files natively.

### Node.js Test Script (PRIMARY — works on all platforms)

Write this script to a temporary file and run with `npx tsx`. This script tests ALL provided test codes through the full 3-step flow.

**Critical ESM compatibility notes:**
- `__dirname` is NOT available in ES modules (tsx runs as ESM). Use `import.meta.url` with `fileURLToPath` instead.
- Use `import` statements, not `require()` — `require` is not available in ES modules.

```typescript
// test-promotion.ts — Cross-platform test script
// Run: npx tsx test-promotion.ts

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// === FILL IN YOUR VALUES ===
const TOSS_API = 'https://apps-in-toss-api.toss.im';
const USER_KEY = 'your-toss-user-key-here';  // From Supabase MCP query
const TEST_CODES = [
  'TEST_your-first-code-here',
  // Add more test codes as needed:
  // 'TEST_your-second-code-here',
  // 'TEST_your-third-code-here',
];
const AMOUNT = 1;

// === LOAD mTLS CERTIFICATES ===
// ESM-compatible path resolution (do NOT use __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust these paths to match your cert file locations.
// Node.js accepts .pem, .crt, .key files interchangeably.
const certPath = path.resolve(__dirname, '../your-app_public.crt');
const keyPath = path.resolve(__dirname, '../your-app_private.key');

let cert: Buffer;
let key: Buffer;

// Support both file paths and Base64 env vars
if (process.env.MTLS_CERT_BASE64 && process.env.MTLS_KEY_BASE64) {
  cert = Buffer.from(process.env.MTLS_CERT_BASE64, 'base64');
  key = Buffer.from(process.env.MTLS_KEY_BASE64, 'base64');
  console.log('Using Base64 certs from env vars');
} else {
  cert = fs.readFileSync(certPath);
  key = fs.readFileSync(keyPath);
  console.log(`Using cert files:\n  Cert: ${certPath}\n  Key: ${keyPath}`);
}

const agent = new https.Agent({ cert, key });

// === API HELPER ===
async function tossApi(apiPath: string, body?: object): Promise<any> {
  const res = await fetch(`${TOSS_API}${apiPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-toss-user-key': USER_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
    // @ts-ignore — Node.js fetch accepts agent option
    agent,
  });
  return res.json();
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// === 3-STEP TEST FOR A SINGLE CODE ===
async function testCode(testCode: string): Promise<boolean> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${testCode}`);
  console.log('='.repeat(60));

  // Step 1: Get Key
  console.log('\n--- Step 1: Get Key ---');
  const keyRes = await tossApi(
    '/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key'
  );
  console.log(JSON.stringify(keyRes, null, 2));

  const promoKey = keyRes.success?.key;
  if (!promoKey) {
    console.error('FAILED: Could not get promotion key');
    console.error('Check: mTLS certs correct? User key valid?');
    return false;
  }

  // Step 2: Execute Promotion
  console.log('\n--- Step 2: Execute Promotion ---');
  const execRes = await tossApi(
    '/api-partner/v1/apps-in-toss/promotion/execute-promotion',
    { promotionCode: testCode, key: promoKey, amount: AMOUNT }
  );
  console.log(JSON.stringify(execRes, null, 2));

  if (execRes.resultType !== 'SUCCESS') {
    const errorCode = execRes.error?.code;
    console.error(`FAILED: Execute returned ${execRes.resultType} (error: ${errorCode})`);
    console.error('Common causes:');
    console.error('  4100 = Promotion code not found in console');
    console.error('  4109 = Promotion not started or budget exhausted');
    console.error('  4112 = Insufficient funds');
    return false;
  }

  // Step 3: Get Execution Result (polling)
  console.log('\n--- Step 3: Get Execution Result (polling up to 10 times) ---');
  for (let i = 0; i < 10; i++) {
    const resultRes = await tossApi(
      '/api-partner/v1/apps-in-toss/promotion/execution-result',
      { promotionCode: testCode, key: promoKey }
    );
    const status = resultRes.success;
    console.log(`Poll ${i + 1}: ${status}`);

    if (status === 'SUCCESS') {
      console.log(`\n>>> ${testCode}: PASSED <<<`);
      return true;
    }
    if (status === 'FAILED') {
      console.error(`\n>>> ${testCode}: FAILED <<<`);
      return false;
    }
    await sleep(500);
  }

  console.error(`\n>>> ${testCode}: TIMEOUT (still PENDING after 10 polls) <<<`);
  return false;
}

// === MAIN: TEST ALL CODES ===
async function main() {
  console.log('Toss Promotion API Test');
  console.log(`User Key: ${USER_KEY}`);
  console.log(`Test Codes: ${TEST_CODES.length}`);

  const results: { code: string; passed: boolean }[] = [];

  for (const code of TEST_CODES) {
    const passed = await testCode(code);
    results.push({ code, passed });
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  for (const r of results) {
    console.log(`  ${r.passed ? 'PASS' : 'FAIL'}: ${r.code}`);
  }

  const allPassed = results.every(r => r.passed);
  console.log(`\nOverall: ${allPassed ? 'ALL PASSED' : 'SOME FAILED'}`);

  if (!allPassed) {
    console.log('\nTroubleshooting:');
    console.log('1. Check cert files exist and are readable');
    console.log('2. Verify tossUserKey is valid (from Supabase)');
    console.log('3. Ensure TEST_ prefix is correct');
    console.log('4. Check console: is the promotion registered?');
    process.exit(1);
  }
}

main().catch(console.error);
```

### How to Run the Test Script

1. **Write the script** to a temporary file in the project's server directory (or anywhere with access to cert files):
   ```
   Write the script to: {project}/server/test-promotion.ts
   (or {project}/test-promotion.ts if no server directory)
   ```

2. **Fill in the values** — replace placeholders with actual values gathered during the interview:
   - `USER_KEY`: from Supabase MCP query
   - `TEST_CODES`: all TEST_ prefixed codes from the user
   - `certPath` / `keyPath`: actual paths to the cert files (found via Glob)

3. **Run with npx tsx** (no install needed):
   ```bash
   cd {project-directory}
   npx tsx server/test-promotion.ts
   ```

4. **Verify ALL codes show PASS** in the summary:
   ```
   TEST SUMMARY
     PASS: TEST_01KHTHASDW4AZRY7GAW0QDW8YE
     PASS: TEST_01KHTH89HEW8TMGBNX4NF3JK75
     PASS: TEST_01KHTH683MKVHQWHK2ZMXFWZVJ
   Overall: ALL PASSED
   ```

5. **Clean up**: Delete the test script after all codes are activated.

### Bash Test Script (Mac/Linux ONLY — fallback)

**Warning**: This script uses `curl` which requires a curl build with OpenSSL (not Schannel). This works on Mac and most Linux distributions, but **will NOT work on Windows** (even in Git Bash) because Windows curl uses Schannel which does not support PEM certificate files. Use the Node.js script above on Windows.

```bash
#!/bin/bash

# ============================================
# Toss Promotion API Test Script
# Mac/Linux ONLY — curl with OpenSSL required
# Run: chmod +x test-promotion.sh && ./test-promotion.sh
# ============================================

TOSS_API="https://apps-in-toss-api.toss.im"
USER_KEY="your-toss-user-key-here"           # From Supabase MCP query
PROMO_CODE="TEST_your-promotion-code-here"   # TEST_ prefix for testing
CERT_PATH="./certs/toss-cert.pem"            # Path to cert file
KEY_PATH="./certs/toss-key.pem"              # Path to key file
AMOUNT=1

# Check curl SSL backend (Schannel = will fail)
CURL_SSL=$(curl --version | head -1 | grep -o 'Schannel\|OpenSSL\|LibreSSL\|GnuTLS')
if [ "$CURL_SSL" = "Schannel" ]; then
  echo "ERROR: Your curl uses Schannel which does not support PEM certs."
  echo "Use the Node.js test script instead (npx tsx test-promotion.ts)."
  exit 1
fi

echo "=== Step 1: Get Key ==="
KEY_RESPONSE=$(curl -s -X POST \
  "$TOSS_API/api-partner/v1/apps-in-toss/promotion/execute-promotion/get-key" \
  --cert "$CERT_PATH" --key "$KEY_PATH" \
  -H "Content-Type: application/json" \
  -H "x-toss-user-key: $USER_KEY")

echo "$KEY_RESPONSE" | jq .

PROMO_KEY=$(echo "$KEY_RESPONSE" | jq -r '.success.key')

if [ "$PROMO_KEY" = "null" ] || [ -z "$PROMO_KEY" ]; then
  echo "ERROR: Failed to get promotion key"
  echo "Check: mTLS certs correct? User key valid?"
  echo "Response: $KEY_RESPONSE"
  exit 1
fi

echo ""
echo "=== Step 2: Execute Promotion ==="
EXEC_RESPONSE=$(curl -s -X POST \
  "$TOSS_API/api-partner/v1/apps-in-toss/promotion/execute-promotion" \
  --cert "$CERT_PATH" --key "$KEY_PATH" \
  -H "Content-Type: application/json" \
  -H "x-toss-user-key: $USER_KEY" \
  -d "{\"promotionCode\": \"$PROMO_CODE\", \"key\": \"$PROMO_KEY\", \"amount\": $AMOUNT}")

echo "$EXEC_RESPONSE" | jq .

RESULT_TYPE=$(echo "$EXEC_RESPONSE" | jq -r '.resultType')
if [ "$RESULT_TYPE" != "SUCCESS" ]; then
  ERROR_CODE=$(echo "$EXEC_RESPONSE" | jq -r '.error.code // empty')
  echo "ERROR: Execute promotion failed (code: $ERROR_CODE)"
  echo "Common causes:"
  echo "  4100 = Promotion code not found in console"
  echo "  4109 = Promotion not started or budget exhausted"
  echo "  4112 = Insufficient funds"
  exit 1
fi

echo ""
echo "=== Step 3: Get Result (polling up to 10 times) ==="
for i in $(seq 1 10); do
  RESULT_RESPONSE=$(curl -s -X POST \
    "$TOSS_API/api-partner/v1/apps-in-toss/promotion/execution-result" \
    --cert "$CERT_PATH" --key "$KEY_PATH" \
    -H "Content-Type: application/json" \
    -H "x-toss-user-key: $USER_KEY" \
    -d "{\"promotionCode\": \"$PROMO_CODE\", \"key\": \"$PROMO_KEY\"}")

  STATUS=$(echo "$RESULT_RESPONSE" | jq -r '.success')
  echo "Poll $i: $STATUS"

  if [ "$STATUS" = "SUCCESS" ]; then
    echo ""
    echo "=== TEST PASSED ==="
    echo "Promotion code activated successfully!"
    exit 0
  elif [ "$STATUS" = "FAILED" ]; then
    echo ""
    echo "=== TEST FAILED ==="
    echo "Promotion execution failed. Check console for details."
    exit 1
  fi

  sleep 0.5
done

echo ""
echo "=== TIMEOUT: Still PENDING after 10 polls ==="
echo "This sometimes happens — try running the script again."
```

---

## Base64 Encoding for Cloud Deployment

```bash
# Mac/Linux
base64 -w 0 < toss-cert.pem > cert_b64.txt
base64 -w 0 < toss-key.pem > key_b64.txt

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("toss-cert.pem")) > cert_b64.txt
[Convert]::ToBase64String([IO.File]::ReadAllBytes("toss-key.pem")) > key_b64.txt

# Verify
base64 -d < cert_b64.txt | head -1
# Should show: -----BEGIN CERTIFICATE-----
```

---

## Vercel Environment Variable Setup

### Setting Variables via CLI

```bash
# Promotion codes (comma-separated for round-robin)
echo "CODE1,CODE2,CODE3" | vercel env add TOSS_PROMOTION_CODES production

# mTLS certificates
cat cert_b64.txt | vercel env add MTLS_CERT_BASE64 production
cat key_b64.txt | vercel env add MTLS_KEY_BASE64 production

# API URL
echo "https://apps-in-toss-api.toss.im" | vercel env add TOSS_API_BASE_URL production

# Security secrets (generate random)
echo "$(openssl rand -hex 32)" | vercel env add AD_TOKEN_SECRET production
echo "$(openssl rand -hex 32)" | vercel env add JWT_SECRET production
```

### Setting Variables via Dashboard

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add each variable with appropriate scope (Production/Preview/Development)
3. For `TOSS_PROMOTION_CODES`, enter all codes comma-separated:
   ```
   01JPPJ6SB66BQXXDAKRQZ6SZD7,01KAXYZ123ABC,01KDEF456GHI
   ```

---

## Promotion Code Management

### Adding New Codes
1. Register new promotion in AppsInToss Console
2. Wait for review approval (~2-3 business days)
3. Test with `TEST_` prefix code first (run test script above)
4. After `SUCCESS`, add the real code to `TOSS_PROMOTION_CODES` env var
5. Redeploy to pick up the new env var value

### When a Code's Budget is Exhausted
- The round-robin system automatically skips exhausted codes (error 4109/4112)
- Remove exhausted codes from the env var to keep it clean
- Top up Biz Wallet and register new promotions as needed
- Budget alert email is sent at 80% consumption — act proactively

### Round-Robin Behavior
- Codes are selected in order: CODE1 → CODE2 → CODE3 → CODE1 → ...
- If selected code fails with 4109/4112, the next code is tried automatically
- If ALL codes are exhausted, user sees "temporarily unavailable" message
