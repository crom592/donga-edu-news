import Link from 'next/link';
import { Article, CategoryLabels, RegionLabels } from '@/domain/entities/Article';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {article.thumbnail && (
        <Link href={`/articles/${article.slug}`}>
          <img
            src={article.thumbnail.url}
            alt={article.thumbnail.alt || article.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}
      <div className="p-4">
        <div className="flex gap-2 mb-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {CategoryLabels[article.category]}
          </span>
          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
            {RegionLabels[article.region]}
          </span>
        </div>
        <Link href={`/articles/${article.slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {article.summary}
        </p>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <span>{article.author}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>
    </article>
  );
}
