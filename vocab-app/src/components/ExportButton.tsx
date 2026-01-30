"use client";

import { GeneratedProblem } from "@/types";

interface Props {
  problems: GeneratedProblem[];
}

export default function ExportButton({ problems }: Props) {
  const handleExportPDF = async () => {
    // 동적 import (클라이언트 전용)
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // 한글 지원을 위해 기본 폰트 사용 (한글이 깨질 수 있으므로 텍스트 파일도 제공)
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;
    const lineHeight = 7;
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;

    // 제목
    doc.setFontSize(16);
    doc.text("Vocabulary Quiz", pageWidth / 2, y, { align: "center" });
    y += 12;

    doc.setFontSize(10);
    doc.text(`Total: ${problems.length} questions`, pageWidth / 2, y, { align: "center" });
    y += 10;

    const choiceLabels = ["(A)", "(B)", "(C)", "(D)"];

    problems.forEach((p, idx) => {
      // 페이지 넘김 확인
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");

      // 문제 유형 표시
      const typeMap: Record<string, string> = {
        "객관식": "Multiple Choice",
        "빈칸채우기": "Fill in the Blank",
        "영영풀이": "English Definition",
        "동의어": "Synonym",
        "반의어": "Antonym",
        "철자맞추기": "Spelling",
      };

      doc.text(`Q${idx + 1}. [${typeMap[p.type] || p.type}]`, margin, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      // 문제 텍스트 - 줄바꿈 처리
      const questionLines = doc.splitTextToSize(p.question, maxWidth);
      questionLines.forEach((line: string) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin, y);
        y += lineHeight - 1;
      });
      y += 2;

      // 선택지
      p.choices.forEach((choice, i) => {
        if (y > 275) { doc.addPage(); y = 20; }
        const text = `  ${choiceLabels[i]} ${choice}`;
        doc.text(text, margin, y);
        y += lineHeight - 1;
      });

      y += 4;
    });

    // 정답지 페이지
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Answer Key", pageWidth / 2, y, { align: "center" });
    y += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    problems.forEach((p, idx) => {
      if (y > 275) { doc.addPage(); y = 20; }
      const ansIdx = p.choices.indexOf(p.correctAnswer);
      const label = choiceLabels[ansIdx] || "?";
      doc.text(`Q${idx + 1}: ${label} ${p.correctAnswer}`, margin, y);
      y += lineHeight;
    });

    doc.save("vocabulary-quiz.pdf");
  };

  const handleExportText = () => {
    const choiceLabels = ["\u2460", "\u2461", "\u2462", "\u2463"];
    let text = "===== \uc5b4\ud718 \ud559\uc2b5 \ubb38\uc81c =====\n\n";

    problems.forEach((p, idx) => {
      text += `[${idx + 1}] (${p.type})\n`;
      text += `${p.question}\n\n`;
      p.choices.forEach((c, i) => {
        text += `  ${choiceLabels[i]} ${c}\n`;
      });
      text += "\n";
    });

    text += "\n===== \uc815\ub2f5 \ubc0f \ud574\uc124 =====\n\n";
    problems.forEach((p, idx) => {
      const ansIdx = p.choices.indexOf(p.correctAnswer);
      text += `[${idx + 1}] ${choiceLabels[ansIdx]} ${p.correctAnswer}\n`;
      text += `    ${p.explanation}\n\n`;
    });

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vocabulary-quiz.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleExportPDF}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
      >
        PDF 다운로드
      </button>
      <button
        type="button"
        onClick={handleExportText}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      >
        텍스트 다운로드
      </button>
    </div>
  );
}
