import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguage } from "@/lib/parseInput";
import { generateProblems } from "@/lib/generateProblems";
import { loadCsvVocabulary } from "@/lib/loadCsvData";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "입력 텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    // 1. CSV 데이터 로드
    const csvData = loadCsvVocabulary();

    // 2. 자연어 파싱 → 검색 조건
    const criteria = parseNaturalLanguage(input);

    // 3. 조건에 맞는 문제 생성 (CSV 데이터 우선 사용)
    const problems = generateProblems(criteria, csvData);

    return NextResponse.json({
      criteria,
      problems,
      dataSource: csvData.length > 0 ? `CSV (${csvData.length}개 어휘)` : "샘플 데이터",
    });
  } catch (error) {
    console.error("문제 생성 오류:", error);
    return NextResponse.json(
      { error: "문제 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
