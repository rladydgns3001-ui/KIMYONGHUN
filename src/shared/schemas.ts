import { z } from 'zod'

// 1. 시장 분석 스키마
export const marketAnalysisSchema = z.object({
  market_fit_score: z.number().min(0).max(100).describe('시장 적합성 점수 (0-100)'),
  market_fit_reasoning: z.string().describe('시장 적합성 점수 근거'),
  tam: z.object({
    value: z.string().describe('전체 시장 규모 (예: 500억원)'),
    description: z.string().describe('TAM 산출 근거')
  }),
  sam: z.object({
    value: z.string().describe('유효 시장 규모'),
    description: z.string().describe('SAM 산출 근거')
  }),
  som: z.object({
    value: z.string().describe('수익 가능 시장 규모'),
    description: z.string().describe('SOM 산출 근거')
  }),
  trends: z.array(z.object({
    name: z.string(),
    description: z.string(),
    impact: z.enum(['positive', 'negative', 'neutral'])
  })).describe('주요 시장 트렌드'),
  summary: z.string().describe('시장 분석 요약')
})

// 2. 타겟 고객 스키마
export const customerAnalysisSchema = z.object({
  primary_persona: z.object({
    name: z.string().describe('페르소나 이름'),
    age_range: z.string().describe('연령대'),
    occupation: z.string().describe('직업'),
    income_level: z.string().describe('소득 수준'),
    pain_points: z.array(z.string()).describe('주요 고충'),
    goals: z.array(z.string()).describe('목표'),
    behavior_patterns: z.array(z.string()).describe('행동 패턴')
  }),
  secondary_personas: z.array(z.object({
    name: z.string(),
    description: z.string(),
    size_percentage: z.number().describe('전체 타겟 대비 비율')
  })),
  demographics: z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
    education: z.string()
  }),
  psychographics: z.object({
    values: z.array(z.string()),
    interests: z.array(z.string()),
    lifestyle: z.string()
  }),
  customer_acquisition_cost: z.object({
    estimated_cac: z.string().describe('예상 고객획득비용'),
    channels: z.array(z.object({
      name: z.string(),
      cost: z.string(),
      effectiveness: z.enum(['high', 'medium', 'low'])
    }))
  }),
  summary: z.string()
})

// 3. 경쟁 분석 스키마
export const competitionAnalysisSchema = z.object({
  direct_competitors: z.array(z.object({
    name: z.string(),
    description: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    market_share: z.string(),
    pricing: z.string()
  })),
  indirect_competitors: z.array(z.object({
    name: z.string(),
    description: z.string(),
    threat_level: z.enum(['high', 'medium', 'low'])
  })),
  positioning: z.object({
    x_axis: z.string().describe('포지셔닝 맵 X축 기준'),
    y_axis: z.string().describe('포지셔닝 맵 Y축 기준'),
    our_position: z.object({ x: z.number().min(0).max(100), y: z.number().min(0).max(100) }),
    competitor_positions: z.array(z.object({
      name: z.string(),
      x: z.number().min(0).max(100),
      y: z.number().min(0).max(100)
    }))
  }),
  differentiation_strategy: z.array(z.object({
    area: z.string().describe('차별화 영역'),
    strategy: z.string().describe('전략 설명'),
    feasibility: z.enum(['high', 'medium', 'low'])
  })),
  summary: z.string()
})

// 4. 수익 모델 스키마
export const revenueAnalysisSchema = z.object({
  primary_model: z.object({
    type: z.string().describe('수익 모델 유형 (구독, 프리미엄, 광고 등)'),
    description: z.string(),
    pricing_tiers: z.array(z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string())
    }))
  }),
  secondary_models: z.array(z.object({
    type: z.string(),
    description: z.string(),
    potential_revenue_share: z.string()
  })),
  pricing_strategy: z.object({
    approach: z.string().describe('가격 전략 접근법'),
    justification: z.string(),
    competitive_comparison: z.string()
  }),
  monetization_timeline: z.array(z.object({
    phase: z.string(),
    period: z.string(),
    revenue_source: z.string(),
    expected_revenue: z.string()
  })),
  summary: z.string()
})

// 5. 재무 전망 스키마
export const financialAnalysisSchema = z.object({
  initial_investment: z.object({
    total: z.string().describe('총 초기 투자 금액'),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.string(),
      description: z.string()
    }))
  }),
  monthly_costs: z.object({
    total: z.string(),
    breakdown: z.array(z.object({
      category: z.string(),
      amount: z.string()
    }))
  }),
  revenue_projection: z.array(z.object({
    month: z.number(),
    revenue: z.number(),
    costs: z.number(),
    profit: z.number()
  })).describe('12개월 매출/비용/손익 추정'),
  break_even: z.object({
    month: z.number().describe('손익분기점 도달 예상 월'),
    description: z.string()
  }),
  key_metrics: z.object({
    ltv: z.string().describe('고객 생애 가치'),
    cac: z.string().describe('고객 획득 비용'),
    ltv_cac_ratio: z.string(),
    gross_margin: z.string()
  }),
  summary: z.string()
})

