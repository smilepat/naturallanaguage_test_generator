import fs from "fs";
import path from "path";
import { VocabularyItem } from "@/types";

let cachedData: VocabularyItem[] | null = null;

// CSV의 POS 약어 → 앱 내부 품사명 매핑
const posMap: Record<string, string> = {
  N: "noun",
  V: "verb",
  ADJ: "adjective",
  ADV: "adverb",
  PRON: "pronoun",
  PREP: "preposition",
  CONJ: "conjunction",
  DET: "article",
  INTJ: "interjection",
  NUM: "numeral",
};

function normalizePOS(raw: string): string {
  const upper = raw.trim().toUpperCase();
  return posMap[upper] || raw.trim().toLowerCase();
}

// grade_range("초3-초6")에서 개별 학년 목록 생성
function expandGradeRange(gradeRange: string): string[] {
  const grades: string[] = [];
  // "초3-초6" → ["초등3","초등4","초등5","초등6"]
  const match = gradeRange.match(/(초|중|고)(\d)\s*-\s*(?:초|중|고)(\d)/);
  if (match) {
    const prefix = match[1];
    const start = parseInt(match[2]);
    const end = parseInt(match[3]);
    const fullPrefix =
      prefix === "초" ? "초등" : prefix === "중" ? "중" : "고";
    for (let i = start; i <= end; i++) {
      grades.push(`${fullPrefix}${i}`);
    }
    return grades;
  }
  // "중1-중3" 등 단일 매칭
  const single = gradeRange.match(/(초등?|중|고)\s*(\d)/);
  if (single) {
    const fullPrefix =
      single[1].startsWith("초") ? "초등" : single[1] === "중" ? "중" : "고";
    grades.push(`${fullPrefix}${single[2]}`);
  }
  return grades.length > 0 ? grades : [gradeRange];
}

// TSV 파싱 (따옴표 내 탭/줄바꿈 처리 없이 단순 분리)
function parseTsvLine(line: string): string[] {
  return line.split("\t").map((cell) => cell.trim());
}

export function loadCsvVocabulary(): VocabularyItem[] {
  if (cachedData) return cachedData;

  const csvPath = path.join(
    process.cwd(),
    "src",
    "data",
    "9000word_full_db.csv"
  );

  if (!fs.existsSync(csvPath)) {
    console.warn("CSV 파일을 찾을 수 없습니다:", csvPath);
    return [];
  }

  const rawWithBom = fs.readFileSync(csvPath, "utf-8");
  const raw = rawWithBom.replace(/^\uFEFF/, ""); // BOM 제거
  const lines = raw.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  // 헤더에서 컬럼 인덱스 찾기
  const headers = parseTsvLine(lines[0]);
  const col = (name: string) => headers.indexOf(name);

  const iWord = col("word_display");
  const iPos = col("pos");
  const iMeaningKo = col("meaning_ko");
  const iDefEn = col("definition_en");
  const iSentence1 = col("sentence_1");
  const iSynonym = col("synonym");
  const iAntonym = col("antonym");
  const iCefr = col("cefr");
  const iGradeRange = col("grade_range");
  const iKrCurriculum = col("kr_curriculum");

  const data: VocabularyItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseTsvLine(lines[i]);
    if (cols.length < 10) continue;

    const word = cols[iWord] || "";
    if (!word) continue;

    const synonym = cols[iSynonym] || "";
    const antonym = cols[iAntonym] || "";
    const synonymsAntonyms = `${synonym} / ${antonym}`;

    const gradeRange = cols[iGradeRange] || "";
    const expandedGrades = expandGradeRange(gradeRange);

    data.push({
      word: word.charAt(0).toLowerCase() + word.slice(1), // 첫 글자 소문자 정규화
      partOfSpeech: normalizePOS(cols[iPos] || ""),
      koreanDefinition: cols[iMeaningKo] || "",
      englishDefinition: cols[iDefEn] || "",
      exampleSentence: cols[iSentence1] || "",
      synonymsAntonyms,
      cefrLevel: (cols[iCefr] || "").toUpperCase(),
      curriculumGrade: gradeRange,
      // 검색용 확장 학년 목록 (내부 사용)
      _grades: expandedGrades,
      _krCurriculum: cols[iKrCurriculum] || "",
    } as VocabularyItem & { _grades: string[]; _krCurriculum: string });
  }

  cachedData = data;
  console.log(`CSV 로드 완료: ${data.length}개 어휘`);
  return data;
}
