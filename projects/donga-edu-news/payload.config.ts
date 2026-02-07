import { buildConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
      ],
    },
    {
      slug: 'articles',
      admin: {
        useAsTitle: 'title',
        defaultColumns: ['title', 'category', 'status', 'publishedAt'],
      },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'content', type: 'richText' },
        { name: 'summary', type: 'textarea' },
        { 
          name: 'category', 
          type: 'select',
          options: [
            { label: '경제', value: 'economy' },
            { label: '사회', value: 'society' },
            { label: '문화', value: 'culture' },
          ],
        },
        { 
          name: 'region', 
          type: 'select',
          options: [
            { label: '서울/경기', value: 'seoul-gyeonggi' },
            { label: '대전/충청/강원', value: 'daejeon-chungcheong' },
            { label: '광주/전라', value: 'gwangju-jeolla' },
            { label: '부산/경남', value: 'busan-gyeongnam' },
            { label: '대구/경북', value: 'daegu-gyeongbuk' },
          ],
        },
        { name: 'author', type: 'text' },
        { name: 'thumbnail', type: 'upload', relationTo: 'media' },
        { 
          name: 'tags', 
          type: 'array', 
          fields: [{ name: 'tag', type: 'text' }],
        },
        { 
          name: 'status', 
          type: 'select', 
          options: [
            { label: '초안', value: 'draft' },
            { label: '발행', value: 'published' },
            { label: '보관', value: 'archived' },
          ],
          defaultValue: 'draft',
        },
        { name: 'publishedAt', type: 'date' },
        { name: 'viewCount', type: 'number', defaultValue: 0 },
        { name: 'legacyId', type: 'number' }, // 마이그레이션용
      ],
    },
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(dirname, 'public/media'),
        mimeTypes: ['image/*'],
      },
      fields: [
        { name: 'alt', type: 'text' },
      ],
    },
    {
      slug: 'subscribers',
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        { name: 'email', type: 'email', required: true, unique: true },
        { name: 'name', type: 'text' },
        { 
          name: 'status', 
          type: 'select',
          options: [
            { label: '대기', value: 'pending' },
            { label: '활성', value: 'active' },
            { label: '해지', value: 'unsubscribed' },
          ],
          defaultValue: 'pending',
        },
        { name: 'subscribedAt', type: 'date' },
        { name: 'verificationToken', type: 'text' },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
})
