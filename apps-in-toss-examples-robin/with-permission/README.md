# with-permission

AppsInToss SDK 2.0.1 권한 요청 예제

## 주요 기능

- **권한 상태 확인**: 카메라, 위치, 연락처 권한의 현재 상태를 확인
- **권한 요청**: 각 권한을 개별적으로 요청
- **전체 상태 확인**: 모든 권한 상태를 한 번에 조회
- **웹 폴백**: 토스 앱 외부에서는 Web API(navigator.permissions, getUserMedia, geolocation)로 대체

## SDK API

### Permission.check(type)

권한 상태를 확인합니다.

```typescript
const result = await Permission.check('camera');
// result.status: 'granted' | 'denied' | 'restricted' | 'unknown'
```

- `isSupported()`: 현재 환경에서 지원 여부 확인
- 지원 타입: `'camera'`, `'location'`, `'contacts'`

### Permission.request(type)

권한을 요청합니다. 시스템 권한 다이얼로그가 표시됩니다.

```typescript
const result = await Permission.request('camera');
// result.status: 'granted' | 'denied'
```

- `isSupported()`: 현재 환경에서 지원 여부 확인
- 이미 granted 상태이면 다이얼로그 없이 바로 반환

## 실행 방법

```bash
cd with-permission
npm install
npm run dev
```

## 파일 구조

```
with-permission/
├── src/
│   ├── App.tsx              # 메인 UI (권한 카드 목록)
│   ├── hooks/
│   │   └── usePermission.ts # 권한 확인/요청 훅
│   ├── components/
│   │   └── DemoLayout.tsx   # 공통 레이아웃
│   ├── lib/
│   │   └── environment.ts   # 환경 감지
│   └── stores/
│       └── eventLogStore.ts # 이벤트 로그
├── granite.config.ts
├── package.json
└── index.html
```
