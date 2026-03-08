---
name: appintoss-login
description: >
  AppsInToss (Toss mini-app) 로그인 기능 구현 A-Z 가이드. 토스 OAuth2 로그인, mTLS 인증서,
  AES-256-GCM 복호화, JWT 인증, Supabase 사용자 관리, Vercel 서버 배포, 온보딩 페이지 UI,
  인증 라우팅(ProtectedRoute), 연동 해제 시 자동 리다이렉트를 포함한 전체 로그인 시스템 구현.
  Use when: (1) 새 앱인토스 프로젝트에 토스 로그인 기능 추가, (2) appLogin SDK 통합,
  (3) 토스 OAuth2 토큰 교환/사용자 정보 조회 구현, (4) mTLS 클라이언트 구현,
  (5) 토스 연동 해제 콜백 처리, (6) 온보딩/로그인 페이지 UI 구현,
  (7) 인증 가드 및 미로그인 리다이렉트, (8) 토스 로그인 관련 디버깅.
  Triggers: "토스 로그인", "toss login", "appLogin", "앱인토스 로그인", "toss OAuth",
  "mTLS", "토스 인증", "로그인 구현", "toss unlink callback", "연동 해제 콜백",
  "온보딩 페이지", "onboarding page", "로그인 페이지", "login page", "인증 가드".
---

# AppsInToss 로그인 구현 가이드

토스 앱 내 미니앱에서 토스 로그인(OAuth2)을 구현하는 전체 워크플로우.
프로덕션 검증된 dujjonku 프로젝트 구현을 레퍼런스로 활용.

**아키텍처**:
```
[토스 앱] → appLogin() → [클라이언트] → authCode+referrer → [서버(Vercel)]
  → mTLS로 토스 API 호출 → 토큰 교환 → 사용자 정보 조회+AES-256-GCM 복호화
  → Supabase upsert → JWT 발급 → 클라이언트 응답
```

**전체 진행 순서** (반드시 이 순서대로. 건너뛰면 이후 단계 실패):
```
Phase 0: 이용약관 문서 생성 + 노션 등록 안내
Phase 1: 토스 콘솔 설정 (약관 등록 → 로그인 활성화 → 복호화키 발급 → mTLS 발급)
Phase 2: 서버 인프라 구축 (선행 설정 → Supabase → .env → Vercel → 환경변수)
Phase 3: 서버 구현
Phase 4: 클라이언트 구현
Phase 5: QA
```

---

## Phase 0: 이용약관 문서 생성 (가장 먼저)

**토스 콘솔에서 로그인 기능을 활성화하려면 이용약관 URL이 필수.**
약관이 없으면 mTLS 인증서도, 복호화 키도 발급받을 수 없다.

### 0.1 프로젝트 기본 정보 수집

AskUserQuestion으로 질문:
```
1. 프로젝트 이름? (서비스명, 영문)
2. 회사명? (이용약관에 표기할 법인명/상호)
3. 서비스 설명? (한 줄 — 예: "출석체크로 포인트를 적립하는 서비스")
4. 개발 프레임워크? (React Native: @apps-in-toss/framework / WebView: @apps-in-toss/web-framework)
5. 프레임워크 버전 1.0 이상? (Granite=1.0+, Bedrock=<1.0)
```

### 0.2 이용약관 문서 작성

1. 코드베이스를 분석하여 서비스 기능, 수집 데이터 항목 파악
2. `assets/terms-template.md` 템플릿 기반으로 프로젝트에 맞게 작성:
   - `[서비스명]`, `[회사명]`, `[날짜]`, `[서비스 설명]` 등 플레이스홀더 교체
   - 서비스 기능 목록을 코드베이스에서 추출하여 제5조에 반영
   - 수집 개인정보 항목을 실제 사용하는 scope에 맞게 수정
3. **하나의 문서에 이용약관 + 개인정보 수집/이용 동의를 함께 작성**
4. 작성된 문서를 프로젝트 루트 또는 docs/ 에 저장 (예: `docs/terms-of-service.md`)

