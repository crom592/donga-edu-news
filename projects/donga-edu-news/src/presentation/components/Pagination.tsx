import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    return start + i
  })

  return (
    <nav className="flex justify-center items-center gap-2 mt-12" aria-label="페이지네이션">
      {currentPage > 1 && (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border rounded-lg hover:border-blue-300 transition-colors"
        >
          이전
        </Link>
      )}
      
      {pages.map((page) => (
        <Link
          key={page}
          href={`${basePath}?page=${page}`}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:text-blue-600 border hover:border-blue-300'
          }`}
        >
          {page}
        </Link>
      ))}
      
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 border rounded-lg hover:border-blue-300 transition-colors"
        >
          다음
        </Link>
      )}
    </nav>
  )
}
