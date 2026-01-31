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

// 학년 수준이 grade_range에 포함되는지 확인
// 예: vocabularyLevel="초등5", curriculumGrade="초3-초6" → true
function matchesGradeRange(vocabularyLevel: string, curriculumGrade: string): boolean {
  // 정확히 일치
  if (curriculumGrade === vocabularyLevel) return true;

  // _grades 확장 필드가 있으면 사용
  const item = curriculumGrade as string;

  // "초3-초6" 같은 범위 형식 파싱
  const rangeMatch = item.match(/(초|중|고)(\d)\s*-\s*(?:초|중|고)(\d)/);
  if (rangeMatch) {
    const prefix = rangeMatch[1];
    const start = parseInt(rangeMatch[2]);
    const end = parseInt(rangeMatch[3]);

    // vocabularyLevel에서 접두사와 숫자 추출
    const levelMatch = vocabularyLevel.match(/(초등?|중|고)(\d)/);
    if (levelMatch) {
      const levelPrefix = levelMatch[1].startsWith("초") ? "초" : levelMatch[1];
      const levelNum = parseInt(levelMatch[2]);
      if (levelPrefix === prefix && levelNum >= start && levelNum <= end) {
        return true;
      }
    }
  }

  // "초등" 키워드 포함 여부
  if (vocabularyLevel.startsWith("초등") && curriculumGrade.includes("초")) return true;
  if (vocabularyLevel.startsWith("중") && curriculumGrade.includes("중")) return true;
  if (vocabularyLevel.startsWith("고") && curriculumGrade.includes("고")) return true;

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

  return filtered;
}

// 오답 선택지 생성 (같은 품사에서 유사 단어 선택)
function getDistractors(
  target: VocabularyItem,
  pool: VocabularyItem[],
  count: number,
  field: "koreanDefinition" | "word"
): string[] {
  const others = pool.filter((v) => v.word !== target.word);
  const samePOS = others.filter((v) => v.partOfSpeech === target.partOfSpeech);
  const source = samePOS.length >= count ? samePOS : others;
  return shuffleArray(source)
    .slice(0, count)
    .map((v) => v[field]);
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
    .filter((s) => s && s !== "-");
  const correctSynonym = synonyms[0] || word.koreanDefinition;

  const distractors = getDistractors(word, pool, 3, "word");
  const choices = shuffleArray([correctSynonym, ...distractors]);
  return {
    id: uid(),
    type: "동의어",
    word: word.word,
    question: `다음 단어와 의미가 가장 유사한 것은?\n\n${word.word}`,
    choices,
    correctAnswer: correctSynonym,
    explanation: `${word.word}의 동의어: ${synonyms.join(", ")}\n뜻: ${word.koreanDefinition}`,
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
    .filter((s) => s && s !== "-");
  const correctAntonym = antonyms[0] || "없음";

  const distractors = getDistractors(word, pool, 3, "word");
  const choices = shuffleArray([correctAntonym, ...distractors]);
  return {
    id: uid(),
    type: "반의어",
    word: word.word,
    question: `다음 단어와 의미가 반대인 것은?\n\n${word.word}`,
    choices,
    correctAnswer: correctAntonym,
    explanation: `${word.word}의 반의어: ${antonyms.join(", ")}\n뜻: ${word.koreanDefinition}`,
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

// 메인 문제 생성 함수
// csvData가 제공되면 CSV 데이터를 우선 사용, 없으면 내장 샘플 데이터 사용
export function generateProblems(
  criteria: SearchCriteria,
  csvData?: VocabularyItem[]
): GeneratedProblem[] {
  const allData = csvData && csvData.length > 0 ? csvData : vocabularyData;
  const filtered = filterVocabulary(criteria, allData);

  if (filtered.length === 0) {
    // 조건에 맞는 어휘가 없으면 전체에서 선택
    const allPool = shuffleArray(allData).slice(0, criteria.count);
    return allPool.map((w) => generators[criteria.problemType](w, allData));
  }

  const selected = shuffleArray(filtered).slice(0, criteria.count);
  const generator = generators[criteria.problemType];

  return selected.map((word) => generator(word, allData));
}
