import { VocabularyItem } from "@/types";
import vocabPackage from "@/data/vocab.json";

// 정본 어휘 data-package(efl-data-hub) 9-필드 subset 레코드 형태
interface VocabPackageRecord {
  word_display: string;
  pos: string;
  meaning_ko: string;
  definition_en: string;
  sentence_1: string;
  synonym: string;
  antonym: string;
  cefr: string;
  grade_range: string;
  kr_curriculum: string;
}

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
  INTERJ: "interjection",
  NUM: "numeral",
};

function normalizePOS(raw: string): string {
  const upper = (raw || "").trim().toUpperCase();
  return posMap[upper] || (raw || "").trim().toLowerCase();
}

// grade_range("초3-초6")에서 개별 학년 목록 생성 (검색 인덱스용)
function expandGradeRange(gradeRange: string): string[] {
  const grades: string[] = [];
  const match = gradeRange.match(/(초|중|고)(\d)\s*-\s*(?:초|중|고)(\d)/);
  if (match) {
    const prefix = match[1];
    const start = parseInt(match[2]);
    const end = parseInt(match[3]);
    const fullPrefix = prefix === "초" ? "초등" : prefix === "중" ? "중" : "고";
    for (let i = start; i <= end; i++) {
      grades.push(`${fullPrefix}${i}`);
    }
    return grades;
  }
  const single = gradeRange.match(/(초등?|중|고)\s*(\d)/);
  if (single) {
    const fullPrefix =
      single[1].startsWith("초") ? "초등" : single[1] === "중" ? "중" : "고";
    grades.push(`${fullPrefix}${single[2]}`);
  }
  return grades.length > 0 ? grades : [gradeRange];
}

// 정본 data-package(JSON) → VocabularyItem[]
// 데이터 출처: efl-data-hub/data-package/vocab/profiles/vocab-app.json
//   (정본 vocab-graph-db/9000word_full_db.csv@50ac6c1, 9,183단어)
export function loadVocabulary(): VocabularyItem[] {
  if (cachedData) return cachedData;

  const records = vocabPackage as unknown as VocabPackageRecord[];
  const data: VocabularyItem[] = [];

  for (const r of records) {
    const word = (r.word_display || "").trim();
    if (!word) continue;

    const synonym = r.synonym || "";
    const antonym = r.antonym || "";
    const gradeRange = r.grade_range || "";

    data.push({
      word: word.charAt(0).toLowerCase() + word.slice(1), // 첫 글자 소문자 정규화
      partOfSpeech: normalizePOS(r.pos),
      koreanDefinition: r.meaning_ko || "",
      englishDefinition: r.definition_en || "",
      exampleSentence: r.sentence_1 || "",
      synonymsAntonyms: `${synonym} / ${antonym}`,
      cefrLevel: (r.cefr || "").toUpperCase(),
      curriculumGrade: gradeRange,
      _grades: expandGradeRange(gradeRange),
      _krCurriculum: r.kr_curriculum || "",
    } as VocabularyItem & { _grades: string[]; _krCurriculum: string });
  }

  cachedData = data;
  console.log(`어휘 data-package 로드 완료: ${data.length}개 (정본 vocab-graph-db@50ac6c1)`);
  return data;
}

// 하위 호환 별칭 (구 loadCsvVocabulary 호출부 대응)
export const loadCsvVocabulary = loadVocabulary;
