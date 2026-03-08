# Toss Login API Reference

## Base URL
`https://apps-in-toss-api.toss.im`

## 1. 인가 코드 받기 (SDK)

### appLogin()

```typescript
// WebView (web-framework)
import { appLogin } from '@apps-in-toss/web-framework';
// React Native (framework)
import { appLogin } from '@apps-in-toss/framework';

const { authorizationCode, referrer } = await appLogin();
```

| 반환값 | 설명 |
|--------|------|
| authorizationCode | 일회성 인가 코드 (유효시간 10분, 재사용 불가) |
| referrer | `DEFAULT` (토스 앱) / `SANDBOX` (샌드박스) |

**동작**:
- 최초 로그인: 토스 로그인 창 + 약관 동의 화면 노출 → 동의 후 인가 코드 반환
- 재로그인 (이미 연동): 별도 로그인 창 없이 즉시 인가 코드 반환

**주의**: 클라이언트에서 인가 코드를 장기간 저장하지 말 것. 반드시 서버로 전송하여 토큰 교환.

### getIsTossLoginIntegratedService()

```typescript
import { getIsTossLoginIntegratedService } from '@apps-in-toss/web-framework';
const isIntegrated = await getIsTossLoginIntegratedService();
// true: 연동됨 / false: 미연동 / undefined: 미지원 앱 버전
```

지원: RN SDK v1.4.9+, Web SDK v1.4.9+, Toss App v5.237.0+

---

## 2. AccessToken 받기 (토큰 교환)

- **Method**: `POST`
- **URL**: `/api-partner/v1/apps-in-toss/user/oauth2/generate-token`
- **Content-Type**: `application/json`
- **인증**: mTLS 필수

### Request Body

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| authorizationCode | string | Y | appLogin()에서 받은 인가코드 |
| referrer | string | Y | appLogin()에서 받은 referrer |

### Success Response

```json
{
  "resultType": "SUCCESS",
  "success": {
    "accessToken": "eyJra...",
    "refreshToken": "xNEYPA...",
    "scope": "user_ci user_birthday user_nationality user_name user_phone user_gender",
    "tokenType": "Bearer",
    "expiresIn": 3599
  }
}
```

### Error Response

인가 코드 만료 또는 중복 사용 시:
```json
{ "error": "invalid_grant" }
```

서버 에러:
```json
{
  "resultType": "FAIL",
  "error": {
    "errorCode": "INTERNAL_ERROR",
    "reason": "요청을 처리하는 도중에 문제가 발생했습니다."
  }
}
```

**유효시간**: accessToken 1시간, refreshToken 14일

---

## 3. AccessToken 재발급

- **Method**: `POST`
- **URL**: `/api-partner/v1/apps-in-toss/user/oauth2/refresh-token`
- **인증**: mTLS 필수

### Request Body

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| refreshToken | string | Y | 기존 발급된 refreshToken |

### Success Response
토큰 교환과 동일한 형식 (accessToken, refreshToken, scope, tokenType, expiresIn)

---

## 4. 사용자 정보 받기

- **Method**: `GET`
- **URL**: `/api-partner/v1/apps-in-toss/user/oauth2/login-me`
- **Header**: `Authorization: Bearer ${AccessToken}`
- **인증**: mTLS 필수

### 응답 필드 상세

| 필드 | 타입 | 필수 | 암호화 | 설명 |
|------|------|------|--------|------|
| userKey | number | Y | N | 사용자 고유 식별값 |
| scope | string | Y | N | 인가된 scope (user_key 포함, 2026-01-02~) |
| agreedTerms | list | Y | N | 사용자가 동의한 약관 태그 목록 |
| name | string | N | **Y** | 사용자 이름 |
| phone | string | N | **Y** | 휴대전화번호 |
| birthday | string | N | **Y** | 생년월일 (`yyyyMMdd` 형식) |
| ci | string | N | **Y** | CI(Connection Information) 고유 식별값 |
| di | string | N | **Y** | 항상 `null` |
| gender | string | N | **Y** | 성별 (`MALE` / `FEMALE`) |
| nationality | string | N | **Y** | 내/외국인 (`LOCAL` / `FOREIGNER`) |
| email | string | N | **Y** | 이메일 (토스 가입 시 필수 아님, null 가능) |

```json
{
  "resultType": "SUCCESS",
  "success": {
    "userKey": 443731104,
    "scope": "user_ci,user_birthday,user_nationality,user_name,user_phone,user_gender,user_key",
    "agreedTerms": ["terms_tag1", "terms_tag2"],
    "name": "ENCRYPTED_VALUE",
    "phone": "ENCRYPTED_VALUE",
    "birthday": "ENCRYPTED_VALUE",
    "ci": "ENCRYPTED_VALUE",
    "di": null,
    "gender": "ENCRYPTED_VALUE",
    "nationality": "ENCRYPTED_VALUE",
    "email": null
  }
}
```

### Error Codes

| errorCode | 설명 |
|-----------|------|
| invalid_grant | 유효하지 않은 토큰 (만료됨) → 재발급 필요 |
| INTERNAL_ERROR | 내부 서버 에러 |
| USER_KEY_NOT_FOUND | 유저 키 값을 찾을 수 없음 |
| USER_NOT_FOUND | 토스 유저 정보를 찾을 수 없음 |
| BAD_REQUEST_RETRIEVE_CERT_RESULT_EXCEEDED_LIMIT | 조회 횟수 초과 (di 없는 API로 우회 가능) |

---

## 5. 로그인 연결 끊기

발급받은 AccessToken을 더 이상 사용하지 않거나 사용자 요청으로 토큰을 만료시킬 때 사용.

