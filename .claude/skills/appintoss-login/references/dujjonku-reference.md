# Dujjonku 프로젝트 로그인 구현 레퍼런스

실제 프로덕션에서 운용 중인 앱인토스 로그인 구현 예시. 새 프로젝트 구현 시 참고.

## 아키텍처 요약

```
[토스 앱] → appLogin() → [클라이언트] → authCode+referrer → [Vercel 서버]
    → mTLS로 토스 API 호출 → 토큰 교환 → 사용자 정보 조회+복호화
    → Supabase upsert → JWT 발급 → 클라이언트 응답
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 클라이언트 | React (Vite) + @apps-in-toss/web-framework |
| 상태관리 | Zustand (persist middleware, localStorage) |
| 라우팅 | wouter (NOT react-router) |
| 서버 | Express.js on Vercel (serverless) |
| DB | Supabase (PostgreSQL) |
| 인증 | JWT (jsonwebtoken) |
| 토스 통신 | mTLS (undici Agent + Node.js native fetch) |

## 핵심 파일 구조

### 클라이언트

```
client/src/
  pages/OnboardingPage.tsx  - 온보딩(로그인) 페이지 (토스로 시작하기 버튼)
  hooks/useAuth.ts          - 로그인/로그아웃/토큰갱신/상태확인
  stores/authStore.ts       - Zustand 인증 상태 (persist)
  components/ProtectedRoute.tsx - 인증 가드 (미로그인시 /onboarding 리다이렉트)
  utils/tossEnvironment.ts  - 토스 앱 환경 감지 (ReactNativeWebView 존재 여부)
  lib/api.ts                - API 클라이언트 (TOKEN_REVOKED 자동 처리)
  App.tsx                   - 라우팅 설정 (/onboarding 공개, / 보호)
```

### 서버

```
server/src/
  routes/auth.ts            - 로그인/로그아웃/토큰갱신/me/연동해제콜백 라우트
  services/tossAuth.ts      - 토스 토큰교환/사용자정보조회/복호화/토큰갱신
  services/tlsClient.ts     - mTLS HTTPS 클라이언트 (인증서 로드, 재시도)
  services/supabaseAdmin.ts - Supabase Admin (upsert, 토큰무효화, 조회)
  middleware/auth.ts        - JWT 생성/검증/미들웨어 (TOKEN_REVOKED 체크)
```

## 온보딩 페이지 구현 (OnboardingPage.tsx)

로그인 진입점. 미인증 사용자가 최초로 보는 화면.

### 구조
```typescript
function OnboardingPage() {
  const { login } = useAuth();
  const { isLoggedIn } = useAuthStore();
  const [, navigate] = useLocation(); // wouter
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null); // 에러 상태 필수!

  // 이미 로그인된 상태면 메인으로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [isLoggedIn]);

  const handleLogin = async () => {
    setIsLoading(true);
    setLoginError(null); // 이전 에러 초기화
    try {
      await login();
      // ⚠️ 성공 시 직접 navigate! useEffect만 의존하면 타이밍 문제로 온보딩에 갇힐 수 있음
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('로그인 실패:', error.message);
      // ⚠️ 토스 환경에서도 반드시 에러를 UI에 표시! console.error만 하면 사용자가 원인 파악 불가
      setLoginError(error.message || '로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      {/* 서비스 소개 영역 */}
      <div className="hero">
        <img src="/logo.png" alt="서비스 로고" />
        <h1>{서비스명}</h1>
        <p>{서비스 한 줄 설명}</p>
      </div>

      {/* 주요 기능 소개 (선택) */}
      <div className="features">...</div>

      {/* 에러 메시지 표시 (필수!) */}
      {loginError && (
        <div className="error-alert">
          <p>{loginError}</p>
        </div>
      )}

      {/* CTA 로그인 버튼 */}
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? '로그인 중...' : '토스로 시작하기'}
      </button>
    </div>
  );
}
```

### 핵심 포인트
- 토스 환경이 아닐 때(PC 브라우저 등) 안내 메시지 표시
- 로딩 중 버튼 비활성화 (중복 클릭 방지)
- **에러 발생 시 반드시 UI에 표시** (console.error만 하면 토스 환경에서 사용자가 원인 파악 불가 → 온보딩에 갇힘)
- **로그인 성공 후 직접 navigate 호출** (useEffect에만 의존하면 상태 타이밍 문제로 화면 전환 안 될 수 있음)

## 라우팅 설정 (App.tsx)

### wouter 사용 시 (dujjonku 프로젝트)
```typescript
import { Route, Switch } from 'wouter';

