"use client";

import { useState } from "react";
import { GeneratedProblem } from "@/types";

interface Props {
  problems: GeneratedProblem[];
  onDelete: (id: string) => void;
}

export default function ProblemList({ problems, onDelete }: Props) {
  if (problems.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        조건에 맞는 문제가 없습니다. 다른 조건으로 시도해주세요.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {problems.map((problem, idx) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          index={idx + 1}
          onDelete={() => onDelete(problem.id)}
        />
      ))}
    </div>
  );
}

function ProblemCard({
  problem,
  index,
  onDelete,
}: {
  problem: GeneratedProblem;
  index: number;
  onDelete: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const isCorrect = selected === problem.correctAnswer;

  const choiceLabels = ["\u2460", "\u2461", "\u2462", "\u2463"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full">
            {index}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {problem.type}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 text-sm transition-colors cursor-pointer"
        >
          삭제
        </button>
      </div>

      {/* 문제 */}
      <div className="px-5 py-4">
        <p className="text-gray-900 whitespace-pre-line mb-4 leading-relaxed">
          {problem.question}
        </p>

        {/* 선택지 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {problem.choices.map((choice, i) => {
            const isThisCorrect = choice === problem.correctAnswer;
            const isSelected = selected === choice;

            let bgClass = "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50";
            if (selected) {
              if (isThisCorrect) {
                bgClass = "bg-green-50 border-green-400 text-green-800";
              } else if (isSelected && !isThisCorrect) {
                bgClass = "bg-red-50 border-red-300 text-red-700";
              } else {
                bgClass = "bg-gray-50 border-gray-200 opacity-60";
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (!selected) setSelected(choice);
                }}
                disabled={!!selected}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm text-left transition-all cursor-pointer disabled:cursor-default ${bgClass}`}
              >
                <span className="text-base opacity-60">{choiceLabels[i]}</span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>

        {/* 결과 표시 */}
        {selected && (
          <div
            className={`mt-3 px-4 py-2 rounded-lg text-sm ${
              isCorrect
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isCorrect ? "정답입니다!" : `오답! 정답: ${problem.correctAnswer}`}
          </div>
        )}

        {/* 해설 토글 */}
        <button
          type="button"
          onClick={() => setShowAnswer(!showAnswer)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
        >
          {showAnswer ? "해설 접기" : "해설 보기"}
        </button>

        {showAnswer && (
          <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800 whitespace-pre-line">
            {problem.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
