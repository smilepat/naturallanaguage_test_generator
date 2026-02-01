import { CsatQuestion } from "@/types/csat";

export const MOCK_CSAT_QUESTIONS: CsatQuestion[] = [
    {
        id: "2024-11-31",
        exam_year: 2024,
        exam_month: 11,
        exam_type: "수능",
        question_number: 31,
        question_type: "빈칸추론",
        difficulty: "상",
        correct_rate: 34,
        passage: "Over the last decade the attention given to how children learn to read has foregrounded the nature of 'textuality'...",
        choices: [
            "the materiality of reading",
            "the visual modality",
            "digital literacy",
            "social interaction",
            "phonological awareness"
        ],
        answer: "1",
        explanation: "This question requires understanding the shift towards materiality in literacy studies."
    },
    {
        id: "2024-11-32",
        exam_year: 2024,
        exam_month: 11,
        exam_type: "수능",
        question_number: 32,
        question_type: "빈칸추론",
        difficulty: "상",
        correct_rate: 28,
        passage: "A musical score within any film can add an additional layer to the film text...",
        answer: "2",
    },
    {
        id: "2024-09-21",
        exam_year: 2024,
        exam_month: 9,
        exam_type: "모의고사",
        question_number: 21,
        question_type: "함축의미",
        difficulty: "중",
        passage: "The distinction between 'crafted' and 'art' is often blurred...",
        answer: "4"
    },
    {
        id: "2024-09-38",
        exam_year: 2024,
        exam_month: 9,
        exam_type: "모의고사",
        question_number: 38,
        question_type: "문장삽입",
        difficulty: "상",
        passage: "However, the capacity for attention is not infinite...",
        answer: "5"
    },
    {
        id: "2023-11-29",
        exam_year: 2023,
        exam_month: 11,
        exam_type: "수능",
        question_number: 29,
        question_type: "어법",
        difficulty: "중",
        passage: "From the perspective of 3D printing, however, the process is...",
        answer: "3"
    },
    {
        id: "2023-06-34",
        exam_year: 2023,
        exam_month: 6,
        exam_type: "모의고사",
        question_number: 34,
        question_type: "빈칸추론",
        difficulty: "상",
        passage: "Consider the task of identifying a particular face in a crowd...",
        answer: "1"
    }
];
