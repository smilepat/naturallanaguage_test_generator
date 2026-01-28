# Product Requirements Document (PRD)
## 수능 영어 문항 자동 검색 시스템

### 1. 개요 (Overview)

**제품명**: 수능 영어 문항 AI 검색 시스템

**목적**: 영어 교사가 자연어로 입력한 문항 생성 지침을 LLM이 분석하여 구조화된 검색 조건으로 변환하고, 구글 시트의 수능 문항 마스터 테이블에서 적합한 문항을 자동으로 검색·제공

**대상 사용자**: 중·고등학교 영어 교사, 학원 강사, 교재 개발자

---

### 2. 배경 및 문제 정의 (Background & Problem Statement)

**현재 문제점**:
- 교사들이 수능 문항 데이터베이스에서 원하는 조건의 문항을 찾기 위해 복잡한 필터링 작업을 수동으로 수행
- 구조화된 검색 조건을 직접 입력해야 하는 어려움
- 자연어로 표현된 요구사항을 검색 가능한 형식으로 변환하는 과정의 비효율성

**해결 방안**:
LLM을 활용한 자연어 이해 및 구조화된 쿼리 생성 자동화

---

### 3. 목표 및 성공 지표 (Goals & Success Metrics)

**핵심 목표**:
1. 자연어 입력을 통한 직관적인 문항 검색 경험 제공
2. 검색 정확도 90% 이상 달성
3. 검색 시간 80% 단축 (기존 수동 검색 대비)

**성공 지표**:
- 사용자 만족도 4.5/5.0 이상
- 평균 검색 완료 시간 30초 이내
- 재검색률 20% 이하
- 일일 활성 사용자 증가율

---

### 4. 기능 요구사항 (Functional Requirements)

#### 4.1 핵심 기능

**F1. 자연어 입력 인터페이스**
- 교사가 자연어로 문항 생성 지침 입력
- 예시: "2024년 6월 모의고사에서 빈칸추론 문제 중 난이도가 높은 것 3개"
- 다국어 지원 (한국어, 영어)

**F2. LLM 기반 요소 추출**
- 입력된 자연어를 분석하여 다음 요소 추출:
  - 시험 유형 (수능, 모의고사, 학력평가 등)
  - 시험 연도 및 월
  - 문항 유형 (빈칸추론, 순서배열, 요지파악 등)
  - 난이도 (상/중/하 또는 오답률 범위)
  - 주제/주제어
  - 지문 길이
  - 개수
  - 기타 조건 (특정 문법 요소, 어휘 수준 등)

**F3. JSON 스키마 생성**
```json
{
  "exam_type": "모의고사",
  "exam_year": 2024,
  "exam_month": 6,
  "question_type": "빈칸추론",
  "difficulty": "상",
  "topic": null,
  "passage_length": null,
  "count": 3,
  "additional_filters": {}
}
```

**F4. 구글 시트 연동 및 검색**
- Google Sheets API를 통한 마스터 테이블 접근
- JSON 조건에 맞는 필터링 수행
- 결과 데이터 반환

**F5. 검색 결과 표시**
- 문항 목록 표시 (문항 번호, 유형, 난이도, 주제)
- 문항 미리보기 기능
- 문항 상세보기 (지문, 선택지, 정답, 해설)
- 결과 내보내기 (PDF, Word, 엑셀)

#### 4.2 부가 기능

**F6. 검색 히스토리**
- 이전 검색 기록 저장 및 재사용
- 즐겨찾기 기능

**F7. 검색 조건 수정**
- 추출된 JSON 검색 조건 확인 및 수정 기능
- 사용자 피드백을 통한 재검색

**F8. 배치 검색**
- 여러 조건을 한 번에 입력하여 복수의 검색 수행

---

### 5. 비기능 요구사항 (Non-Functional Requirements)

**성능**:
- LLM 응답 시간: 3초 이내
- 구글 시트 검색 시간: 2초 이내
- 전체 프로세스 완료: 10초 이내

**확장성**:
- 10,000개 이상의 문항 데이터 처리 가능
- 동시 사용자 100명 지원

**보안**:
- 구글 시트 접근 권한 관리
- 사용자 인증 (Google OAuth 2.0)
- 데이터 암호화 전송 (HTTPS)

**사용성**:
- 직관적인 UI/UX
- 모바일 반응형 디자인
- 접근성 표준 준수 (WCAG 2.1 AA)

**신뢰성**:
- 시스템 가용성 99.5% 이상
- 에러 발생 시 명확한 피드백 제공
- 자동 재시도 메커니즘

---

### 6. 기술 스택 (Tech Stack)

**프론트엔드**:
- React.js 또는 Next.js
- TypeScript
- Tailwind CSS 또는 Material-UI

**백엔드**:
- Node.js (Express) 또는 Python (FastAPI)
- LLM API: OpenAI GPT-4, Anthropic Claude, 또는 Google Gemini

**데이터베이스 및 저장소**:
- Google Sheets API (마스터 테이블)
- Firebase 또는 PostgreSQL (사용자 데이터, 검색 히스토리)

**인프라**:
- Vercel 또는 AWS/GCP
- CI/CD: GitHub Actions

**인증**:
- Google OAuth 2.0
- Firebase Authentication

---

### 7. 데이터 모델 (Data Model)

