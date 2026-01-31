import { SearchCriteria, ProblemType } from "@/types";

// 자연어 입력을 파싱하여 검색 조건으로 변환
export function parseNaturalLanguage(input: string): SearchCriteria {
  const lower = input.toLowerCase();
  const korean = input;

  // 학년/수준 추출
  let vocabularyLevel: string | undefined;
  let cefrLevel: string | undefined;

  if (/초등\s*3|초3/.test(korean)) { vocabularyLevel = "초등3"; cefrLevel = "A1"; }
  else if (/초등\s*4|초4/.test(korean)) { vocabularyLevel = "초등4"; cefrLevel = "A1"; }
  else if (/초등\s*5|초5/.test(korean)) { vocabularyLevel = "초등5"; cefrLevel = "A1"; }
  else if (/초등\s*6|초6/.test(korean)) { vocabularyLevel = "초등6"; cefrLevel = "A1"; }
  else if (/초등/.test(korean)) { vocabularyLevel = "초등3"; cefrLevel = "A1"; }
  else if (/중\s*1|중학교?\s*1/.test(korean)) { vocabularyLevel = "중1"; cefrLevel = "A2"; }
  else if (/중\s*2|중학교?\s*2/.test(korean)) { vocabularyLevel = "중2"; cefrLevel = "A2"; }
  else if (/중\s*3|중학교?\s*3/.test(korean)) { vocabularyLevel = "중3"; cefrLevel = "A2"; }
  else if (/중학|중등/.test(korean)) { vocabularyLevel = "중1"; cefrLevel = "A2"; }
  else if (/고\s*1|고등학교?\s*1/.test(korean)) { vocabularyLevel = "고1"; cefrLevel = "B1"; }
  else if (/고\s*2|고등학교?\s*2/.test(korean)) { vocabularyLevel = "고2"; cefrLevel = "B1"; }
  else if (/고\s*3|고등학교?\s*3/.test(korean)) { vocabularyLevel = "고3"; cefrLevel = "B1"; }
  else if (/고등|고교/.test(korean)) { vocabularyLevel = "고1"; cefrLevel = "B1"; }

  // CEFR 직접 지정 시 우선
  const cefrMatch = lower.match(/(?:cefr\s*)?([abc][12])/i);
  if (cefrMatch) {
    cefrLevel = cefrMatch[1].toUpperCase();
  }

  // 품사 추출
  const partOfSpeech: string[] = [];
  if (/명사|noun/.test(lower)) partOfSpeech.push("noun");
  if (/동사|verb/.test(lower)) partOfSpeech.push("verb");
  if (/형용사|adjective/.test(lower)) partOfSpeech.push("adjective");
  if (/부사|adverb/.test(lower)) partOfSpeech.push("adverb");
  if (/대명사|pronoun/.test(lower)) partOfSpeech.push("pronoun");
  if (/전치사|preposition/.test(lower)) partOfSpeech.push("preposition");
  if (/접속사|conjunction/.test(lower)) partOfSpeech.push("conjunction");

  // 문제 유형 추출
  let problemType: ProblemType = "객관식";
  if (/빈칸|빈 칸|fill[\s-]?in|blank/.test(lower)) problemType = "빈칸채우기";
  else if (/영영|english[\s-]?definition/.test(lower)) problemType = "영영풀이";
  else if (/동의어|synonym/.test(lower)) problemType = "동의어";
  else if (/반의어|antonym/.test(lower)) problemType = "반의어";
  else if (/철자|spell/.test(lower)) problemType = "철자맞추기";

  // 문제 수 추출 (1~100 제한)
  let count = 10;
  const countMatch = korean.match(/(\d+)\s*(?:개|문제|문항|questions?)/);
  if (countMatch) {
    const parsed = parseInt(countMatch[1]);
    count = Math.min(Math.max(parsed, 1), 100);
  }

  // 제외 단어 추출
  const excludeWords: string[] = [];
  const excludeMatch = korean.match(/['"]([^'"]+)['"]\s*(?:은|는)?\s*(?:빼|제외)/g);
  if (excludeMatch) {
    excludeMatch.forEach((m) => {
      const w = m.match(/['"]([^'"]+)['"]/);
      if (w) excludeWords.push(w[1]);
    });
  }
  // 영어 패턴: exclude X, Y
  const excludeMatch2 = korean.match(/(?:빼고?|제외하고?)\s*/);
  if (excludeMatch2) {
    const before = korean.substring(0, korean.indexOf(excludeMatch2[0]));
    const words = before.match(/[a-zA-Z]+/g);
    if (words) {
      words.slice(-3).forEach((w) => excludeWords.push(w.toLowerCase()));
    }
  }

  // 난이도
  let difficulty: string | undefined;
  if (/쉬운|쉬움|easy/.test(lower)) difficulty = "쉬움";
  else if (/어려운|어려움|hard|difficult/.test(lower)) difficulty = "어려움";
  else if (/보통|중간|medium/.test(lower)) difficulty = "보통";

  return {
    vocabularyLevel,
    cefrLevel,
    partOfSpeech: partOfSpeech.length > 0 ? partOfSpeech : undefined,
    difficulty,
    problemType,
    count,
    excludeWords: excludeWords.length > 0 ? excludeWords : undefined,
  };
}