**등록 가능한 약관 유형** (상세: `references/toss-login-api.md` §9):
| 유형 | 필수/선택 | 비고 |
|------|----------|------|
| 서비스 이용약관 | **필수** | 권리/의무, 책임, 중단/종료, 분쟁 |
| 개인정보 수집/이용 동의 | **필수** | 수집 항목, 목적, 보유 기간, 거부 시 불이익 |
| 마케팅 정보 수신 동의 | 선택 | 전자적 전송매체 광고 수신 |
| 야간 혜택 수신 동의 | 선택 | 21:00~08:00 발송 명시 |

### 0.3 노션 등록 및 URL 생성 안내

사용자에게 다음을 안내:
```
1. 작성된 이용약관 문서를 노션(Notion)에 새 페이지로 생성
2. 문서 내용을 복사하여 노션 페이지에 붙여넣기
3. 노션 페이지 우측 상단 "공유" → "웹에서 공유" 활성화
4. 생성된 공개 URL 복사 (https://www.notion.so/... 형태)
5. 이 URL을 다음 Phase에서 토스 콘솔 약관 등록란에 입력
```

AskUserQuestion: "노션에 이용약관을 등록하고 외부 공유 URL을 만드셨나요? URL을 알려주세요."

---

## Phase 1: 토스 콘솔 설정

**Phase 0에서 약관 URL을 확보한 후 진행. URL 없으면 이 단계 불가.**

### 1.1 약관 등록 + 로그인 활성화

사용자에게 안내:
```
1. 토스 개발자 콘솔 접속 (https://developers-apps-in-toss.toss.im)
2. **대표관리자** 계정으로 로그인 (대표관리자만 약관 동의/로그인 활성화 가능)
3. 워크스페이스 > 미니앱 > 토스 로그인 메뉴 진입
4. "약관 확인하기" 클릭
5. Phase 0에서 만든 노션 URL을 약관 URL란에 입력
6. Scope(수집할 사용자 정보) 선택:
```

| scope | 설명 | 값 형식 | 주의 |
|-------|------|---------|------|
| USER_NAME | 이름 | 문자열 | - |
| USER_EMAIL | 이메일 | 문자열 | null 가능 (토스 가입 시 필수 아님) |
| USER_GENDER | 성별 | `MALE` / `FEMALE` | - |
| USER_BIRTHDAY | 생년월일 | `yyyyMMdd` | **콜백 필수** |
| USER_NATIONALITY | 국적 | `LOCAL` / `FOREIGNER` | **콜백 필수** |
| USER_PHONE | 전화번호 | 문자열 | **콜백 필수** |
| USER_CI | CI(본인인증) | 문자열 | **콜백 필수**, PII |

> **이름/이메일/성별 외 항목 선택 시 연결 끊기 콜백 정보 입력 필수.**

### 1.1.1 연결 끊기 콜백 정보 등록 (필수)

콘솔 하단 "연결 끊기 콜백 정보" 섹션에서 토글을 **설정**으로 변경 후 입력:

| 항목 | 입력값 | 예시 (dujjonku) |
|------|--------|-----------------|
| **콜백 URL** | `https://{서버도메인}/api/auth/toss-unlink-callback` | `https://dujjonku-server.vercel.app/api/auth/toss-unlink-callback` |
| **HTTP 메서드** | GET 또는 POST (서버 구현에 맞게) | GET |
| **Basic Auth 헤더** | `{서비스명}:{비밀값}` (자유 형식) | `dujjonku:toss-unlink-callback-2026` |

**Basic Auth 헤더 설정 규칙**:
- 형식: `{임의문자열}:{임의문자열}` (콜론으로 구분)
- 토스가 콜백 호출 시 이 값을 Base64 인코딩하여 `Authorization: Basic {base64}` 헤더로 전송
- 서버에서 이 값을 검증하여 정당한 토스 요청인지 확인
- 이 값을 그대로 `TOSS_UNLINK_CALLBACK_AUTH` 환경변수로 등록 (Phase 2.3)

**반드시 "테스트하기" 버튼 클릭**:
1. 콜백 URL, HTTP 메서드, Basic Auth 헤더 모두 입력 후
2. 콜백 URL 옆 **"테스트하기"** 버튼 클릭
3. **"콜백 요청에 성공했어요."** 메시지 확인
4. 실패 시: 서버 배포 상태, URL 오타, 서버의 콜백 라우트 구현 확인
   - 서버가 아직 배포 안 된 경우: Phase 2~3 완료 후 다시 테스트
   - 이미 배포된 경우: 서버 로그에서 요청 확인

