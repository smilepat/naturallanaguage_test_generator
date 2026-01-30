// 어휘 데이터 타입
export interface VocabularyItem {
  word: string;
  partOfSpeech: string;
  koreanDefinition: string;
  englishDefinition: string;
  exampleSentence: string;
  synonymsAntonyms: string;
  cefrLevel: string;
  curriculumGrade: string;
}

// 자연어에서 추출된 검색 조건
export interface SearchCriteria {
  vocabularyLevel?: string;
  cefrLevel?: string;
  topic?: string;
  partOfSpeech?: string[];
  difficulty?: string;
  problemType: ProblemType;
  count: number;
  includeWords?: string[];
  excludeWords?: string[];
}

// 문제 유형
export type ProblemType =
  | "객관식"
  | "빈칸채우기"
  | "영영풀이"
  | "동의어"
  | "반의어"
  | "철자맞추기";

// 생성된 문제
export interface GeneratedProblem {
  id: string;
  type: ProblemType;
  word: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

// 앱 상태
export interface AppState {
  step: "input" | "loading" | "result";
  userInput: string;
  criteria: SearchCriteria | null;
  problems: GeneratedProblem[];
  setStep: (step: AppState["step"]) => void;
  setUserInput: (input: string) => void;
  setCriteria: (criteria: SearchCriteria | null) => void;
  setProblems: (problems: GeneratedProblem[]) => void;
  reset: () => void;
}
