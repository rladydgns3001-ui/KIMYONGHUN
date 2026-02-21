import type { AnalysisType } from '../../shared/types'
import {
  marketAnalysisSchema,
  customerAnalysisSchema,
  competitionAnalysisSchema,
  revenueAnalysisSchema,
  financialAnalysisSchema,
  roadmapAnalysisSchema,
  swotAnalysisSchema,
  riskAnalysisSchema
} from '../../shared/schemas'
import type { z } from 'zod'

function zodToJsonDescription(schema: z.ZodObject<z.ZodRawShape>): string {
  return JSON.stringify(schema.shape, null, 2).substring(0, 500) + '...'
}

const SYSTEM_PROMPT = `당신은 사업 분석 전문가입니다. 한국 시장을 기준으로 실용적이고 현실적인 분석을 제공합니다.
모든 응답은 반드시 요청된 JSON 스키마에 맞춰 한국어로 작성하세요.
금액은 한국 원화(원) 기준으로 작성하세요.
구체적인 수치와 근거를 포함하세요.`

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT
}

export function getAnalysisPrompt(
  type: AnalysisType,
  idea: string,
  previousResults?: Record<string, unknown>
): string {
  const contextStr = previousResults
    ? `\n\n이전 분석 결과 (참고하여 일관성 있는 분석을 제공하세요):\n${JSON.stringify(previousResults, null, 2)}`
    : ''

  const prompts: Record<AnalysisType, string> = {
    market: `다음 사업 아이디어에 대한 시장 분석을 수행하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 시장 적합성 점수 (0-100점, 근거 포함)
2. 시장 규모: TAM(전체시장), SAM(유효시장), SOM(수익가능시장) - 각각 금액과 산출 근거
3. 주요 시장 트렌드 (3-5개, 각 트렌드의 영향 방향 포함)
4. 전체 요약`,

    customer: `다음 사업 아이디어에 대한 타겟 고객 분석을 수행하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 주요 페르소나 (이름, 연령대, 직업, 소득, 고충점, 목표, 행동패턴)
2. 보조 페르소나 (2-3개)
3. 인구통계학적 특성
4. 심리통계학적 특성
5. 고객 획득 비용 예상 및 채널별 분석
6. 전체 요약`,

    competition: `다음 사업 아이디어에 대한 경쟁 분석을 수행하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 직접 경쟁자 (3-5개, 각 강점/약점/시장점유율/가격)
2. 간접 경쟁자 (2-3개, 위협 수준)
3. 포지셔닝 맵 (X축/Y축 기준, 우리 위치, 경쟁자 위치)
4. 차별화 전략 (3-5개, 실현 가능성)
5. 전체 요약`,

    revenue: `다음 사업 아이디어에 대한 수익 모델을 분석하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 주요 수익 모델 (유형, 설명, 가격 티어)
2. 보조 수익 모델 (2-3개)
3. 가격 전략 (접근법, 근거, 경쟁사 비교)
4. 수익화 타임라인 (단계별)
5. 전체 요약`,

    financial: `다음 사업 아이디어에 대한 재무 전망을 수행하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 초기 투자 (총액 및 항목별 내역)
2. 월 고정/변동 비용
3. 12개월 매출/비용/손익 추정 (월별 숫자)
4. 손익분기점 예상
5. 핵심 지표 (LTV, CAC, LTV/CAC 비율, 매출총이익률)
6. 전체 요약`,

    roadmap: `다음 사업 아이디어에 대한 실행 로드맵을 작성하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 단계별 계획 (각 단계: 기간, 목표, 마일스톤, 필요 리소스)
2. 팀 구성 (역할, 인원, 채용 시기, 핵심 역량)
3. Quick Win 항목 (즉시 실행 가능, 영향도 높은 액션)
4. 주요 의존성
5. 전체 요약`,

    swot: `다음 사업 아이디어에 대한 SWOT 분석을 수행하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 강점 (3-5개, 각 활용 전략)
2. 약점 (3-5개, 각 보완 전략)
3. 기회 (3-5개, 각 포착 전략)
4. 위협 (3-5개, 각 방어 전략)
5. SWOT 교차 분석 (SO, WO, ST, WT 전략)
6. 전체 요약`,

    risk: `다음 사업 아이디어에 대한 리스크 평가를 수행하세요.

사업 아이디어: ${idea}
${contextStr}

분석 항목:
1. 리스크 목록 (각 리스크: 카테고리, 발생확률(1-5), 영향도(1-5), 리스크점수, 완화계획, 대응계획)
2. 전체 리스크 수준
3. Go/No-Go 판단 (결정, 근거, 조건)
4. 리스크 완화 우선순위
5. 전체 요약`
  }

  return prompts[type]
}

