"use client";

import { useState } from "react";

const EXAMPLE_PROMPTS = [
    "2024년 수능 빈칸추론 3점 문제 찾아줘",
    "작년 9월 모의고사 오답률 높은 순서삽입 문제",
    "2023년 고3 6월 학평 어법 문제",
    "최근 3년 수능 중에서 주제 찾기 문제만",
    "고2 11월 모의고사 요약문 완성 문제",
    "2022년 수능 난이도 상 빈칸 문제"
];

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    const performSearch = (searchText: string) => {
        if (!searchText.trim()) return;
        setQuery(searchText);
        setIsSearching(true);
        console.log("Searching for:", searchText);
        // TODO: Call API
        setTimeout(() => setIsSearching(false), 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b py-8 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">수능 영어 문항 검색</h1>
                    <p className="text-gray-500">원하는 문항의 조건(연도, 유형, 난이도 등)을 자연어로 입력하세요.</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative group">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="예: 작년 수능 빈칸추론 3점짜리 문제 보여줘"
                            className="w-full p-5 pl-6 text-lg border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none shadow-sm transition-all group-hover:border-gray-300"
                        />
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-8 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isSearching ? "검색 중..." : "검색"}
                        </button>
                    </div>
                </form>

                <div className="mb-12">
                    <p className="text-sm font-medium text-gray-500 mb-3 text-center">자주 묻는 질문 예시</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {EXAMPLE_PROMPTS.map((prompt) => (
                            <button
                                key={prompt}
                                onClick={() => performSearch(prompt)}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-full hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[300px] flex flex-col items-center justify-center text-center">
                    <div className="text-gray-400">
                        <p className="mb-2 text-lg">아직 검색 결과가 없습니다.</p>
                        <p className="text-sm">위 검색창에 찾고 싶은 문항을 입력해보세요.</p>
                    </div>
                </section>
            </main>
        </div>
    );
}