function App() {
  return (
    <Switch>
      {/* 공개 경로 - 로그인 불필요 */}
      <Route path="/onboarding" component={OnboardingPage} />

      {/* 보호 경로 - ProtectedRoute로 감싸기 */}
      <Route path="/">
        <ProtectedRoute>
          <MainPage />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}
```

### react-router 사용 시
```typescript
<Routes>
  <Route path="/onboarding" element={<OnboardingPage />} />
  <Route path="/" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
</Routes>
```

## 연동 해제 → 재로그인 플로우 상세

```
1. 사용자가 토스 앱에서 연결 끊기
   (토스앱 > 설정 > 인증 및 보안 > 토스로 로그인한 서비스 > 연결 끊기)

2. 토스 → 서버 콜백 호출
   GET/POST /api/auth/toss-unlink-callback?userKey={userKey}&referrer=UNLINK
   - Basic Auth 검증
   - revokeUserTokens(userKey) → token_revoked_at 갱신

3. 다음 클라이언트 API 호출 시
   - 서버: JWT 검증 → token_revoked_at 확인 → 401 TOKEN_REVOKED 응답
   - api.ts 인터셉터: TOKEN_REVOKED 감지
   - authStore.handleTokenRevoked() 호출
     → tokenRevoked = true, 전체 인증 상태 초기화
     → localStorage 클리어

4. 클라이언트 UI 반응
   - ProtectedRoute: isLoggedIn=false 감지 → /onboarding 리다이렉트
   - (선택) toast: "토스 로그인 연결이 해제되었습니다"

5. 사용자 재로그인
   - /onboarding 페이지에서 "토스로 시작하기" 클릭
   - appLogin() → 약관 동의 없이 바로 인가코드 반환 (이미 연동 이력)
   - 서버: upsertUser() 시 token_revoked_at → null 리셋
   - 정상 로그인 완료 → 메인 페이지 이동
```

## 로그인 플로우 상세

### 1단계: 클라이언트 (useAuth.ts)
```typescript
// 토스 환경 감지 후 SDK 동적 import
if (isTossEnvironment()) {
  const { appLogin } = await import('@apps-in-toss/web-framework');
  const { authorizationCode, referrer } = await appLogin();

  // 서버로 토큰 교환 요청
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorizationCode, referrer }),
  });

  // 응답에서 JWT + 사용자 정보 추출
  const data = await response.json();
  store.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
  store.setUser({ id, tossUserKey, nickname, profileImage });
  store.login(tossUserKey);
}
```

### 2단계: 서버 (routes/auth.ts → POST /api/auth/login)
```
1. authorizationCode + referrer 수신
2. exchangeToken() → mTLS로 토스 generate-token API 호출
3. getUserInfo() → mTLS로 토스 login-me API 호출 (암호화된 응답)
4. decryptUserInfo() → AES-256-GCM 복호화 (이름, 이메일, 전화번호 등)
5. upsertUser() → Supabase dujjonku_users 테이블에 사용자 저장
6. generateToken() + generateRefreshToken() → JWT 발급
7. 클라이언트에 응답: { user, tokens }
```

### 3단계: 인증 상태 관리 (authStore.ts)
- Zustand persist로 localStorage에 토큰/사용자정보 저장
- `tokenRevoked` 플래그: 토스 연동 해제 감지 시 true → 컴포넌트에서 toast 후 리셋
- `lastLoginAt`: 최근 30초 내 로그인 시 서버 검증 스킵

### 4단계: 인증 가드 (ProtectedRoute.tsx)
- hydration 완료 대기 (100ms)
- 최근 로그인(30초 이내)이면 서버 검증 스킵
- 백그라운드로 `/api/auth/me` 호출하여 토큰 유효성 확인
- TOKEN_REVOKED 응답 시 자동 로그아웃
- 네트워크 에러 시 기존 로그인 상태 유지

## 연동 해제 콜백 처리

### 서버 (routes/auth.ts)
```
GET/POST /api/auth/toss-unlink-callback
1. Basic Auth 검증 (TOSS_UNLINK_CALLBACK_AUTH 환경변수)
2. userKey + referrer 추출
3. revokeUserTokens() → dujjonku_users.token_revoked_at 갱신
4. 다음 클라이언트 API 호출 시 401 TOKEN_REVOKED 응답
```

### 클라이언트 자동 처리
- API 호출 시 TOKEN_REVOKED 감지 → authStore.handleTokenRevoked()
- tokenRevoked 플래그 → toast 표시 → 온보딩으로 리다이렉트

## mTLS 인증서 처리 (tlsClient.ts)

### 인증서 로드 우선순위
1. Base64 환경변수 (Vercel 배포용): `MTLS_CERT_BASE64`, `MTLS_KEY_BASE64`
2. 파일 경로 (로컬 개발용): `TOSS_CERT_PATH`, `TOSS_KEY_PATH`

### undici Agent 설정 (Node.js native fetch 호환)

> **주의**: Node.js `https.Agent`를 사용하면 안 됨! Node.js native `fetch`는 undici 기반이므로
> `dispatcher` 옵션에 `https.Agent`를 전달하면 인증서가 무시되어 mTLS가 작동하지 않음.
> 반드시 `undici`의 `Agent`를 사용해야 함. (`npm install undici` 필수)

```typescript
import { Agent } from 'undici';

