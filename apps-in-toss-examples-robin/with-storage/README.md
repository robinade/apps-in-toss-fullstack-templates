# with-storage

> 네이티브 스토리지 CRUD 예제

## 사용된 SDK API
- `Storage.setItem()` — 값 저장
- `Storage.getItem()` — 값 조회
- `Storage.removeItem()` — 값 삭제
- `Storage.clearItems()` — 전체 삭제

## 주요 기능
- 폼 자동 저장/복원
- CRUD 데모
- 웹 환경 localStorage fallback

## 실행 방법
```
npm install
npm run dev
```

## 핵심 코드
- `src/hooks/useStorage.ts` — 스토리지 훅
