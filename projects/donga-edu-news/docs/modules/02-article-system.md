# Module 02: 기사 시스템

## 목표
Article 엔티티 및 CRUD 기능 구현

## Domain Layer

### `src/domain/entities/Article.ts`
```typescript
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: Category;
  author: Author;
  thumbnail?: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  viewCount: number;
  status: 'draft' | 'published' | 'archived';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Author {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
```

### `src/domain/repositories/ArticleRepository.ts`
```typescript
export interface ArticleRepository {
  findById(id: string): Promise<Article | null>;
  findBySlug(slug: string): Promise<Article | null>;
  findAll(options?: FindOptions): Promise<PaginatedResult<Article>>;
  findByCategory(categoryId: string): Promise<Article[]>;
  save(article: Partial<Article>): Promise<Article>;
  delete(id: string): Promise<void>;
  incrementViewCount(id: string): Promise<void>;
}
```

## Data Layer

### `src/data/repositories/PayloadArticleRepository.ts`
```typescript
import { getPayloadClient } from '@/infrastructure/cms/payload';
import type { ArticleRepository } from '@/domain/repositories/ArticleRepository';

export class PayloadArticleRepository implements ArticleRepository {
  async findById(id: string) {
    const payload = await getPayloadClient();
    return payload.findByID({ collection: 'articles', id });
  }
  
  async findAll(options?: FindOptions) {
    const payload = await getPayloadClient();
    return payload.find({
      collection: 'articles',
      where: { status: { equals: 'published' } },
      sort: '-publishedAt',
      ...options,
    });
  }
  // ... 나머지 구현
}
```

## Payload Collection

### `payload/collections/Articles.ts`
```typescript
import { CollectionConfig } from 'payload/types';

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'richText' },
    { name: 'summary', type: 'textarea' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'author', type: 'relationship', relationTo: 'users' },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
    { name: 'status', type: 'select', options: ['draft', 'published', 'archived'] },
    { name: 'publishedAt', type: 'date' },
    { name: 'viewCount', type: 'number', defaultValue: 0 },
  ],
};
```

## Presentation Layer

### 페이지 구조
```
src/app/
├── (main)/
│   ├── page.tsx              # 홈 (최신 기사)
│   ├── articles/
│   │   ├── page.tsx          # 기사 목록
│   │   └── [slug]/page.tsx   # 기사 상세
│   └── category/
│       └── [slug]/page.tsx   # 카테고리별 기사
```

## 완료 기준
- [ ] Article 엔티티 정의
- [ ] Payload Collection 설정
- [ ] Repository 구현
- [ ] 기사 목록 페이지
- [ ] 기사 상세 페이지
- [ ] 카테고리 필터링
