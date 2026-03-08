# 빠른 시작 가이드

## 사전 요구사항
- Node.js 20+
- npm 9+

## 단일 기능 예제 실행

```bash
cd with-rewarded-ad
npm install
npm run dev
# → http://localhost:5173 에서 확인
```

## 시나리오 예제 실행

```bash
cd scenario-attendance-reward
npm run install:all   # 클라이언트 + 서버 동시 설치
npm run dev           # 클라이언트(5173) + 서버(3001) 동시 실행
```

## 토스 앱에서 테스트

1. 앱인토스 개발자 콘솔에서 앱 등록
2. `granite.config.ts`의 `appName`을 콘솔의 앱 이름과 맞춤
3. `ait dev`로 개발 서버 실행
4. 토스 앱 → 개발자 도구 → 개발 서버 연결

참고: https://developers-apps-in-toss.toss.im/ads/develop.html

## 새 예제 만들기

```bash
# 단일 기능
cp -r _template with-my-feature

# 풀스택 시나리오
cp -r _scenario-template scenario-my-scenario
```

## 포트 충돌 시

각 시나리오 예제는 기본적으로 클라이언트 5173, 서버 3001 포트를 사용합니다.
동시에 여러 예제를 실행하려면 포트를 변경하세요:

```bash
# 서버 포트 변경
PORT=3002 npm run dev:server

# 클라이언트 포트 변경 (granite.config.ts의 web.port 수정)
```
