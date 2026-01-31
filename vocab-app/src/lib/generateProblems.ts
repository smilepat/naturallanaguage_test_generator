import { VocabularyItem, SearchCriteria, GeneratedProblem, ProblemType } from "@/types";
import { vocabularyData } from "@/data/vocabulary";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uid() {
  return Math.random().toString(36).substring(2, 10);
}

// 학년 문자열을 {단계, 번호} 형태로 정규화
// "초등5" → {stage:"초", num:5}, "중1" → {stage:"중", num:1}, "고2" → {stage:"고", num:2}
function parseGrade(s: string): { stage: string; num: number } | null {
  const m = s.match(/(초등?|중|고)\s*(\d)/);
  if (!m) return null;
  return { stage: m[1].startsWith("초") ? "초" : m[1], num: parseInt(m[2]) };
}

// CSV grade_range("초3-초6")에서 해당 학년이 포함되는지 확인
// vocabularyLevel: parseInput에서 추출한 값 (예: "초등5", "중1", "고2")
// curriculumGrade: CSV의 grade_range 값 (예: "초3-초6", "중1-중3", "고1-고3")
function matchesGradeRange(vocabularyLevel: string, curriculumGrade: string): boolean {
  if (!curriculumGrade) return false;

  const target = parseGrade(vocabularyLevel);
  if (!target) return false;

  // "초3-초6", "중1-중3" 같은 범위 형식
  const rangeMatch = curriculumGrade.match(/(초|중|고)(\d)\s*-\s*(?:초|중|고)(\d)/);
  if (rangeMatch) {
    const rangeStage = rangeMatch[1];
    const rangeStart = parseInt(rangeMatch[2]);
    const rangeEnd = parseInt(rangeMatch[3]);
    return target.stage === rangeStage && target.num >= rangeStart && target.num <= rangeEnd;
  }

  // 단일 학년 형식 "중1", "초등", "중등" 등
  const single = parseGrade(curriculumGrade);
  if (single) {
    return target.stage === single.stage && target.num === single.num;
  }

  // "초등", "중등", "고등" 등 단계만 있는 경우
  if (curriculumGrade.includes("초") && target.stage === "초") return true;
  if (curriculumGrade.includes("중") && target.stage === "중") return true;
  if (curriculumGrade.includes("고") && target.stage === "고") return true;

  return false;
}

// 검색 조건에 맞는 어휘 필터링
export function filterVocabulary(
  criteria: SearchCriteria,
  data: VocabularyItem[] = vocabularyData
): VocabularyItem[] {
  let filtered = [...data];

  if (criteria.cefrLevel) {
    filtered = filtered.filter((v) => v.cefrLevel === criteria.cefrLevel);
  }

  if (criteria.vocabularyLevel) {
    filtered = filtered.filter((v) =>
      matchesGradeRange(criteria.vocabularyLevel!, v.curriculumGrade)
    );
  }

  if (criteria.partOfSpeech && criteria.partOfSpeech.length > 0) {
    filtered = filtered.filter((v) =>
      criteria.partOfSpeech!.includes(v.partOfSpeech)
    );
  }

  if (criteria.excludeWords && criteria.excludeWords.length > 0) {
    const excl = criteria.excludeWords.map((w) => w.toLowerCase());
    filtered = filtered.filter((v) => !excl.includes(v.word.toLowerCase()));
  }

  // 난이도 필터: CEFR 기반 매핑 (쉬움=A1, 보통=A2, 어려움=B1+)
  if (criteria.difficulty) {
    const difficultyMap: Record<string, string[]> = {
      "쉬움": ["A1"],
      "보통": ["A2"],
      "어려움": ["B1", "B2", "C1", "C2"],
    };
    const allowedLevels = difficultyMap[criteria.difficulty];
    if (allowedLevels) {
      filtered = filtered.filter((v) => allowedLevels.includes(v.cefrLevel));
    }
  }

  return filtered;
}

