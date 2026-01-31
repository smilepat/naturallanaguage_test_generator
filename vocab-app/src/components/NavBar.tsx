"use client";

import Link from 'next/link';

export default function NavBar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <span className="font-bold text-lg text-blue-600 mr-8">ClassPrep AI</span>
            <div className="flex space-x-4">
              <LinkLink href="/" label="어휘 생성기" />
              <LinkLink href="/search" label="수능 문항 검색" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function LinkLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">
      {label}
    </Link>
  );
}