> **주의**: 서버가 아직 배포되지 않았다면 테스트가 실패하는 것이 정상.
> Phase 3 서버 구현 + 배포 완료 후 반드시 돌아와서 테스트 성공을 확인할 것.

```
7. "등록하기" 클릭 → 로그인 기능 활성화 완료
```

### 1.2 복호화 키 발급

**로그인 활성화 후에만 가능.** 사용자에게 안내:
```
1. 토스 콘솔 > 토스 로그인 > "이메일로 복호화 키 받기" 클릭
2. 대표관리자 이메일로 발송됨
3. 이메일에서 두 값을 안전하게 보관:
   - TOSS_DECRYPT_KEY: AES-256-GCM 복호화 키 (Base64 인코딩)
   - TOSS_DECRYPT_AAD: AAD 값 (UTF-8 평문)
4. *** 절대 외부 노출/커밋 금지 ***
```

### 1.3 mTLS 인증서 발급

**로그인 활성화 후에만 가능.** 사용자에게 안내:
```
1. 토스 콘솔 > 토스 로그인 > "인증서 발급" 클릭
2. cert.pem, key.pem 두 파일 다운로드
3. 안전한 위치에 보관 (프로젝트 루트에 두지 말 것, .gitignore 필수)
4. Vercel 배포용 Base64 인코딩:
```

```bash
# macOS/Linux
base64 -i cert.pem | tr -d '\n' > cert_base64.txt
base64 -i key.pem | tr -d '\n' > key_base64.txt
# Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("cert.pem")) > cert_base64.txt
[Convert]::ToBase64String([IO.File]::ReadAllBytes("key.pem")) > key_base64.txt
```

### 1.4 Phase 1 완료 확인

AskUserQuestion:
```
토스 콘솔 설정이 모두 완료되었나요? 아래 항목을 확인해주세요:
1. 이용약관 URL 등록 완료?
2. 로그인 기능 활성화 완료?
3. 복호화 키(TOSS_DECRYPT_KEY, TOSS_DECRYPT_AAD) 수신 완료?
4. mTLS 인증서(cert.pem, key.pem) 다운로드 + Base64 인코딩 완료?
5. 콜백 Basic Auth 값 메모 완료?
```

---

## Phase 2: 서버 인프라 구축

> **상세 가이드**: `references/infrastructure-setup.md` — 회원가입, CLI 설치, 프로젝트 생성, MCP 설치 등 상세 절차

### 2.0 선행 조건 확인 (필수!)

AskUserQuestion:
```
인프라 서비스가 준비되어 있나요? 아래 항목을 확인해주세요:

1. **Vercel 계정** 있나요? (없으면 https://vercel.com/signup 에서 가입, Hobby=무료)
2. **Vercel CLI** 설치했나요? (없으면: npm i -g vercel → vercel login)
3. **Supabase 계정** 있나요? (없으면 https://supabase.com 에서 가입, Free 플랜)
4. **Supabase 프로젝트** 생성했나요? (없으면 Dashboard에서 New Project, Region: Tokyo 권장)
5. **Supabase MCP** 설치했나요? (Claude가 DB 직접 조작 가능하게)

각 항목에 대해 완료/미완료를 알려주세요.
미완료 항목이 있으면 references/infrastructure-setup.md 를 참조하여 단계별 안내.
```

**Supabase MCP 미설치 시** (Claude Code에서 SQL 실행, 테이블 생성 등에 필수):
```bash
# 1. Supabase Access Token 발급: https://supabase.com/dashboard/account/tokens
# 2. MCP 설치:
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase --access-token={토큰}
# 3. Claude Code 재시작 필요
```

### 2.1 Supabase 프로젝트 키 확인

AskUserQuestion: "Supabase 프로젝트의 URL과 service_role key를 알려주세요."

> 확인 경로: Supabase Dashboard > Project Settings > API 탭
> - **Project URL** → `SUPABASE_URL`
> - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (절대 클라이언트 노출 금지)
> - **anon key** → `SUPABASE_ANON_KEY` (클라이언트용, RLS 적용)

