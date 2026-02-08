import Link from 'next/link'
import { CategoryLabels, type Category } from '@/domain/entities/Article'

const categories = Object.entries(CategoryLabels) as [Category, string][]

export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* 상단 로고 */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-900">동아교육신문</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="text-gray-500 hover:text-blue-600 transition-colors"
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <Link
              href="/subscribe"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              뉴스레터 구독
            </Link>
          </div>
        </div>
        
        {/* 카테고리 네비게이션 */}
        <nav className="flex items-center gap-6 py-3 overflow-x-auto">
          <Link
            href="/articles"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap transition-colors"
          >
            전체기사
          </Link>
          {categories.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
