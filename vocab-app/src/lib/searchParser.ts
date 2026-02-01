import { CsatSearchCriteria } from "@/types/csat";

export async function parseCsatSearchQuery(query: string): Promise<CsatSearchCriteria> {
    const criteria: CsatSearchCriteria = {};
    const lower = query.toLowerCase();

    // 1. Year Extraction
    const yearMatch = query.match(/(\d{4})년?/);
    if (yearMatch) {
        criteria.exam_year = parseInt(yearMatch[1]);
    } else if (query.includes("작년")) {
        criteria.exam_year = new Date().getFullYear() - 1;
    } else if (query.includes("올해")) {
        criteria.exam_year = new Date().getFullYear();
    } else if (query.includes("재작년")) {
        criteria.exam_year = new Date().getFullYear() - 2;
    }

    // 2. Month/Exam Type Extraction
    if (query.includes("수능") || query.includes("수학능력시험")) {
        criteria.exam_type = "수능";
        criteria.exam_month = 11;
    } else if (query.includes("6월") || query.includes("6모")) {
        criteria.exam_month = 6;
        criteria.exam_type = "모의고사";
    } else if (query.includes("9월") || query.includes("9모")) {
        criteria.exam_month = 9;
        criteria.exam_type = "모의고사";
    } else if (query.includes("3월") || query.includes("3모")) {
        criteria.exam_month = 3;
        criteria.exam_type = "학력평가";
    } else if (query.includes("모의고사")) {
        criteria.exam_type = "모의고사";
    } else if (query.includes("학평") || query.includes("학력평가")) {
        criteria.exam_type = "학력평가";
    }

    // 3. Question Type
    if (query.includes("빈칸")) criteria.question_type = "빈칸추론";
    else if (query.includes("순서")) criteria.question_type = "순서배열";
    else if (query.includes("삽입") || query.includes("문장 넣기")) criteria.question_type = "문장삽입";
    else if (query.includes("어법") || query.includes("문법")) criteria.question_type = "어법";
    else if (query.includes("어휘")) criteria.question_type = "어휘";
    else if (query.includes("주제")) criteria.question_type = "주제";
    else if (query.includes("요지")) criteria.question_type = "요지";
    else if (query.includes("제목")) criteria.question_type = "제목";
    else if (query.includes("요약")) criteria.question_type = "요약문";

    // 4. Difficulty
    if (query.includes("3점") || query.includes("어려운") || query.includes("킬러") || query.includes("상")) {
        criteria.difficulty = "상";
    } else if (query.includes("2점") || query.includes("쉬운") || query.includes("하")) {
        criteria.difficulty = "하";
    } else if (query.includes("보통") || query.includes("중")) {
        criteria.difficulty = "중";
    }

    // 5. Count implies limit, default to 10 if not specified (though UI handles pagination usually)

    return criteria;
}