사용자 테이블 생성 (Supabase MCP 또는 SQL Editor):
```sql
CREATE TABLE IF NOT EXISTS {프로젝트}_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toss_user_key TEXT UNIQUE NOT NULL,
  nickname TEXT,
  profile_image_url TEXT,
  token_revoked_at TIMESTAMPTZ,  -- 연동 해제 시 갱신
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_{프로젝트}_users_toss_key ON {프로젝트}_users(toss_user_key);
```

### 2.2 로컬 환경 설정 (.env + .gitignore)

`server/.env` 생성 (로컬 개발용, 상세: `references/infrastructure-setup.md` §3):
```env
TOSS_API_BASE_URL=https://apps-in-toss-api.toss.im
TOSS_CERT_PATH=./certs/cert.pem
TOSS_KEY_PATH=./certs/key.pem
TOSS_DECRYPT_KEY={복호화 키}
TOSS_DECRYPT_AAD={AAD}
TOSS_UNLINK_CALLBACK_AUTH={콜백 Basic Auth}
SUPABASE_URL={Project URL}
SUPABASE_SERVICE_ROLE_KEY={service_role key}
JWT_SECRET={32자+ 랜덤 — node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=development
```

`.gitignore`에 반드시 추가:
```gitignore
.env
.env.*
server/.env
client/.env
server/certs/
*.pem
cert_base64.txt
key_base64.txt
```

### 2.3 Vercel 서버 프로젝트 생성

> **절대 주의 — 가장 빈번한 치명적 실수:**
> - **반드시 서버 전용 새 Vercel 프로젝트를 생성**할 것
> - 기존 클라이언트/다른 프로젝트에 서버 배포 **절대 금지**
> - 기존 프로젝트에 배포하면 **프로젝트가 덮어씌워지고 환경변수 충돌로 장애 발생**
> - `vercel link` 시 반드시 **"Set up a new project"** 선택
> - 프로젝트 이름: `{프로젝트명}-server` (예: `dujjonku-server`)
> - 배포 후 도메인: `{프로젝트명}-server.vercel.app`
>
> **실수 방지 체크**: `vercel project ls`로 현재 연결된 프로젝트 확인.

```bash
cd server
vercel link  # 반드시 "Set up a new project" 선택!
# 프로젝트 이름: {프로젝트명}-server
```

### 2.4 환경변수 등록 (Vercel CLI)

**반드시 올바른 프로젝트(서버)에 연결 확인 후 진행**: `vercel project ls`

| 변수명 | 설명 | 필수 |
|--------|------|------|
| `TOSS_API_BASE_URL` | `https://apps-in-toss-api.toss.im` | Y |
| `MTLS_CERT_BASE64` | mTLS 인증서 Base64 (Phase 1.3) | Y |
| `MTLS_KEY_BASE64` | mTLS 키 Base64 (Phase 1.3) | Y |
| `TOSS_DECRYPT_KEY` | 복호화 키 Base64 (Phase 1.2) | Y |
| `TOSS_DECRYPT_AAD` | 복호화 AAD UTF-8 (Phase 1.2) | Y |
| `TOSS_UNLINK_CALLBACK_AUTH` | 콜백 Basic Auth (Phase 1.1) | Y |
| `SUPABASE_URL` | Supabase 프로젝트 URL | Y |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 키 | Y |
| `JWT_SECRET` | JWT 서명 시크릿 (32자+ 랜덤) | Y |
| `JWT_EXPIRES_IN` | JWT 만료 (기본 `7d`) | N |
| `JWT_REFRESH_EXPIRES_IN` | Refresh 만료 (기본 `30d`) | N |
| `NODE_ENV` | `production` | Y |

> **치명적 함정: `echo`의 줄바꿈(\n) 문제**
> `echo "값" | vercel env add` 사용 시 **echo가 자동으로 줄바꿈(\n)을 추가**하여
> 환경변수가 `값\n`으로 저장됨 → Basic Auth 비교 실패(401), 복호화 실패 등 원인.
> **반드시 `echo -n`(줄바꿈 없음)을 사용할 것!**