export function getAnalysisSchema(type: AnalysisType) {
  const schemas: Record<AnalysisType, z.ZodObject<z.ZodRawShape>> = {
    market: marketAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    customer: customerAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    competition: competitionAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    revenue: revenueAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    financial: financialAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    roadmap: roadmapAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    swot: swotAnalysisSchema as z.ZodObject<z.ZodRawShape>,
    risk: riskAnalysisSchema as z.ZodObject<z.ZodRawShape>
  }
  return schemas[type]
}

export function getBrainstormPrompt(idea: string): string {
  return `사용자가 다음과 같은 아이디어/키워드를 입력했습니다:

"${idea}"

이를 바탕으로 5개의 구체적인 사업 아이디어로 확장하세요.
각 아이디어는:
- 명확한 제목
- 상세한 설명 (2-3문장)
- 타겟 시장
- 고유한 가치 제안

을 포함해야 합니다.`
}

export function getDailyTaskPrompt(
  date: string,
  projects: { id: number; title: string; description: string; analyses: string[] }[],
  completedTasks: { title: string; project_title: string }[],
  pendingTasks: { title: string; project_title: string }[]
): string {
  const projectContext = projects.map((p) => {
    const analysisStr = p.analyses.length > 0
      ? `완료된 분석: ${p.analyses.join(', ')}`
      : '분석 미완료'
    return `- "${p.title}": ${p.description} (${analysisStr})`
  }).join('\n')

  const completedStr = completedTasks.length > 0
    ? `\n최근 완료한 과제:\n${completedTasks.map((t) => `- [${t.project_title}] ${t.title}`).join('\n')}`
    : ''

  const pendingStr = pendingTasks.length > 0
    ? `\n아직 미완료인 과제:\n${pendingTasks.map((t) => `- [${t.project_title}] ${t.title}`).join('\n')}`
    : ''

  return `오늘 날짜: ${date}

현재 진행 중인 프로젝트:
${projectContext}
${completedStr}
${pendingStr}

위 프로젝트들의 분석 결과와 진행 상황을 바탕으로, 오늘(${date}) 해야 할 구체적인 실행 과제를 생성하세요.

규칙:
1. 각 프로젝트별로 1-3개의 과제를 생성하세요
2. 과제는 구체적이고 실행 가능해야 합니다 (예: "시장 조사하기" ❌ → "네이버 카페에서 타겟 고객 10명에게 설문 작성하기" ✅)
3. 우선순위(high/medium/low)를 적절히 분배하세요
4. 예상 소요 시간을 현실적으로 설정하세요
5. 이미 완료된 과제와 중복되지 않게 하세요
6. 미완료 과제가 있으면 우선 처리할 수 있도록 반영하세요
7. category는 market, customer, finance, tech, legal, operations, marketing, general 중 선택
8. 각 과제에 대해 왜 이 과제가 필요한지 reasoning을 포함하세요
9. 각 과제의 project_title에는 해당 과제가 속하는 프로젝트의 정확한 제목을 입력하세요`
}

export function getSuggestionPrompt(
  projects: { title: string; description: string }[],
  taskHistory: { total: number; completed: number; completionRate: number }
): string {
  const projectList = projects.map((p) => `- "${p.title}": ${p.description}`).join('\n')

  return `현재 프로젝트:
${projectList}

과제 진행 현황:
- 총 과제: ${taskHistory.total}개
- 완료: ${taskHistory.completed}개
- 완료율: ${taskHistory.completionRate}%

위 정보를 종합 분석하여 사용자에게 도움이 될 인사이트와 제안을 생성하세요.

규칙:
1. 2-4개의 제안을 생성하세요
2. type별 의미:
   - tip: 실행에 도움이 되는 구체적 팁
   - warning: 주의해야 할 점이나 리스크
   - pivot: 방향 전환이나 전략 변경 제안
   - encouragement: 격려와 동기부여
3. 완료율이 낮으면 격려와 함께 효율적 실행 방법을 제안하세요
4. 완료율이 높으면 다음 단계로의 도약을 제안하세요
5. 각 제안은 구체적이고 실행 가능한 내용이어야 합니다`
}

export function getMentorSystemPrompt(): string {
  return `당신은 사업 멘토입니다. 소크라테스식 질문법을 사용하여 사용자가 스스로 아이디어를 구체화하도록 도와주세요.

규칙:
1. 한 번에 1-2개의 질문만 하세요
2. 질문은 구체적이고 실용적이어야 합니다
3. 사용자의 답변을 바탕으로 다음 질문을 이어가세요
4. 충분히 구체화되었다고 판단되면, "아이디어가 충분히 구체화되었습니다. 이제 분석을 시작할 수 있습니다."라고 안내하세요
5. 한국어로 대화하세요

질문 영역:
- 타겟 고객은 누구인가요?
- 해결하려는 문제는 무엇인가요?
- 기존 해결책의 한계는?
- 차별화 포인트는?
- 수익 모델은?
- 필요한 핵심 리소스는?`
}
