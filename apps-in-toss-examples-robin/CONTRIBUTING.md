# Contributing to AppsInToss Examples

감사합니다! 기여 방법을 안내합니다.

## 새 예제 추가

### 단일 기능 예제 (with-*)

1. `_template/`을 복사합니다:
   ```bash
   cp -r _template with-my-feature
   ```

2. 수정할 파일:
   - `package.json`: `name` 필드 변경
   - `granite.config.ts`: `appName`, `displayName` 변경
   - `src/hooks/useMyFeature.ts`: 핵심 훅 작성
   - `src/App.tsx`: DemoLayout으로 UI 구성
   - `README.md`: 예제 설명 작성

3. 확인 사항:
   - `npm run dev`로 웹 브라우저에서 동작 확인
   - 웹 환경 mock 동작 제공
   - TypeScript 타입 에러 없음

### 시나리오 예제 (scenario-*)

1. `_scenario-template/`을 복사합니다:
   ```bash
   cp -r _scenario-template scenario-my-scenario
   ```

2. 클라이언트 + 서버 모두 수정
3. `npm run install:all && npm run dev`로 동작 확인

## 코드 스타일

- TypeScript strict mode
- Tailwind CSS (인라인 스타일 지양)
- Zustand (상태 관리 필요 시)
- SDK 호출은 dynamic import + `isSupported()` 체크 필수
- `useEffect` cleanup 필수

## SDK API 참조

모든 SDK API 사용 시 공식 문서를 반드시 참조하세요:
- 기본 문서: https://developers-apps-in-toss.toss.im/llms.txt
- 전체 문서: https://developers-apps-in-toss.toss.im/llms-full.txt

## PR 규칙

- 하나의 PR에 하나의 예제
- 예제 README.md 포함
- `npm run dev` 정상 동작 확인