```bash
# 올바른 방법 (echo -n 필수!)
echo -n "https://apps-in-toss-api.toss.im" | vercel env add TOSS_API_BASE_URL production
echo -n "{MTLS_CERT_BASE64값}" | vercel env add MTLS_CERT_BASE64 production
echo -n "{MTLS_KEY_BASE64값}" | vercel env add MTLS_KEY_BASE64 production
echo -n "{TOSS_DECRYPT_KEY값}" | vercel env add TOSS_DECRYPT_KEY production
echo -n "{TOSS_DECRYPT_AAD값}" | vercel env add TOSS_DECRYPT_AAD production
echo -n "{서비스명}:{콜백비밀값}" | vercel env add TOSS_UNLINK_CALLBACK_AUTH production
echo -n "{SUPABASE_URL}" | vercel env add SUPABASE_URL production
echo -n "{SUPABASE_SERVICE_ROLE_KEY}" | vercel env add SUPABASE_SERVICE_ROLE_KEY production
echo -n "{JWT_SECRET}" | vercel env add JWT_SECRET production
echo -n "7d" | vercel env add JWT_EXPIRES_IN production
echo -n "30d" | vercel env add JWT_REFRESH_EXPIRES_IN production
echo -n "production" | vercel env add NODE_ENV production
vercel env ls  # 등록 확인 — 12개 변수 모두 있는지 체크
```

### 2.5 서버 배포 + 콜백 테스트 검증

```bash
# 서버 첫 배포
cd server && vercel --prod

# 배포 완료 후 콜백 라우트 동작 확인 (curl로 검증)
curl -s -w "\n%{http_code}" \
  -H "Authorization: Basic $(echo -n '{서비스명}:{콜백비밀값}' | base64 -w0)" \
  "https://{프로젝트명}-server.vercel.app/api/auth/toss-unlink-callback?userKey=test&referrer=UNLINK"
# 기대 결과: {"success":true} 200
# 401이면: TOSS_UNLINK_CALLBACK_AUTH 환경변수에 줄바꿈 포함 → echo -n으로 재등록 + 재배포
```

**curl 200 확인 후** → 토스 콘솔로 돌아가서 "테스트하기" 버튼 클릭 → **"콜백 요청에 성공했어요."** 확인.

> **트러블슈팅: 콜백 테스트 실패 시**
> | 증상 | 원인 | 해결 |
> |------|------|------|
> | "Failed to fetch" | 서버 미배포 또는 URL 오타 | 배포 상태 확인, URL 재확인 |
> | 401 UNAUTHORIZED | 환경변수에 줄바꿈(\n) 포함 | `vercel env rm` → `echo -n` 재등록 → `vercel --prod` |
> | 404 | 콜백 라우트 미구현 | `routes/auth.ts`에 GET+POST 핸들러 확인 |

---

## Phase 3: 서버 구현

상세 구현 패턴: `references/dujjonku-reference.md`
API 스펙: `references/toss-login-api.md`

### 체크리스트

- [ ] **services/tlsClient.ts** — mTLS HTTPS 클라이언트
  - Base64 환경변수 우선, 파일 경로 폴백 (로컬)
  - **`undici`의 `Agent`를 사용** (Node.js `https.Agent` 사용 금지!)
    - Node.js native `fetch`는 undici 기반이므로 `dispatcher` 옵션에 undici `Agent`만 호환됨
    - `https.Agent`를 `dispatcher`에 전달하면 인증서가 전송되지 않아 mTLS 실패
    - `npm install undici` 필수 (Node.js 내장이지만 직접 import하려면 명시적 설치 필요)
  - Agent 설정: `new Agent({ connect: { cert, key, rejectUnauthorized: true }, keepAliveTimeout: 1000, connections: 10 })`
  - fetch 호출: `fetch(url, { ...options, dispatcher: agent })` — `@ts-expect-error` 주석 필요
  - 재시도: socket hang up/ECONNRESET만 (최대 2회, 지수 백오프 500ms)
  - ETIMEDOUT 재시도 안 함 (Vercel 10초 제한)
  - 타임아웃: 8초 (Vercel 10초 - 2초 버퍼)

- [ ] **services/tossAuth.ts** — 토스 OAuth2
  - `exchangeToken(authCode, referrer)` → generate-token (POST, mTLS)
  - `getUserInfo(accessToken)` → login-me (GET, Bearer, mTLS)
  - `decryptUserInfo(encrypted)` → AES-256-GCM (IV[12]+Ciphertext+AuthTag[16])
  - `refreshAccessToken(refreshToken)` → refresh-token (POST, mTLS)

