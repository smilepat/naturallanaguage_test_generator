"use client";

import { useState } from "react";

const EXAMPLE_PROMPTS = [
  "초등 5학년 수준의 동사 10개로 객관식 문제 만들어줘",
  "중학교 1학년 수준의 형용사 15개로 빈칸 채우기 문제",
  "CEFR A2 레벨 어휘로 영영풀이 문제 10개",
  "중2 수준 어휘로 동의어 문제 8개 만들어줘",
  "고등학교 1학년 명사로 철자 맞추기 5문제",
  "초등6 어휘 중에서 반의어 문제 10개",
];

interface Props {
  onGenerate: (input: string) => void;
}

export default function InputSection({ onGenerate }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onGenerate(input.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* 히어로 */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          어떤 어휘 문제를 만들까요?
        </h2>
        <p className="text-gray-500">
          원하는 조건을 자연어로 입력하면 자동으로 문제를 생성합니다.
        </p>
      </div>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 중학교 2학년 수준의 명사 20개로 객관식 문제 만들어줘"
            className="w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 bg-transparent border-0 outline-none resize-none"
            rows={3}
          />
          <div className="flex justify-end px-2 pb-1">
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              문제 생성하기
            </button>
          </div>
        </div>
      </form>

      {/* 예시 프롬프트 */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-3 text-center">
          이런 식으로 입력해 보세요
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="text-left px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
