import { Article, Category, Region } from '../entities/Article';

export interface FindArticlesOptions {
  category?: Category;
  region?: Region;
  status?: Article['status'];
  limit?: number;
  page?: number;
  sort?: 'publishedAt' | '-publishedAt' | 'viewCount' | '-viewCount';
}

export interface PaginatedResult<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ArticleRepository {
  findById(id: string): Promise<Article | null>;
  findBySlug(slug: string): Promise<Article | null>;
  findByLegacyId(legacyId: number): Promise<Article | null>;
  findAll(options?: FindArticlesOptions): Promise<PaginatedResult<Article>>;
  findByCategory(category: Category, options?: FindArticlesOptions): Promise<PaginatedResult<Article>>;
  findByRegion(region: Region, options?: FindArticlesOptions): Promise<PaginatedResult<Article>>;
  search(query: string, options?: FindArticlesOptions): Promise<PaginatedResult<Article>>;
  save(article: Partial<Article>): Promise<Article>;
  update(id: string, data: Partial<Article>): Promise<Article>;
  delete(id: string): Promise<void>;
  incrementViewCount(id: string): Promise<void>;
}
