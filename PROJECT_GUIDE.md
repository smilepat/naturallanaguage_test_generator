# 어휘 문제 AI 생성기 - 프로젝트 가이드

## 생성된 프로젝트 구조

```
vocab-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.ts    # 문제 생성 API
│   │   │   └── sheets/route.ts      # Google Sheets 연동 API
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                 # 메인 페이지
│   ├── components/
│   │   ├── InputSection.tsx         # 자연어 입력 UI
│   │   ├── CriteriaDisplay.tsx      # 추출된 검색 조건 표시
│   │   ├── ProblemList.tsx          # 생성된 문제 목록 + 인터랙션
│   │   └── ExportButton.tsx         # PDF/텍스트 내보내기
│   ├── data/
│   │   └── vocabulary.ts            # Google Sheets 기반 샘플 어휘 85개
│   ├── lib/
│   │   ├── parseInput.ts            # 자연어 → 검색 조건 파싱
│   │   └── generateProblems.ts      # 6가지 유형 문제 생성 엔진
│   ├── store/
│   │   └── useAppStore.ts           # Zustand 상태 관리
│   └── types/
│       └── index.ts                 # TypeScript 타입 정의
```

## 주요 기능

| 기능 | 설명 |
|------|------|
| **자연어 입력** | "중2 수준 명사 20개 객관식" 같은 한국어 입력 지원 |
| **자동 파싱** | 학년, CEFR 레벨, 품사, 문제 유형, 개수 등 자동 추출 |
| **6가지 문제 유형** | 객관식, 빈칸채우기, 영영풀이, 동의어, 반의어, 철자맞추기 |
| **인터랙티브 풀기** | 선택지 클릭 시 정답/오답 즉시 표시 |
| **해설 보기** | 각 문제별 해설 토글 |
| **내보내기** | PDF (정답지 포함) + 텍스트 파일 다운로드 |
| **Google Sheets 연동** | API 키 설정 시 실시간 시트 데이터 연동 가능 |

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **Google Sheets**: googleapis
- **PDF 생성**: jsPDF

## 실행 방법

```bash
cd vocab-app
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## Google Sheets 연동 설정

1. Google Cloud Console에서 프로젝트 생성
2. Google Sheets API 활성화
3. API 키 발급
4. `vocab-app/.env.local` 파일 생성:

```
GOOGLE_SHEETS_API_KEY=your_api_key_here
```

5. Google Sheets를 "링크가 있는 모든 사용자 - 뷰어"로 공유 설정

API 키가 없으면 내장된 샘플 어휘 데이터(85개)로 동작합니다.

## 지원하는 자연어 입력 예시

- "초등 5학년 수준의 동사 10개로 객관식 문제 만들어줘"
- "중학교 1학년 수준의 형용사 15개로 빈칸 채우기 문제"
- "CEFR A2 레벨 어휘로 영영풀이 문제 10개"
- "중2 수준 어휘로 동의어 문제 8개 만들어줘"
- "고등학교 1학년 명사로 철자 맞추기 5문제"
- "초등6 어휘 중에서 반의어 문제 10개"

## 파싱 가능한 조건

| 조건 | 인식 키워드 |
|------|------------|
| 학년 | 초등3~6, 중1~3, 고1~3 |
| CEFR | A1, A2, B1, B2, C1, C2 |
| 품사 | 명사, 동사, 형용사, 부사, 대명사, 전치사, 접속사 |
| 문제 유형 | 객관식, 빈칸채우기, 영영풀이, 동의어, 반의어, 철자맞추기 |
| 난이도 | 쉬움, 보통, 어려움 |
| 문제 수 | 숫자 + "개/문제/문항" |
| 제외 단어 | "~빼고", "~제외하고" |
