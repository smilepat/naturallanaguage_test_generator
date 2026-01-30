import { NextResponse } from "next/server";
import { google } from "googleapis";
import { VocabularyItem } from "@/types";

const SPREADSHEET_ID = "1BqmmWUlgazMx1kvOWXm0QfPQfu64v1thEUCy8NY0SA4";
const RANGE = "Sheet1!A2:I"; // 헤더 제외

export async function GET() {
  try {
    // API 키가 설정된 경우 Google Sheets에서 데이터 가져오기
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Google Sheets API 키가 설정되지 않았습니다. 샘플 데이터를 사용합니다." },
        { status: 200 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth: apiKey });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const vocabulary: VocabularyItem[] = rows.map((row) => ({
      word: row[1] || "",
      partOfSpeech: row[2] || "",
      koreanDefinition: row[3] || "",
      englishDefinition: row[4] || "",
      exampleSentence: row[5] || "",
      synonymsAntonyms: row[6] || "",
      cefrLevel: row[7] || "",
      curriculumGrade: row[8] || "",
    }));

    return NextResponse.json({ data: vocabulary });
  } catch (error) {
    console.error("Google Sheets 연동 오류:", error);
    return NextResponse.json(
      { error: "Google Sheets 데이터를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
