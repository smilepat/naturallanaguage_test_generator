import { NextRequest, NextResponse } from "next/server";
import { parseCsatSearchQuery } from "@/lib/searchParser";
import { MOCK_CSAT_QUESTIONS } from "@/data/csat_mock";
import { CsatQuestion, CsatSearchCriteria } from "@/types/csat";

export async function POST(request: NextRequest) {
    try {
        const { input } = await request.json();

        if (!input || typeof input !== "string") {
            return NextResponse.json(
                { error: "Query is required" },
                { status: 400 }
            );
        }

        // 1. Parse Query
        const criteria = await parseCsatSearchQuery(input);

        // 2. Filter Results (Mock)
        const results = filterQuestions(MOCK_CSAT_QUESTIONS, criteria);

        return NextResponse.json({
            criteria,
            results,
            count: results.length
        });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

function filterQuestions(questions: CsatQuestion[], criteria: CsatSearchCriteria): CsatQuestion[] {
    return questions.filter(q => {
        if (criteria.exam_year && q.exam_year !== criteria.exam_year) return false;
        if (criteria.exam_month && q.exam_month !== criteria.exam_month) return false;
        if (criteria.exam_type && q.exam_type !== criteria.exam_type) return false;
        // Partial Match for Question Type
        if (criteria.question_type && !q.question_type.includes(criteria.question_type)) return false;
        if (criteria.difficulty && q.difficulty !== criteria.difficulty) return false;

        return true;
    });
}