- [ ] **services/supabaseAdmin.ts** — DB
  - `upsertUser()`: upsert, **token_revoked_at → null 리셋** (재로그인 시)
  - `revokeUserTokens(userKey)`: token_revoked_at 갱신
  - `getTokenRevokedAt(userId)`: 토큰 무효화 여부 확인

- [ ] **middleware/auth.ts** — JWT
  - `generateToken(payload)`: issuer='{프로젝트}-server', 만료=JWT_EXPIRES_IN
  - `generateRefreshToken(payload)`: 만료=JWT_REFRESH_EXPIRES_IN
  - `verifyToken` 미들웨어: Bearer → 검증 → TOKEN_REVOKED 체크
  - `optionalAuth`: 비차단 인증

- [ ] **routes/auth.ts** — 라우트
  - `POST /api/auth/login`: **9초 타임아웃**, exchangeToken → getUserInfo → upsertUser → JWT
  - `POST /api/auth/refresh`: refreshToken 검증 → TOKEN_REVOKED 체크 → 새 토큰
  - `POST /api/auth/logout`: 토큰 무효화
  - `GET /api/auth/me`: JWT 검증 → 사용자 정보
  - `GET+POST /api/auth/toss-unlink-callback`: Basic Auth → revokeUserTokens

---

## Phase 4: 클라이언트 구현

상세 구현 패턴: `references/dujjonku-reference.md` (온보딩 페이지, 라우팅, 리다이렉트 포함)

### 체크리스트

- [ ] **utils/tossEnvironment.ts** — `window.ReactNativeWebView` 존재 여부로 토스 환경 판별 (결과 캐싱)

- [ ] **stores/authStore.ts** — Zustand + persist(localStorage)
  - 상태: isLoggedIn, tokenRevoked, userId, accessToken, refreshToken, user, lastLoginAt
  - `handleTokenRevoked()`: tokenRevoked 플래그 + 전체 상태 초기화
  - Storage key: `{프로젝트}-auth-storage`

- [ ] **hooks/useAuth.ts** — 로그인 훅
  - `login()`: SDK `appLogin()` 동적 import → 서버 교환 → 상태 저장
  - `logout()`, `refreshToken()`, `checkAuthStatus()`
  - TOKEN_REVOKED 감지 → authStore.handleTokenRevoked()

- [ ] **lib/api.ts** — 모든 API 응답에서 TOKEN_REVOKED 자동 감지/처리

- [ ] **pages/OnboardingPage.tsx** — 온보딩(로그인) 페이지
  - 서비스 소개 UI (로고, 한 줄 설명, 주요 기능 아이콘)
  - "토스로 시작하기" CTA 버튼 → `useAuth().login()` 호출
  - 로딩 상태 표시 (로그인 진행 중 스피너)
  - 이미 로그인 → 메인 페이지로 자동 리다이렉트
  - **로그인 에러 피드백 (필수! 누락하면 "온보딩에 갇히는" 버그 발생)**:
    - `loginError` 상태를 별도로 관리 (`useState<string | null>(null)`)
    - try 블록: `await login()` 성공 후 **직접** 메인 페이지로 전환 (useEffect 의존 금지)
    - catch 블록: **토스 환경에서도** 에러 메시지를 UI에 표시 (console.error만 하면 사용자가 원인 파악 불가)
    - 에러 UI: 버튼 상단에 빨간 알림 박스로 에러 메시지 표시 + 재시도 가능
  - **로그인 성공 후 화면 전환은 useEffect가 아닌 직접 상태 제어로 처리**
    - `login()` 성공 → 즉시 `setShowOnboarding(false)` 또는 `navigate('/')` 호출
    - useEffect로만 전환하면 상태 업데이트 타이밍에 따라 온보딩에 갇힐 수 있음

- [ ] **components/ProtectedRoute.tsx** — 인증 가드
  - hydration 대기(100ms) → 최근 로그인(30s) 스킵 → 백그라운드 /me 검증
  - 미인증 → /onboarding 리다이렉트
  - TOKEN_REVOKED → 자동 로그아웃 + /onboarding 리다이렉트
  - 네트워크 에러 시 기존 로그인 유지 (graceful)

