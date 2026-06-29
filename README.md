# 자연어 입력 문항 생성기

영어 교육을 위한 AI 기반 문항 검색 및 생성 시스템

## 프로젝트 개요

영어 교사가 자연어로 입력한 지침을 LLM이 분석하여 구조화된 검색 조건으로 변환하고, 구글 시트의 마스터 테이블에서 적합한 문항/어휘를 자동으로 검색·생성하는 시스템입니다.

### 1. 수능 영어 문항 AI 검색 시스템

구글 시트의 수능 문항 마스터 테이블에서 조건에 맞는 문항을 자동으로 검색

### 2. 어휘 문제 자동 생성 시스템

구글 시트의 어휘 마스터 테이블을 활용하여 다양한 유형의 어휘 문제를 자동으로 생성

## 주요 기능

### 공통 기능

- 자연어 입력을 통한 직관적인 문항/어휘 검색
- LLM 기반 검색 조건 자동 추출 및 JSON 변환
- 구글 시트 연동을 통한 데이터베이스 관리
- 검색 히스토리 및 템플릿 관리

### 수능 문항 검색 시스템

- 시험 유형, 연도, 난이도별 문항 검색
- 문항 미리보기 및 상세 정보 제공
- 다양한 형식으로 내보내기 (PDF, Word, Excel)

### 어휘 문제 생성 시스템

- 다양한 문제 유형 자동 생성 (객관식, 빈칸채우기, 영영풀이, 동의어/반의어 등)
- 오답 선택지 자동 생성
- 수준별 맞춤형 어휘 선택 (초등/중등/고등, CEFR 레벨)
- 생성된 문제 편집 및 재생성

## 기술 스택

- **Frontend**: React.js / Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js (Express) / Python (FastAPI)
- **LLM**: OpenAI GPT-4 / Anthropic Claude / Google Gemini
- **Database**: Google Sheets API, Firebase
- **Infrastructure**: Vercel / AWS / GCP

## 문서

- [수능 문항 검색 시스템 PRD](./PRD.md) - 수능 영어 문항 자동 검색 시스템 요구사항 문서
- [어휘 문제 생성 시스템 PRD](./PRD_Vocabulary.md) - 어휘 문제 자동 생성 시스템 요구사항 문서

## 개발 단계

- **Phase 1**: MVP 개발 (4주)
- **Phase 2**: 핵심 기능 강화 (4주)
- **Phase 3**: 부가 기능 (4주)
- **Phase 4**: 완성 및 배포 (2주)

## 현재 구현 상태 (2026-06)

이 README의 일부(LLM/Google Sheets 연동)는 **초기 기획(PRD) 비전**이다. 실제 동작하는 것은 **어휘 문제 생성기**(`vocab-app/`)다:

- **자연어 입력 → 룰 기반 파서**(`parseInput.ts`, 정규식): 학년·CEFR·품사·유형·개수 추출. (LLM 미사용)
- **6가지 문제 유형** 생성: 객관식·빈칸채우기·영영풀이·동의어·반의어·철자맞추기.
- **데이터 = 정본 어휘 data-package(9,183단어)** 번들. 출처 `efl-data-hub` (정본 `vocab-graph-db/9000word_full_db.csv@50ac6c1`). **API 키·외부 연동 불필요.**
- 수능 문항 검색(`search/`)은 룰 파서 + 목업 데이터(`csat_mock.ts`) 단계 — 실제 수능 DB 연결은 미완.

자세한 구조·실행·데이터 갱신은 [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) 참조.

## 시작하기

```bash
cd vocab-app
npm install
npm run dev   # http://localhost:3000
```

## 라이선스

TBD

## 기여

이슈 및 풀 리퀘스트를 환영합니다.