// 6. 실행 로드맵 스키마
export const roadmapAnalysisSchema = z.object({
  phases: z.array(z.object({
    name: z.string(),
    duration: z.string(),
    goals: z.array(z.string()),
    milestones: z.array(z.object({
      name: z.string(),
      deadline: z.string(),
      deliverables: z.array(z.string())
    })),
    resources_needed: z.array(z.string())
  })),
  team_composition: z.array(z.object({
    role: z.string(),
    count: z.number(),
    timing: z.string().describe('채용 시기'),
    key_skills: z.array(z.string())
  })),
  quick_wins: z.array(z.object({
    action: z.string(),
    impact: z.string(),
    effort: z.enum(['low', 'medium', 'high']),
    timeline: z.string()
  })),
  dependencies: z.array(z.object({
    task: z.string(),
    depends_on: z.string(),
    risk_if_delayed: z.string()
  })),
  summary: z.string()
})

// 7. SWOT 분석 스키마
export const swotAnalysisSchema = z.object({
  strengths: z.array(z.object({
    factor: z.string(),
    description: z.string(),
    leverage_strategy: z.string().describe('활용 전략')
  })),
  weaknesses: z.array(z.object({
    factor: z.string(),
    description: z.string(),
    mitigation_strategy: z.string().describe('보완 전략')
  })),
  opportunities: z.array(z.object({
    factor: z.string(),
    description: z.string(),
    capture_strategy: z.string().describe('포착 전략')
  })),
  threats: z.array(z.object({
    factor: z.string(),
    description: z.string(),
    defense_strategy: z.string().describe('방어 전략')
  })),
  cross_analysis: z.array(z.object({
    type: z.enum(['SO', 'WO', 'ST', 'WT']),
    strategy: z.string(),
    description: z.string()
  })).describe('SWOT 교차 분석'),
  summary: z.string()
})

// 8. 리스크 평가 스키마
export const riskAnalysisSchema = z.object({
  risks: z.array(z.object({
    name: z.string(),
    category: z.enum(['market', 'technical', 'financial', 'legal', 'operational', 'competitive']),
    probability: z.number().min(1).max(5).describe('발생 확률 (1-5)'),
    impact: z.number().min(1).max(5).describe('영향도 (1-5)'),
    risk_score: z.number().describe('리스크 점수 (확률 x 영향도)'),
    description: z.string(),
    mitigation_plan: z.string().describe('완화 계획'),
    contingency_plan: z.string().describe('대응 계획')
  })),
  overall_risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  go_no_go: z.object({
    decision: z.enum(['go', 'conditional_go', 'no_go']),
    reasoning: z.string(),
    conditions: z.array(z.string()).describe('조건부 진행 시 필요 조건')
  }),
  risk_mitigation_priority: z.array(z.object({
    risk_name: z.string(),
    priority: z.number(),
    immediate_action: z.string()
  })),
  summary: z.string()
})

export const brainstormSchema = z.object({
  ideas: z.array(z.object({
    title: z.string(),
    description: z.string(),
    target_market: z.string(),
    unique_value: z.string()
  }))
})

export const dailyTasksSchema = z.object({
  tasks: z.array(z.object({
    project_title: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    estimated_hours: z.number(),
    reasoning: z.string()
  }))
})

export const aiSuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    type: z.enum(['tip', 'warning', 'pivot', 'encouragement']),
    title: z.string(),
    content: z.string()
  }))
})

export type MarketAnalysis = z.infer<typeof marketAnalysisSchema>
export type CustomerAnalysis = z.infer<typeof customerAnalysisSchema>
export type CompetitionAnalysis = z.infer<typeof competitionAnalysisSchema>
export type RevenueAnalysis = z.infer<typeof revenueAnalysisSchema>
export type FinancialAnalysis = z.infer<typeof financialAnalysisSchema>
export type RoadmapAnalysis = z.infer<typeof roadmapAnalysisSchema>
export type SwotAnalysis = z.infer<typeof swotAnalysisSchema>
export type RiskAnalysis = z.infer<typeof riskAnalysisSchema>

export type AnalysisResult =
  | MarketAnalysis
  | CustomerAnalysis
  | CompetitionAnalysis
  | RevenueAnalysis
  | FinancialAnalysis
  | RoadmapAnalysis
  | SwotAnalysis
  | RiskAnalysis
