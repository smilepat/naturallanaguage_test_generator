export interface CsatSearchCriteria {
    exam_type?: string;   // 수능, 모의고사, 학력평가
    exam_year?: number;   // 2024, 2023...
    exam_month?: number;  // 6, 9, 11
    question_type?: string; // 빈칸추론, 순서배열, 등
    difficulty?: string;  // 상, 중, 하
    correct_rate_min?: number;
    correct_rate_max?: number;
    keywords?: string[];
    count?: number;
}

export interface CsatQuestion {
    id: string;
    exam_type: string;
    exam_year: number;
    exam_month: number;
    question_number: number;
    question_type: string;
    difficulty: "상" | "중" | "하";
    correct_rate?: number;
    passage: string;
    choices?: string[]; // If multiple choice
    answer: string;
    explanation?: string;
    tags?: string[];
}
