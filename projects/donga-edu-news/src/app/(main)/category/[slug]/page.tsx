import { notFound } from 'next/navigation'
import { ArticleCard } from '@/presentation/components/ArticleCard'
import { Pagination } from '@/presentation/components/Pagination'
import { articleRepository } from '@/data/repositories/PayloadArticleRepository'
import { CategoryLabels, type Category } from '@/domain/entities/Article'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

const validCategories = Object.keys(CategoryLabels)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (!validCategories.includes(slug)) return { title: '카테고리를 찾을 수 없습니다' }
  
  const label = CategoryLabels[slug as Category]
  return {
    title: `${label} - 동아교육신문`,
    description: `동아교육신문 ${label} 카테고리 기사`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  
  if (!validCategories.includes(slug)) notFound()
  
  const category = slug as Category
  const label = CategoryLabels[category]
  const page = Number(resolvedSearchParams.page) || 1
  
  const articles = await articleRepository.findByCategory(category, { page, limit: 12 })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{label}</h1>
      <p className="text-gray-500 mb-8">동아교육신문 {label} 관련 기사</p>
      
      {articles.docs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.docs.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={articles.totalPages}
            basePath={`/category/${slug}`}
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">{label} 카테고리에 등록된 기사가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
