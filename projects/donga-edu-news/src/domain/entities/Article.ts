export interface Article {
  id: string;
  title: string;
  slug: string;
  content: any; // Lexical rich text
  summary: string;
  category: Category;
  region: Region;
  author: string;
  thumbnail?: Media;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date;
  viewCount: number;
  legacyId?: number; // 마이그레이션용
  createdAt: Date;
  updatedAt: Date;
}

export type Category = 'economy' | 'society' | 'culture';

export type Region = 
  | 'seoul-gyeonggi'
  | 'daejeon-chungcheong'
  | 'gwangju-jeolla'
  | 'busan-gyeongnam'
  | 'daegu-gyeongbuk';

export interface Media {
  id: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export const CategoryLabels: Record<Category, string> = {
  economy: '경제',
  society: '사회',
  culture: '문화',
};

export const RegionLabels: Record<Region, string> = {
  'seoul-gyeonggi': '서울/경기',
  'daejeon-chungcheong': '대전/충청/강원',
  'gwangju-jeolla': '광주/전라',
  'busan-gyeongnam': '부산/경남',
  'daegu-gyeongbuk': '대구/경북',
};
