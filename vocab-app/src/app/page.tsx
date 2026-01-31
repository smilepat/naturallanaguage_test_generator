"use client";

import { useState } from "react";
import { SearchCriteria, GeneratedProblem } from "@/types";
import InputSection from "@/components/InputSection";
import CriteriaDisplay from "@/components/CriteriaDisplay";
import ProblemList from "@/components/ProblemList";
import ExportButton from "@/components/ExportButton";

type Step = "input" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [problems, setProblems] = useState<GeneratedProblem[]>([]);
  const [error, setError] = useState<string>("");
  const [warning, setWarning] = useState<string>("");

  const handleGenerate = async (input: string) => {
    setStep("loading");
    setError("");
    setWarning("");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || "문제 생성에 실패했습니다.");
      }

      const data = await res.json();
      setCriteria(data.criteria);
      setProblems(data.problems);
      if (data.warning) setWarning(data.warning);
      setStep("result");
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      } else {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      }
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setCriteria(null);
    setProblems([]);
    setError("");
    setWarning("");
  };

  const handleDeleteProblem = (id: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 결과 화면에서 새 문제 만들기 버튼 */}
      {step === "result" && (
        <div className="max-w-5xl mx-auto px-4 pt-4 flex justify-end">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
          >
            새 문제 만들기
          </button>
        </div>
      )}

      {/* 메인 */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* 입력 단계 */}
        {step === "input" && <InputSection onGenerate={handleGenerate} />}

        {/* 로딩 */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin-slow" />
            <p className="mt-4 text-gray-500 font-medium">
              문제를 생성하고 있습니다...
            </p>
          </div>
        )}

        {/* 결과 */}
        {step === "result" && (
          <div className="animate-fade-in space-y-6">
            {warning && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                {warning}
              </div>
            )}

            {criteria && <CriteriaDisplay criteria={criteria} />}

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                생성된 문제 ({problems.length}개)
              </h2>
              <ExportButton problems={problems} />
            </div>

            <ProblemList
              problems={problems}
              onDelete={handleDeleteProblem}
            />
          </div>
        )}
      </main>
    </div>
  );
}
