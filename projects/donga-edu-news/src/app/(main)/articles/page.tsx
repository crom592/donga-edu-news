import { ArticleCard } from '@/presentation/components/ArticleCard'
import { Pagination } from '@/presentation/components/Pagination'
import { articleRepository } from '@/data/repositories/PayloadArticleRepository'

export const revalidate = 60

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function ArticlesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page) || 1
  
  const articles = await articleRepository.findAll({ page, limit: 12 })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">전체 기사</h1>
      
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
            basePath="/articles"
          />
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">등록된 기사가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