// 오답 선택지 생성 (같은 품사에서 유사 단어 선택, 중복 제거)
function getDistractors(
  target: VocabularyItem,
  pool: VocabularyItem[],
  count: number,
  field: "koreanDefinition" | "word",
  excludeValues: string[] = []
): string[] {
  const targetValue = target[field];
  const excludeSet = new Set([targetValue, ...excludeValues]);
  const others = pool.filter((v) => v.word !== target.word && !excludeSet.has(v[field]));
  const samePOS = others.filter((v) => v.partOfSpeech === target.partOfSpeech);
  const source = samePOS.length >= count ? samePOS : others;
  const unique: string[] = [];
  for (const v of shuffleArray(source)) {
    if (!excludeSet.has(v[field]) && !unique.includes(v[field])) {
      unique.push(v[field]);
    }
    if (unique.length >= count) break;
  }
  return unique;
}

// 객관식: 단어 뜻 맞히기
function generateMultipleChoice(
  word: VocabularyItem,
  pool: VocabularyItem[]
): GeneratedProblem {
  const distractors = getDistractors(word, pool, 3, "koreanDefinition");
  const choices = shuffleArray([word.koreanDefinition, ...distractors]);
  return {
    id: uid(),
    type: "객관식",
    word: word.word,
    question: `다음 단어의 의미로 가장 적절한 것은?\n\n${word.word} (${word.partOfSpeech})`,
    choices,
    correctAnswer: word.koreanDefinition,
    explanation: `${word.word}: ${word.koreanDefinition}\n예문: ${word.exampleSentence}`,
  };
}

// 빈칸 채우기
function generateFillInBlank(
  word: VocabularyItem,
  pool: VocabularyItem[]
): GeneratedProblem {
  const sentence = word.exampleSentence.replace(
    new RegExp(`\\b${word.word}\\b`, "gi"),
    "________"
  );
  const distractors = getDistractors(word, pool, 3, "word");
  const choices = shuffleArray([word.word, ...distractors]);
  return {
    id: uid(),
    type: "빈칸채우기",
    word: word.word,
    question: `다음 빈칸에 들어갈 가장 적절한 단어는?\n\n${sentence}`,
    choices,
    correctAnswer: word.word,
    explanation: `정답: ${word.word} (${word.koreanDefinition})\n완성 문장: ${word.exampleSentence}`,
  };
}

// 영영풀이
function generateEngDefinition(
  word: VocabularyItem,
  pool: VocabularyItem[]
): GeneratedProblem {
  const distractors = getDistractors(word, pool, 3, "word");
  const choices = shuffleArray([word.word, ...distractors]);
  return {
    id: uid(),
    type: "영영풀이",
    word: word.word,
    question: `다음 영어 정의에 해당하는 단어는?\n\n"${word.englishDefinition}"`,
    choices,
    correctAnswer: word.word,
    explanation: `정답: ${word.word} (${word.koreanDefinition})`,
  };
}

// 동의어
function generateSynonym(
  word: VocabularyItem,
  pool: VocabularyItem[]
): GeneratedProblem {
  const synAnt = word.synonymsAntonyms;
  const synPart = synAnt.split("/")[0]?.trim() || "";
  const synonyms = synPart
    .replace(/\(.*?\)/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "-" && s.toLowerCase() !== "none" && s.toLowerCase() !== "null" && s.toLowerCase() !== "n/a");
  const correctSynonym = synonyms[0] || word.koreanDefinition;

  const distractors = getDistractors(word, pool, 3, "word", [correctSynonym]);
  const choices = shuffleArray([correctSynonym, ...distractors]);
  return {
    id: uid(),
    type: "동의어",
    word: word.word,
    question: `다음 단어와 의미가 가장 유사한 것은?\n\n${word.word}`,
    choices,
    correctAnswer: correctSynonym,
    explanation: `${word.word}의 동의어: ${synonyms.length > 0 ? synonyms.join(", ") : "(해당 없음)"}\n뜻: ${word.koreanDefinition}`,
  };
}

