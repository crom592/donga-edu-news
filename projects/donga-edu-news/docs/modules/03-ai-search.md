# Module 03: AI 검색 시스템

## 목표
OpenAI Embeddings 기반 시맨틱 검색 구현

## 아키텍처
```
[사용자 검색] → [Query Embedding] → [Vector DB 검색] → [결과 반환]
     ↓
[기사 저장] → [Content Embedding] → [Vector DB 저장]
```

## Infrastructure Layer

### `src/infrastructure/ai/embeddings.ts`
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

export async function generateArticleEmbedding(article: Article): Promise<number[]> {
  const text = `${article.title}\n${article.summary}\n${article.tags.join(' ')}`;
  return generateEmbedding(text);
}
```

### `src/infrastructure/ai/vectordb.ts`
```typescript
// Option 1: Pinecone
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index('donga-articles');

export async function upsertArticleVector(articleId: string, embedding: number[]) {
  await index.upsert([{ id: articleId, values: embedding }]);
}

export async function searchSimilar(queryEmbedding: number[], topK = 10) {
  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });
  return results.matches;
}
```

## Domain Layer

### `src/domain/usecases/SearchArticlesUseCase.ts`
```typescript
export class SearchArticlesUseCase {
  constructor(
    private articleRepo: ArticleRepository,
    private embeddingService: EmbeddingService,
    private vectorDb: VectorDbService,
  ) {}

  async execute(query: string): Promise<Article[]> {
    // 1. 쿼리 임베딩 생성
    const queryEmbedding = await this.embeddingService.generate(query);
    
    // 2. 유사 기사 검색
    const matches = await this.vectorDb.searchSimilar(queryEmbedding, 10);
    
    // 3. 기사 정보 조회
    const articleIds = matches.map(m => m.id);
    const articles = await this.articleRepo.findByIds(articleIds);
    
    // 4. 점수순 정렬
    return articles.sort((a, b) => {
      const scoreA = matches.find(m => m.id === a.id)?.score || 0;
      const scoreB = matches.find(m => m.id === b.id)?.score || 0;
      return scoreB - scoreA;
    });
  }
}
```

## Presentation Layer

### `src/app/search/page.tsx`
```typescript
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q;
  
  if (!query) {
    return <SearchForm />;
  }
  
  const articles = await searchArticles(query);
  
  return (
    <div>
      <SearchForm defaultValue={query} />
      <SearchResults articles={articles} query={query} />
    </div>
  );
}
```

### `src/presentation/components/SearchForm.tsx`
```typescript
'use client';

export function SearchForm({ defaultValue = '' }) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };
  
  return (
    <form onSubmit={handleSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="AI로 기사 검색..."
      />
      <button type="submit">검색</button>
    </form>
  );
}
```

## 완료 기준
- [ ] OpenAI Embeddings 연동
- [ ] Vector DB 설정 (Pinecone/pgvector)
- [ ] 기사 저장 시 자동 임베딩
- [ ] 시맨틱 검색 API
- [ ] 검색 UI/UX
- [ ] 검색 결과 하이라이팅
