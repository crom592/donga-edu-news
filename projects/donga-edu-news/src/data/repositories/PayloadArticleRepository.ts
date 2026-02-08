import { getPayloadClient } from '@/infrastructure/cms/payload'
import type { ArticleRepository, FindArticlesOptions, PaginatedResult } from '@/domain/repositories/ArticleRepository'
import type { Article, Category, Region } from '@/domain/entities/Article'
import type { Where } from 'payload'

export class PayloadArticleRepository implements ArticleRepository {
  private buildWhere(options?: FindArticlesOptions): Where {
    const conditions: Where[] = []
    
    if (options?.status) {
      conditions.push({ status: { equals: options.status } })
    } else {
      conditions.push({ status: { equals: 'published' } })
    }
    
    if (options?.category) {
      conditions.push({ category: { equals: options.category } })
    }
    
    if (options?.region) {
      conditions.push({ region: { equals: options.region } })
    }
    
    return conditions.length > 1 ? { and: conditions } : conditions[0] || {}
  }

  async findById(id: string): Promise<Article | null> {
    try {
      const payload = await getPayloadClient()
      const result = await payload.findByID({ collection: 'articles', id })
      return result as unknown as Article
    } catch {
      return null
    }
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'articles',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    return (result.docs[0] as unknown as Article) || null
  }

  async findByLegacyId(legacyId: number): Promise<Article | null> {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'articles',
      where: { legacyId: { equals: legacyId } },
      limit: 1,
    })
    return (result.docs[0] as unknown as Article) || null
  }

  async findAll(options?: FindArticlesOptions): Promise<PaginatedResult<Article>> {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'articles',
      where: this.buildWhere(options),
      sort: options?.sort || '-publishedAt',
      limit: options?.limit || 12,
      page: options?.page || 1,
    })
    
    return {
      docs: result.docs as unknown as Article[],
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page || 1,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  }

  async findByCategory(category: Category, options?: FindArticlesOptions): Promise<PaginatedResult<Article>> {
    return this.findAll({ ...options, category })
  }

  async findByRegion(region: Region, options?: FindArticlesOptions): Promise<PaginatedResult<Article>> {
    return this.findAll({ ...options, region })
  }

  async search(query: string, options?: FindArticlesOptions): Promise<PaginatedResult<Article>> {
    const payload = await getPayloadClient()
    const where: Where = {
      and: [
        { status: { equals: options?.status || 'published' } },
        {
          or: [
            { title: { contains: query } },
            { summary: { contains: query } },
            { content: { contains: query } },
          ],
        },
      ],
    }
    
    const result = await payload.find({
      collection: 'articles',
      where,
      sort: options?.sort || '-publishedAt',
      limit: options?.limit || 12,
      page: options?.page || 1,
    })
    
    return {
      docs: result.docs as unknown as Article[],
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page || 1,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  }

  async save(article: Partial<Article>): Promise<Article> {
    const payload = await getPayloadClient()
    const result = await payload.create({
      collection: 'articles',
      data: article as any,
    })
    return result as unknown as Article
  }

  async update(id: string, data: Partial<Article>): Promise<Article> {
    const payload = await getPayloadClient()
    const result = await payload.update({
      collection: 'articles',
      id,
      data: data as any,
    })
    return result as unknown as Article
  }

  async delete(id: string): Promise<void> {
    const payload = await getPayloadClient()
    await payload.delete({ collection: 'articles', id })
  }

  async incrementViewCount(id: string): Promise<void> {
    const payload = await getPayloadClient()
    const article = await payload.findByID({ collection: 'articles', id })
    await payload.update({
      collection: 'articles',
      id,
      data: { viewCount: ((article as any).viewCount || 0) + 1 },
    })
  }
}

// Singleton
export const articleRepository = new PayloadArticleRepository()
