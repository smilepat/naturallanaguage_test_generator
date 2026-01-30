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
    filtered = filtered.filter((v) => v.curriculumGrade === criteria.vocabularyLevel);
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
export function generateProblems(criteria: SearchCriteria): GeneratedProblem[] {
  const filtered = filterVocabulary(criteria);

  if (filtered.length === 0) {
    // 조건에 맞는 어휘가 없으면 전체에서 선택
    const allPool = shuffleArray(vocabularyData).slice(0, criteria.count);
    return allPool.map((w) => generators[criteria.problemType](w, vocabularyData));
  }

  const selected = shuffleArray(filtered).slice(0, criteria.count);
  const generator = generators[criteria.problemType];

  return selected.map((word) => generator(word, vocabularyData));
}