const agent = new Agent({
  connect: {
    cert,
    key,
    rejectUnauthorized: true,
  },
  keepAliveTimeout: 1000,
  connections: 10,
});

// fetch 호출 시
const response = await fetch(url, {
  ...options,
  // @ts-expect-error Node.js native fetch accepts undici Dispatcher
  dispatcher: agent,
});
```

### 재시도 로직
- socket hang up, ECONNRESET → 자동 재시도 (최대 2회)
- 지수 백오프: 500ms * attempt (최대 1000ms)
- ETIMEDOUT은 재시도하지 않음 (Vercel 10초 제한)

## Supabase 스키마

### dujjonku_users 테이블
```sql
CREATE TABLE dujjonku_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toss_user_key TEXT UNIQUE NOT NULL,
  nickname TEXT,
  profile_image_url TEXT,
  token_revoked_at TIMESTAMPTZ,  -- 토스 연동 해제 시 갱신
  push_enabled BOOLEAN DEFAULT FALSE,
  push_consent_at TIMESTAMPTZ,
  push_revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Vercel 환경변수 목록

| 변수명 | 설명 | 필수 |
|--------|------|------|
| TOSS_API_BASE_URL | 토스 API URL (`https://apps-in-toss-api.toss.im`) | Y |
| MTLS_CERT_BASE64 | mTLS 인증서 (Base64) | Y |
| MTLS_KEY_BASE64 | mTLS 키 (Base64) | Y |
| TOSS_DECRYPT_KEY | AES-256-GCM 복호화 키 (Base64) | Y |
| TOSS_DECRYPT_AAD | 복호화 AAD 값 | Y |
| TOSS_UNLINK_CALLBACK_AUTH | 연동 해제 콜백 Basic Auth 값 | Y |
| SUPABASE_URL | Supabase 프로젝트 URL | Y |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service_role 키 | Y |
| JWT_SECRET | JWT 서명 시크릿 | Y |
| JWT_EXPIRES_IN | JWT 만료 기간 (기본 7d) | N |
| JWT_REFRESH_EXPIRES_IN | RefreshToken 만료 기간 (기본 30d) | N |
| NODE_ENV | 환경 (production) | Y |

## 주의사항

1. **Vercel 10초 타임아웃**: 로그인 라우트에 9초 타임아웃 적용
2. **인가코드 유효시간**: 10분, 일회성
3. **AccessToken 유효시간**: 1시간 (토스), JWT는 별도 설정
4. **RefreshToken 유효시간**: 14일 (토스), JWT는 별도 설정
5. **mTLS 필수**: 프로덕션에서 토스 API 호출 시 반드시 인증서 필요
6. **복호화 키 보안**: TOSS_DECRYPT_KEY는 절대 외부 노출 금지
7. **재로그인 시 token_revoked_at 초기화**: upsertUser에서 null로 리셋