// 반의어
function generateAntonym(
  word: VocabularyItem,
  pool: VocabularyItem[]
): GeneratedProblem {
  const synAnt = word.synonymsAntonyms;
  const antPart = synAnt.split("/")[1]?.trim() || "";
  const antonyms = antPart
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s !== "-" && s.toLowerCase() !== "none" && s.toLowerCase() !== "null" && s.toLowerCase() !== "n/a");
  const correctAntonym = antonyms[0] || word.koreanDefinition;

  const distractors = getDistractors(word, pool, 3, "word", [correctAntonym]);
  const choices = shuffleArray([correctAntonym, ...distractors]);
  return {
    id: uid(),
    type: "반의어",
    word: word.word,
    question: `다음 단어와 의미가 반대인 것은?\n\n${word.word}`,
    choices,
    correctAnswer: correctAntonym,
    explanation: `${word.word}의 반의어: ${antonyms.length > 0 ? antonyms.join(", ") : "(해당 없음)"}\n뜻: ${word.koreanDefinition}`,
  };
}

// 철자 맞추기
function generateSpelling(
  word: VocabularyItem,
  pool: VocabularyItem[]
): GeneratedProblem {
  const w = word.word;
  // 일부 글자를 _로 대체
  const chars = w.split("");
  const hiddenCount = Math.max(1, Math.floor(chars.length * 0.4));
  const indices = shuffleArray(
    chars.map((_, i) => i).filter((i) => i > 0)
  ).slice(0, hiddenCount);
  const masked = chars.map((c, i) => (indices.includes(i) ? "_" : c)).join("");

  const distractors = getDistractors(word, pool, 3, "word");
  const choices = shuffleArray([w, ...distractors]);
  return {
    id: uid(),
    type: "철자맞추기",
    word: w,
    question: `다음 한글 뜻을 보고 올바른 철자의 단어를 고르세요.\n\n뜻: ${word.koreanDefinition}\n힌트: ${masked}`,
    choices,
    correctAnswer: w,
    explanation: `정답: ${w}\n뜻: ${word.koreanDefinition}`,
  };
}

// 유형별 생성 함수 매핑
const generators: Record<
  ProblemType,
  (word: VocabularyItem, pool: VocabularyItem[]) => GeneratedProblem
> = {
  객관식: generateMultipleChoice,
  빈칸채우기: generateFillInBlank,
  영영풀이: generateEngDefinition,
  동의어: generateSynonym,
  반의어: generateAntonym,
  철자맞추기: generateSpelling,
};

export interface GenerateResult {
  problems: GeneratedProblem[];
  warning?: string;
  filteredCount: number;
}

// 메인 문제 생성 함수
// csvData가 제공되면 CSV 데이터를 우선 사용, 없으면 내장 샘플 데이터 사용
export function generateProblems(
  criteria: SearchCriteria,
  csvData?: VocabularyItem[]
): GenerateResult {
  const allData = csvData && csvData.length > 0 ? csvData : vocabularyData;
  const filtered = filterVocabulary(criteria, allData);
  let warning: string | undefined;

  if (filtered.length === 0) {
    warning = "조건에 맞는 어휘가 없어 전체 어휘에서 무작위로 출제합니다.";
    const allPool = shuffleArray(allData).slice(0, criteria.count);
    const problems = allPool.map((w) => generators[criteria.problemType](w, allData));
    return { problems, warning, filteredCount: 0 };
  }

  if (filtered.length < criteria.count) {
    warning = `조건에 맞는 어휘가 ${filtered.length}개뿐이어서 ${filtered.length}개 문제만 생성합니다.`;
  }

  const selected = shuffleArray(filtered).slice(0, criteria.count);
  const generator = generators[criteria.problemType];
  const problems = selected.map((word) => generator(word, allData));

  return { problems, warning, filteredCount: filtered.length };
}
