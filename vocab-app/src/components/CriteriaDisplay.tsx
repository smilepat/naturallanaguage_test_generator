"use client";

import { SearchCriteria } from "@/types";

interface Props {
  criteria: SearchCriteria;
}

const LABELS: Record<string, string> = {
  vocabularyLevel: "학년 수준",
  cefrLevel: "CEFR 레벨",
  topic: "주제",
  partOfSpeech: "품사",
  difficulty: "난이도",
  problemType: "문제 유형",
  count: "문제 수",
  excludeWords: "제외 단어",
};

export default function CriteriaDisplay({ criteria }: Props) {
  const entries = Object.entries(criteria).filter(
    ([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-2">
      <h3 className="text-sm font-semibold text-gray-500 mb-3">
        추출된 검색 조건
      </h3>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, value]) => (
          <span
            key={key}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
          >
            <span className="font-medium">{LABELS[key] || key}:</span>
            <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
