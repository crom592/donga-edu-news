import { notFound } from 'next/navigation'
import Link from 'next/link'
import { articleRepository } from '@/data/repositories/PayloadArticleRepository'
import { CategoryLabels, RegionLabels } from '@/domain/entities/Article'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = await articleRepository.findBySlug(slug)
  
  if (!article) return { title: '기사를 찾을 수 없습니다' }
  
  return {
    title: `${article.title} - 동아교육신문`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: new Date(article.publishedAt).toISOString(),
      ...(article.thumbnail && { images: [article.thumbnail.url] }),
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = await articleRepository.findBySlug(slug)
  
  if (!article) notFound()

  // 조회수 증가 (비동기, 에러 무시)
  articleRepository.incrementViewCount(article.id).catch(() => {})

  return (
    <article className="max-w-3xl mx-auto">
      {/* 메타 정보 */}
      <div className="flex gap-2 mb-4">
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
          {CategoryLabels[article.category]}
        </span>
        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
          {RegionLabels[article.region]}
        </span>
      </div>
      
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
        {article.title}
      </h1>
      
      {/* 작성자, 날짜 */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-4 border-b">
        <span>{article.author}</span>
        <span>•</span>
        <time dateTime={new Date(article.publishedAt).toISOString()}>
          {new Date(article.publishedAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </time>
        <span>•</span>
        <span>조회 {article.viewCount?.toLocaleString() || 0}</span>
      </div>
      
      {/* 썸네일 */}
      {article.thumbnail && (
        <figure className="mb-8">
          <img
            src={article.thumbnail.url}
            alt={article.thumbnail.alt || article.title}
            className="w-full rounded-lg"
          />
        </figure>
      )}
      
      {/* 요약 */}
      {article.summary && (
        <div className="bg-gray-50 border-l-4 border-blue-600 p-4 mb-8 text-gray-700 leading-relaxed">
          {article.summary}
        </div>
      )}
      
      {/* 본문 (Lexical rich text) */}
      <div className="prose prose-lg max-w-none">
        {/* TODO: Lexical rich text 렌더러 연결 */}
        <p className="text-gray-600">본문 렌더링은 Lexical 리치텍스트 렌더러 연결 후 표시됩니다.</p>
      </div>
      
      {/* 태그 */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
          {article.tags.map((tagItem: any, idx: number) => (
            <span
              key={idx}
              className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
            >
              #{typeof tagItem === 'string' ? tagItem : tagItem.tag}
            </span>
          ))}
        </div>
      )}
      
      {/* 뒤로가기 */}
      <div className="mt-8">
        <Link
          href="/articles"
          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          ← 기사 목록으로
        </Link>
      </div>
    </article>
  )
}
