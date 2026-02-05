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
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selected === problem.correctAnswer;

  const choiceLabels = ["\u2460", "\u2461", "\u2462", "\u2463"];

  return (
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in shadow-sm hover:shadow-md transition-shadow">
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
        <p className="text-gray-900 whitespace-pre-line mb-4 leading-relaxed font-medium">
          {problem.question}
        </p>

        {/* 선택지 또는 텍스트 입력 */}
        {problem.choices && problem.choices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {problem.choices.map((choice, i) => {
              const isThisCorrect = choice === problem.correctAnswer;
              const isSelected = selected === choice;

              let bgClass =
                "bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50";
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
                  <span className="text-base opacity-60">
                    {choiceLabels[i]}
                  </span>
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && textAnswer.trim() && !isSubmitted) {
                  setIsSubmitted(true);
                }
              }}
              disabled={isSubmitted}
              placeholder="정답을 입력하세요"
              className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${isSubmitted
                ? textAnswer.trim().toLowerCase() ===
                  problem.correctAnswer.toLowerCase()
                  ? "border-green-500 bg-green-50 text-green-900" // 정답 시 스타일
                  : "border-red-500 bg-red-50 text-red-900" // 오답 시 스타일
                : "border-gray-300 focus:ring-blue-500 focus:border-transparent"
                }`}
            />
            <button
              onClick={() => setIsSubmitted(true)}
              disabled={!textAnswer.trim() || isSubmitted}
              className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${!textAnswer.trim() || isSubmitted
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                }`}
            >
              제출
            </button>
          </div>
        )}

        {/* 결과 표시 (선택형/단답형 공통) */}
        {(selected || isSubmitted) && (
          <div className="mt-4 flex items-center gap-3 animate-fade-in-up">
            <div
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${(selected === problem.correctAnswer) ||
                (isSubmitted &&
                  textAnswer.trim().toLowerCase() ===
                  problem.correctAnswer.toLowerCase())
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
                }`}
            >
              {(selected === problem.correctAnswer) ||
                (isSubmitted &&
                  textAnswer.trim().toLowerCase() ===
                  problem.correctAnswer.toLowerCase()) ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  정답입니다!
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  오답입니다! 정답: {problem.correctAnswer}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setIsSubmitted(false);
                setTextAnswer("");
                setShowAnswer(false);
              }}
              className="px-4 py-2.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              다시 풀기
            </button>
          </div>
        )}

        {/* 해설 토글 */}
        <button
          type="button"
          onClick={() => setShowAnswer(!showAnswer)}
          className="mt-3 text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors ml-auto"
        >
          {showAnswer ? "해설 접기" : "해설 보기"}
        </button>

        {showAnswer && (
          <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-200/50 rounded-lg text-sm text-amber-900 leading-relaxed animate-fade-in whitespace-pre-line">
            <div className="font-semibold mb-1 text-amber-700">📝 해설</div>
            {problem.explanation}
          </div>
        )}
      </div>
    </div>
  );
}
