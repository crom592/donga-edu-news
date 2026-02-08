import Link from 'next/link'
import { ArticleCard } from '@/presentation/components/ArticleCard'
import { articleRepository } from '@/data/repositories/PayloadArticleRepository'
import { CategoryLabels, type Category } from '@/domain/entities/Article'

export const revalidate = 60 // ISR: 60초마다 재검증

export default async function HomePage() {
  const latestArticles = await articleRepository.findAll({ limit: 6 })
  
  // 카테고리별 최신 기사
  const categoryArticles = await Promise.all(
    (Object.keys(CategoryLabels) as Category[]).map(async (category) => ({
      category,
      label: CategoryLabels[category],
      articles: await articleRepository.findByCategory(category, { limit: 4 }),
    }))
  )

  return (
    <div className="space-y-12">
      {/* 히어로 섹션 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">최신 기사</h2>
        {latestArticles.docs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.docs.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">아직 등록된 기사가 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">
              관리자 페이지(<Link href="/admin" className="text-blue-600 hover:underline">/admin</Link>)에서 기사를 추가해주세요.
            </p>
          </div>
        )}
        {latestArticles.docs.length > 0 && (
          <div className="text-center mt-6">
            <Link
              href="/articles"
              className="inline-block text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              전체 기사 보기 →
            </Link>
          </div>
        )}
      </section>

      {/* 카테고리별 섹션 */}
      {categoryArticles.map(({ category, label, articles }) => (
        articles.docs.length > 0 && (
          <section key={category}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{label}</h2>
              <Link
                href={`/category/${category}`}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                더보기 →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {articles.docs.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  )
}