- [ ] **App.tsx 라우팅** — 인증 기반 라우팅 구성
  ```
  /onboarding → OnboardingPage (공개, 로그인 불필요)
  / → ProtectedRoute로 감싸서 메인 페이지 (로그인 필요)
  ```
  - 미로그인 시 모든 보호 경로 → /onboarding 리다이렉트
  - 로그인 성공 시 → / (메인) 리다이렉트
  - tokenRevoked 시 → 자동으로 /onboarding 복귀

### 클라이언트 플로우

**로그인 플로우:**
```
[온보딩 페이지] → "토스로 시작하기" 클릭
  → isTossEnvironment() 확인
  → const { authorizationCode, referrer } = await appLogin()
  → POST /api/auth/login { authorizationCode, referrer }
  → 응답: { user, tokens: { accessToken, refreshToken } }
  → authStore에 저장 → 메인 화면(/)으로 navigate
```

**연동 해제 → 재로그인 플로우:**
```
[토스앱에서 연결 끊기]
  → 토스 → 서버 콜백 → token_revoked_at 갱신
  → 다음 API 호출 시 401 TOKEN_REVOKED 응답
  → api.ts 인터셉터 감지 → authStore.handleTokenRevoked()
  → 상태 초기화 + /onboarding 리다이렉트
  → 사용자가 다시 "토스로 시작하기" 클릭 → 재로그인
  → 서버: upsertUser() 시 token_revoked_at → null 리셋
```

**앱 재진입 플로우:**
```
[토스 앱 → 미니앱 진입]
  → ProtectedRoute: authStore.isLoggedIn 확인
  → 미로그인 → /onboarding 리다이렉트
  → 로그인 → 백그라운드 /me 검증 → TOKEN_REVOKED면 로그아웃 → /onboarding
```

---

## Phase 5: QA (공식 체크리스트)

| 항목 | 확인 내용 |
|------|----------|
| 사전 체크 | 콘솔 계약/설정 승인 상태, 약관 링크 정상 작동 |
| **최초 로그인** | 인가 코드 → 서버 교환 → 복호화/저장 → 홈 진입 |
| **재로그인** | 약관 동의 없이 인가 코드 즉시 수신, 정상 진입 |
| **토큰 만료 직전** | 자동 리프레시 성공, 실패 시 재로그인 요구 |
| **연동 해제 콜백** | 서버 토큰 즉시 폐기, 재진입 시 로그인 요구, 사용자 안내 표시 |
| **네트워크 장애** | 지수 백오프/재시도, 안내 문구 노출, 기존 로그인 유지 |
| TOKEN_REVOKED 후 재로그인 | token_revoked_at null 리셋 확인 |
| Vercel 타임아웃 | 로그인 10초 내 완료 (9초 AbortController) |
| 샌드박스 | referrer=SANDBOX 환경 테스트 |
| mTLS 인증서 | 만료 전 갱신 알림 설정 |
| **mTLS 구현 검증** | `undici Agent` 사용 확인 (`https.Agent` 사용 금지), `dispatcher` 옵션으로 전달 |
| **로그인 에러 피드백** | 토스 환경에서 로그인 실패 시 에러 메시지가 UI에 표시되는지 확인 (console.error만 하면 안됨) |
| **로그인 성공 전환** | `login()` 성공 후 직접 navigate/setShowOnboarding 호출하는지 확인 (useEffect만 의존 금지) |
| **콜백 테스트** | 토스 콘솔 "테스트하기" 버튼 → "콜백 요청에 성공했어요." 확인 |

---

## References

- **references/infrastructure-setup.md**: Vercel/Supabase 회원가입, CLI 설치, MCP 설치, .env/.gitignore 설정
- **references/toss-login-api.md**: 토스 API 전체 스펙 (SDK, 토큰교환, 사용자정보, 복호화, 콜백, scope, 약관)
- **references/dujjonku-reference.md**: 프로덕션 구현 레퍼런스 (온보딩 페이지, 라우팅, 리다이렉트, 아키텍처, 상세 플로우)
- **assets/terms-template.md**: 이용약관 + 개인정보 수집 동의 한국어 템플릿
- 토스 공식: [콘솔](https://developers-apps-in-toss.toss.im/login/console.html) | [개발](https://developers-apps-in-toss.toss.im/login/develop.html) | [QA](https://developers-apps-in-toss.toss.im/login/qa.html) | [appLogin](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/로그인/appLogin.html)
