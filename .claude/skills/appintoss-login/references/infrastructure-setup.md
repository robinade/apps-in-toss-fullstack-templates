# 인프라 선행 설정 가이드 (Vercel + Supabase)

앱인토스 로그인 구현에 필요한 외부 서비스 가입, 설치, 설정 상세 가이드.
SKILL.md Phase 2 시작 전에 이 문서를 참조하여 선행 작업 완료.

---

## 1. Vercel 설정

### 1.1 회원가입 (계정이 없는 경우)

1. https://vercel.com/signup 접속
2. GitHub/GitLab/Bitbucket 계정 또는 이메일로 가입
3. **요금제**: Hobby (무료) 플랜으로 충분
   - Serverless Function 실행: 월 100GB-Hours
   - 대역폭: 월 100GB
   - 빌드: 월 6000분
   - 프로덕션 출시 후 트래픽 많아지면 Pro ($20/월) 고려

### 1.2 Vercel CLI 설치

```bash
npm i -g vercel
```

설치 확인:
```bash
vercel --version
```

### 1.3 Vercel 로그인

```bash
vercel login
```
- 브라우저가 열리면 인증 완료
- 이미 로그인되어 있으면 `vercel whoami`로 확인

### 1.4 서버 전용 Vercel 프로젝트 생성

> **절대 주의**: 기존 클라이언트 프로젝트에 서버를 배포하면 프로젝트가 덮어씌워짐!

```bash
cd server
vercel link
# 반드시 "Set up a new project" 선택
# 프로젝트 이름: {프로젝트명}-server (예: dujjonku-server)
```

확인:
```bash
vercel project ls  # {프로젝트명}-server 가 보여야 함
```

---

## 2. Supabase 설정

### 2.1 회원가입 (계정이 없는 경우)

1. https://supabase.com 접속 → "Start your project" 클릭
2. GitHub 계정으로 가입 (권장) 또는 이메일 가입
3. **요금제**: Free 플랜으로 MVP 충분
   - 데이터베이스: 500MB
   - 대역폭: 5GB/월
   - 동시 접속: 200
   - Edge Functions: 500K 호출/월
   - 프로젝트 2개까지 무료
   - 프로덕션 규모 커지면 Pro ($25/월) 고려

### 2.2 프로젝트 생성

1. https://supabase.com/dashboard 접속
2. "New Project" 클릭
3. 설정:
   - **Name**: 프로젝트명 (예: dujjonku, savemoney)
   - **Database Password**: 강력한 비밀번호 생성 (나중에 필요하므로 안전하게 보관)
   - **Region**: Northeast Asia (Tokyo) - `ap-northeast-1` 권장 (한국 사용자 대상)
4. "Create new project" 클릭 → 프로비저닝 대기 (1~2분)

### 2.3 프로젝트 키 확인

프로젝트 생성 완료 후:

1. 좌측 메뉴 "Project Settings" (톱니바퀴 아이콘)
2. "API" 탭 클릭
3. 필요한 값 3가지:

| 항목 | 위치 | 용도 | 환경변수명 |
|------|------|------|-----------|
| **Project URL** | API Settings > URL | DB 접속 URL | `SUPABASE_URL` |
| **anon (public) key** | API Settings > Project API keys | 클라이언트용 (RLS 적용) | `SUPABASE_ANON_KEY` |
| **service_role key** | API Settings > Project API keys | 서버용 (RLS 우회, **비공개**) | `SUPABASE_SERVICE_ROLE_KEY` |

> **service_role key는 절대 클라이언트에 노출하지 말 것!** 서버 환경변수로만 사용.

### 2.4 Supabase MCP 설치 (Claude Code에서 DB 직접 조작)

Supabase 공식 MCP를 설치하면 Claude가 SQL 실행, 마이그레이션 적용, 테이블 조회 등을 직접 수행 가능.

```bash
claude mcp add supabase -- npx -y @supabase/mcp-server-supabase --access-token={SUPABASE_ACCESS_TOKEN}
```

**Access Token 발급**:
1. https://supabase.com/dashboard/account/tokens 접속
2. "Generate new token" 클릭
3. 토큰 이름 입력 (예: "claude-code") → 생성
4. 생성된 토큰 복사 → 위 명령어의 `{SUPABASE_ACCESS_TOKEN}` 자리에 입력

설치 확인:
```bash
claude mcp list  # supabase가 보여야 함
```

> **MCP 설치 후 Claude Code를 재시작해야 MCP 도구가 활성화됩니다.**

---

## 3. 로컬 개발 환경 설정

### 3.1 서버 .env 파일

`server/.env` 파일 생성 (로컬 개발용):

```env
# Toss API
TOSS_API_BASE_URL=https://apps-in-toss-api.toss.im
TOSS_CERT_PATH=./certs/cert.pem
TOSS_KEY_PATH=./certs/key.pem
TOSS_DECRYPT_KEY={Phase 1.2에서 받은 복호화 키}
TOSS_DECRYPT_AAD={Phase 1.2에서 받은 AAD}
TOSS_UNLINK_CALLBACK_AUTH={Phase 1.1.1에서 설정한 Basic Auth 값}

# Supabase
SUPABASE_URL={2.3에서 확인한 Project URL}
SUPABASE_SERVICE_ROLE_KEY={2.3에서 확인한 service_role key}

# JWT
JWT_SECRET={32자 이상 랜덤 문자열}
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Environment
NODE_ENV=development
```

### 3.2 클라이언트 .env 파일

`client/.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL={Supabase Project URL}
VITE_SUPABASE_ANON_KEY={Supabase anon key}
```

### 3.3 .gitignore 등록

프로젝트 루트 `.gitignore`에 추가:

```gitignore
# 환경변수 (민감 정보)
.env
.env.local
.env.production
server/.env
client/.env

# mTLS 인증서
server/certs/
*.pem
cert_base64.txt
key_base64.txt
```

확인:
```bash
git status  # .env, certs/ 파일이 Untracked에 나타나지 않아야 함
```

### 3.4 mTLS 인증서 로컬 배치 (개발용)

```bash
mkdir -p server/certs
cp /path/to/cert.pem server/certs/cert.pem
cp /path/to/key.pem server/certs/key.pem
```

> Vercel 배포 시에는 Base64 인코딩된 환경변수(`MTLS_CERT_BASE64`, `MTLS_KEY_BASE64`)를 사용.
> 로컬 개발 시에는 파일 경로(`TOSS_CERT_PATH`, `TOSS_KEY_PATH`)를 사용.

---

## 4. JWT Secret 생성

랜덤 시크릿 생성 방법:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

생성된 값을 `server/.env`의 `JWT_SECRET`과 Vercel 환경변수 양쪽에 동일하게 등록.
