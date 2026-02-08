import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">동아교육신문</h3>
            <p className="text-sm leading-relaxed">
              교육 현장의 생생한 소식을 전하는 동아교육신문입니다.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/articles" className="hover:text-white transition-colors">전체기사</Link></li>
              <li><Link href="/category/economy" className="hover:text-white transition-colors">경제</Link></li>
              <li><Link href="/category/society" className="hover:text-white transition-colors">사회</Link></li>
              <li><Link href="/category/culture" className="hover:text-white transition-colors">문화</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">문의</h4>
            <ul className="space-y-2 text-sm">
              <li>이메일: contact@donganews.co.kr</li>
              <li>전화: 02-XXX-XXXX</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} 동아교육신문. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
