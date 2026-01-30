import { NextRequest, NextResponse } from "next/server";
import { parseNaturalLanguage } from "@/lib/parseInput";
import { generateProblems } from "@/lib/generateProblems";

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { error: "입력 텍스트가 필요합니다." },
        { status: 400 }
      );
    }

    // 1. 자연어 파싱 → 검색 조건
    const criteria = parseNaturalLanguage(input);

    // 2. 조건에 맞는 문제 생성
    const problems = generateProblems(criteria);

    return NextResponse.json({ criteria, problems });
  } catch (error) {
    console.error("문제 생성 오류:", error);
    return NextResponse.json(
      { error: "문제 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