### accessToken으로 끊기
- **Method**: `POST`
- **URL**: `/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token`
- **Header**: `Authorization: Bearer ${AccessToken}`

```bash
curl --request POST 'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer $access_token'
```

### userKey로 끊기
- **Method**: `POST`
- **URL**: `/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-user-key`
- **Body**: `{"userKey": 443731103}`

```bash
curl --request POST 'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-user-key' \
--header 'Content-Type: application/json' \
--data '{"userKey": 443731103}'
```

Success Response:
```json
{ "resultType": "SUCCESS", "success": { "userKey": 443731103 } }
```

**주의**: 하나의 userKey에 연결된 AccessToken이 많으면 readTimeout(3초) 발생 가능. 재시도하지 말고 일정 시간 후 재시도.

**서비스에서 직접 호출한 경우 콜백이 호출되지 않음.**

---

## 6. 복호화

### 알고리즘
- AES-256-GCM (대칭키)
- AAD: 콘솔에서 이메일로 전달받은 값 (UTF-8 평문)

### 데이터 구조
`Base64( IV[12바이트] + Ciphertext + AuthTag[16바이트] )`

### Node.js 구현

```typescript
import crypto from 'crypto';

function decryptUserInfo(encryptedText: string): string {
  const IV_LENGTH = 12;
  const decoded = Buffer.from(encryptedText, 'base64');
  const keyBuffer = Buffer.from(TOSS_DECRYPT_KEY, 'base64');
  const aadBuffer = Buffer.from(TOSS_DECRYPT_AAD); // UTF-8 평문

  const iv = decoded.subarray(0, IV_LENGTH);
  const ciphertextWithTag = decoded.subarray(IV_LENGTH);
  const authTag = ciphertextWithTag.subarray(ciphertextWithTag.length - 16);
  const ciphertext = ciphertextWithTag.subarray(0, ciphertextWithTag.length - 16);

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
  decipher.setAuthTag(authTag);
  decipher.setAAD(aadBuffer);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf-8');
}
```

---

## 7. 연동 해제 콜백

토스가 파트너 서버로 호출하는 웹훅.

### GET 방식
```
GET {callbackUrl}?userKey={userKey}&referrer={referrer}
```

### POST 방식
```json
POST {callbackUrl}
Content-Type: application/json
Body: {"userKey": 443731103, "referrer": "UNLINK"}
```

### Basic Auth 검증
- `Authorization: Basic {base64}` 헤더 포함
- base64 디코딩 후 콘솔에 입력한 값과 일치 확인

### referrer 값

| referrer | 경로 | 설명 |
|----------|------|------|
| `UNLINK` | 토스앱 > 설정 > 인증 및 보안 > 토스로 로그인한 서비스 > 연결 끊기 | 사용자가 직접 연결 끊음 |
| `WITHDRAWAL_TERMS` | 토스앱 > 설정 > 법적 정보 > 약관 및 개인정보 처리 동의 > 동의 철회 | 약관 동의 철회 |
| `WITHDRAWAL_TOSS` | - | 토스 회원 탈퇴 |

---

## 8. 콘솔 설정 가능한 Scope 항목

| 항목 | scope 값 | 설명 |
|------|----------|------|
| 이름 | USER_NAME | 사용자 이름 |
| 이메일 | USER_EMAIL | 이메일 (토스 가입 시 필수 아님, null 가능) |
| 성별 | USER_GENDER | MALE / FEMALE |
| 생일 | USER_BIRTHDAY | yyyyMMdd 형식 |
| 국적 | USER_NATIONALITY | LOCAL / FOREIGNER |
| 전화번호 | USER_PHONE | 휴대전화번호 |
| CI | USER_CI | 본인인증 고유 식별값 (PII, 암호화 필수) |

**주의**: 이름/이메일/성별 외 항목 선택 시 연결 끊기 콜백 정보 입력 필수.

---

## 9. 등록 가능한 약관 유형

| 유형 | 필수/선택 | 포함 내용 |
|------|----------|----------|
| 서비스 이용약관 | 필수 | 권리/의무, 책임, 중단/종료, 분쟁, 약관 변경, 결제/환불 |
| 개인정보 수집/이용 동의 | 필수 | 수집 항목, 이용 목적, 보유 기간, 거부 시 불이익 |
| 마케팅 정보 수신 동의 | 선택 | 수집 항목, 이용 목적, 보유 기간, 전자적 전송매체 광고 수신 |
| 야간 혜택 수신 동의 | 선택 | 야간(21:00~08:00) 발송 여부 명시 |

토스 로그인 필수 약관(서비스 약관, 개인정보 제3자 제공 동의)은 자동 포함.
파트너사 약관은 직접 등록. 약관 유형은 기본 예시 선택 또는 직접 입력 가능.

---

## 10. 트러블슈팅

### 로컬 개발 중 인증 에러
1. **인증 토큰 만료**: 새 토큰 발급 후 재시도
2. **개발자 로그인 안 됨**: 샌드박스 앱에서 개발자 계정 로그인 필요

### QA 체크리스트 (공식)

| 항목 | 확인 내용 |
|------|----------|
| 사전 체크 | 콘솔 계약/설정 승인 상태, 약관 링크 정상 작동 |
| 최초 로그인 | 인가 코드 수신 → 서버 교환 → 복호화/저장 → 홈 진입 |
| 재로그인 | 약관 동의 없이 인가 코드 즉시 수신, 정상 진입 |
| 토큰 만료 직전 | 자동 리프레시 성공, 실패 시 재로그인 요구 |
| 로그인 끊기 콜백 | 서버 토큰 즉시 폐기, 재진입 시 로그인 요구, 사용자 안내 |
| 네트워크 장애 | 지수 백오프/재시도, 안내 문구 노출, 복구 후 자동 재시도 |
