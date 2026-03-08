# scenario-template

> 풀스택 시나리오 예제 템플릿

## 구조

    scenario-template/
    ├── client/          # React + SDK 2.0.1
    │   ├── src/
    │   │   ├── App.tsx
    │   │   ├── hooks/
    │   │   ├── lib/api.ts
    │   │   └── components/
    │   └── granite.config.ts
    ├── server/          # Express + SQLite
    │   └── src/
    │       ├── index.ts
    │       ├── db.ts
    │       └── routes/
    └── package.json     # concurrently

## 실행

    npm run install:all
    npm run dev
    # → 클라이언트: http://localhost:5173
    # → 서버: http://localhost:3001