#### 7.1 구글 시트 마스터 테이블 스키마

| 컬럼명 | 데이터 타입 | 설명 |
|--------|------------|------|
| question_id | String | 문항 고유 ID |
| exam_type | String | 시험 유형 |
| exam_year | Integer | 시험 연도 |
| exam_month | Integer | 시험 월 |
| question_number | Integer | 문항 번호 |
| question_type | String | 문항 유형 |
| difficulty | String | 난이도 |
| correct_rate | Float | 정답률 |
| topic | String | 주제 |
| passage | Text | 지문 |
| choices | JSON | 선택지 |
| answer | String | 정답 |
| explanation | Text | 해설 |
| keywords | Array | 키워드 |
| passage_length | Integer | 지문 길이 |
| created_at | Timestamp | 생성일 |

#### 7.2 검색 요청 JSON 스키마

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "exam_type": {"type": "string"},
    "exam_year": {"type": "integer"},
    "exam_month": {"type": "integer"},
    "question_type": {"type": "string"},
    "difficulty": {"type": "string"},
    "correct_rate_min": {"type": "number"},
    "correct_rate_max": {"type": "number"},
    "topic": {"type": "string"},
    "keywords": {"type": "array", "items": {"type": "string"}},
    "passage_length_min": {"type": "integer"},
    "passage_length_max": {"type": "integer"},
    "count": {"type": "integer"},
    "sort_by": {"type": "string"},
    "sort_order": {"type": "string", "enum": ["asc", "desc"]}
  }
}
```

---

### 8. 사용자 스토리 (User Stories)

**US-1**: 교사로서, 자연어로 "2023년 수능 빈칸추론 문제 5개"라고 입력하면 해당 문항이 자동으로 검색되길 원한다.

**US-2**: 교사로서, 추출된 검색 조건을 확인하고 필요시 수정할 수 있기를 원한다.

**US-3**: 교사로서, 검색된 문항을 미리보기하고 선택하여 다운로드할 수 있기를 원한다.

**US-4**: 교사로서, 자주 사용하는 검색 조건을 저장하여 재사용하고 싶다.

**US-5**: 교사로서, 여러 조건을 한 번에 입력하여 다양한 문항 세트를 생성하고 싶다.

---

### 9. 워크플로우 (Workflow)

```
[사용자 입력]
    ↓
[자연어 텍스트]
    ↓
[LLM 분석 및 요소 추출]
    ↓
[JSON 스키마 생성]
    ↓
[사용자 확인 및 수정 (선택)]
    ↓
[Google Sheets API 호출]
    ↓
[필터링 및 검색]
    ↓
[결과 반환]
    ↓
[결과 표시 및 미리보기]
    ↓
[문항 선택 및 내보내기]
```

---

### 10. UI/UX 요구사항

**주요 화면**:

1. **검색 입력 화면**
   - 자연어 입력 텍스트 박스 (대형)
   - 예시 프롬프트 제공
   - 음성 입력 지원 (선택)

2. **검색 조건 확인 화면**
   - 추출된 JSON 조건 시각화
   - 각 조건별 수정 가능한 폼

3. **검색 결과 화면**
   - 카드 형식의 문항 목록
   - 필터 및 정렬 옵션
   - 페이지네이션

4. **문항 상세보기 화면**
   - 전체 지문 및 선택지
   - 정답 및 해설
   - 관련 문항 추천

---

### 11. 개발 단계 (Development Phases)

**Phase 1: MVP (4주)**
- 기본 자연어 입력 인터페이스
- LLM 통합 및 요소 추출
- 구글 시트 연동 및 기본 검색
- 간단한 결과 표시

**Phase 2: 핵심 기능 강화 (4주)**
- 검색 조건 수정 기능
- 문항 미리보기 및 상세보기
- 결과 내보내기 기능
- 사용자 인증

**Phase 3: 부가 기능 (4주)**
- 검색 히스토리 및 즐겨찾기
- 배치 검색
- 고급 필터링
- 성능 최적화

**Phase 4: 완성 및 배포 (2주)**
- 사용자 테스트 및 피드백 반영
- 버그 수정
- 문서화
- 배포

---

### 12. 리스크 및 대응 방안 (Risks & Mitigation)

| 리스크 | 영향도 | 대응 방안 |
|--------|--------|----------|
| LLM 요소 추출 정확도 부족 | 높음 | 프롬프트 엔지니어링 최적화, 사용자 피드백 학습, 검색 조건 수정 기능 제공 |
| 구글 시트 API 성능 이슈 | 중간 | 캐싱 전략, 데이터베이스 이관 검토 |
| 사용자 자연어 입력의 다양성 | 중간 | 예시 프롬프트 제공, 점진적 학습 |
| 데이터 보안 문제 | 높음 | OAuth 인증, 권한 관리, 암호화 |

---

### 13. 향후 확장 계획 (Future Enhancements)

- AI 기반 문항 자동 생성 기능
- 문항 난이도 자동 분석
- 학생 성취도 데이터 연동
- 맞춤형 문항 추천 시스템
- 다른 과목으로 확장

---

### 14. 참고 자료 (References)

- Google Sheets API Documentation
- OpenAI/Anthropic API Documentation
- 수능 출제 기준 및 유형 분류 체계
