# Module 01: 프로젝트 셋업

## 목표
Next.js 14 + Payload CMS 기반 프로젝트 초기 설정

## 작업 항목

### 1. Next.js 프로젝트 생성
```bash
npx create-next-app@latest donga-edu-news --typescript --tailwind --app --src-dir
```

### 2. Payload CMS 설치
```bash
cd donga-edu-news
npx create-payload-app@latest
# 또는
pnpm add payload @payloadcms/next @payloadcms/richtext-lexical
```

### 3. 폴더 구조 생성
```bash
mkdir -p src/{domain/{entities,usecases,repositories},data/{repositories,datasources,models},presentation/{components,hooks},infrastructure/{ai,email,cms}}
```

### 4. 기본 설정 파일

#### `payload.config.ts`
```typescript
import { buildConfig } from 'payload/config';

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  collections: [
    // Articles, Subscribers, Newsletters
  ],
  typescript: {
    outputFile: 'src/payload-types.ts',
  },
});
```

#### `.env.local`
```
DATABASE_URL=postgres://...
PAYLOAD_SECRET=your-secret
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

## 완료 기준
- [ ] 프로젝트 실행 가능 (`pnpm dev`)
- [ ] Payload Admin 접속 가능 (`/admin`)
- [ ] 폴더 구조 생성 완료
- [ ] 환경변수 설정 완료
