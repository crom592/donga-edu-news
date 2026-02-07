# Module 05: 데이터 마이그레이션

## 목표
기존 PHP 사이트에서 12,800+ 기사 이전

## 마이그레이션 전략

### Phase 1: 데이터 추출
```
기존 DB → CSV/JSON 추출 → 데이터 정제 → Payload CMS Import
```

### Phase 2: 임베딩 생성
```
각 기사 → OpenAI Embedding → Vector DB 저장
```

### Phase 3: URL 리다이렉트
```
기존 URL (/article_view.php?id=XXX) → 새 URL (/articles/[slug])
```

---

## 데이터 추출 스크립트

### `scripts/extract-articles.ts`
```typescript
import mysql from 'mysql2/promise';
import fs from 'fs';

async function extractArticles() {
  const connection = await mysql.createConnection({
    host: process.env.LEGACY_DB_HOST,
    user: process.env.LEGACY_DB_USER,
    password: process.env.LEGACY_DB_PASSWORD,
    database: process.env.LEGACY_DB_NAME,
  });

  const [rows] = await connection.execute(`
    SELECT 
      id,
      title,
      content,
      category,
      region,
      author,
      created_at,
      view_count
    FROM articles
    ORDER BY id
  `);

  fs.writeFileSync(
    'data/legacy-articles.json',
    JSON.stringify(rows, null, 2)
  );

  console.log(`Extracted ${rows.length} articles`);
  await connection.end();
}
```

## 데이터 변환

### `scripts/transform-articles.ts`
```typescript
interface LegacyArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  region: string;
  author: string;
  created_at: string;
  view_count: number;
}

interface NewArticle {
  title: string;
  slug: string;
  content: any; // Lexical format
  summary: string;
  category: string;
  region: string;
  author: string;
  publishedAt: string;
  viewCount: number;
  legacyId: number; // 리다이렉트용
}

function transformArticle(legacy: LegacyArticle): NewArticle {
  return {
    title: legacy.title,
    slug: generateSlug(legacy.title, legacy.id),
    content: htmlToLexical(legacy.content),
    summary: generateSummary(legacy.content),
    category: mapCategory(legacy.category),
    region: mapRegion(legacy.region),
    author: legacy.author,
    publishedAt: legacy.created_at,
    viewCount: legacy.view_count,
    legacyId: legacy.id,
  };
}

function generateSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .replace(/[^가-힣a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  return `${base}-${id}`;
}
```

## Import to Payload

### `scripts/import-articles.ts`
```typescript
import { getPayloadClient } from '../src/infrastructure/cms/payload';

async function importArticles() {
  const payload = await getPayloadClient();
  const articles = JSON.parse(fs.readFileSync('data/transformed-articles.json', 'utf-8'));

  let imported = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      await payload.create({
        collection: 'articles',
        data: article,
      });
      imported++;
      
      if (imported % 100 === 0) {
        console.log(`Imported ${imported}/${articles.length}`);
      }
    } catch (error) {
      console.error(`Failed: ${article.legacyId}`, error);
      failed++;
    }
  }

  console.log(`Done! Imported: ${imported}, Failed: ${failed}`);
}
```

## 임베딩 생성

### `scripts/generate-embeddings.ts`
```typescript
async function generateEmbeddings() {
  const payload = await getPayloadClient();
  const { docs: articles } = await payload.find({
    collection: 'articles',
    where: { embedding: { exists: false } },
    limit: 100,
  });

  for (const article of articles) {
    const text = `${article.title}\n${article.summary}`;
    const embedding = await generateEmbedding(text);
    
    await payload.update({
      collection: 'articles',
      id: article.id,
      data: { embedding },
    });
    
    // Rate limit
    await sleep(100);
  }
}
```

## URL 리다이렉트

### `next.config.js`
```javascript
module.exports = {
  async redirects() {
    return [
      {
        source: '/article_view.php',
        has: [{ type: 'query', key: 'id', value: '(?<id>.*)' }],
        destination: '/redirect/:id',
        permanent: true,
      },
    ];
  },
};
```

### `src/app/redirect/[legacyId]/route.ts`
```typescript
export async function GET(
  request: Request,
  { params }: { params: { legacyId: string } }
) {
  const payload = await getPayloadClient();
  const { docs } = await payload.find({
    collection: 'articles',
    where: { legacyId: { equals: parseInt(params.legacyId) } },
  });

  if (docs.length === 0) {
    return NextResponse.redirect('/404');
  }

  return NextResponse.redirect(`/articles/${docs[0].slug}`, 301);
}
```

## 완료 기준
- [ ] 기존 DB 접근 권한 확보
- [ ] 데이터 추출 스크립트
- [ ] 데이터 변환 (HTML → Lexical)
- [ ] Payload Import
- [ ] 임베딩 생성 (12,800건)
- [ ] URL 리다이렉트 설정
- [ ] 이미지 마이그레이션

## 예상 소요 시간
- 추출/변환: 2시간
- Import: 4시간 (rate limit 고려)
- 임베딩: 6시간 (API rate limit)
- 테스트: 2시간
- **Total: ~14시간**
