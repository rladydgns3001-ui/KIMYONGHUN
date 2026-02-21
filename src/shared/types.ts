export type AnalysisType =
  | 'market'
  | 'customer'
  | 'competition'
  | 'revenue'
  | 'financial'
  | 'roadmap'
  | 'swot'
  | 'risk'

export const ANALYSIS_TYPES: AnalysisType[] = [
  'market',
  'customer',
  'competition',
  'revenue',
  'financial',
  'roadmap',
  'swot',
  'risk'
]

export const ANALYSIS_LABELS: Record<AnalysisType, string> = {
  market: '시장 분석',
  customer: '타겟 고객',
  competition: '경쟁 분석',
  revenue: '수익 모델',
  financial: '재무 전망',
  roadmap: '실행 로드맵',
  swot: 'SWOT 분석',
  risk: '리스크 평가'
}

export const ANALYSIS_DESCRIPTIONS: Record<AnalysisType, string> = {
  market: '시장 적합성, 규모(TAM/SAM/SOM), 트렌드 분석',
  customer: '인구통계, 심리통계, 페르소나, 고객획득비용',
  competition: '직접/간접 경쟁자, 포지셔닝, 차별화 전략',
  revenue: '수익 모델 유형, 가격 전략, 수익화 타임라인',
  financial: '초기 투자, 월 비용, 매출 추정, 손익분기점',
  roadmap: '단계별 계획, 마일스톤, 팀 구성, Quick Win',
  swot: '강점/약점/기회/위협 + 대응 전략',
  risk: '리스크 목록, 확률/영향도, 완화 계획, Go/No-Go'
}

export type ProjectStatus = 'draft' | 'analyzing' | 'completed'

export interface Project {
  id: number
  title: string
  description: string
  industry: string
  tags: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: number
  project_id: number
  type: AnalysisType
  result: string // JSON string
  model_used: string
  input_tokens: number
  output_tokens: number
  created_at: string
}

export interface Conversation {
  id: number
  project_id: number
  analysis_type: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Settings {
  api_key: string
  preferred_model: string
  theme: 'light' | 'dark' | 'system'
  export_path: string
}

export interface UsageLog {
  id: number
  project_id: number
  analysis_type: string
  model: string
  input_tokens: number
  output_tokens: number
  cost: number
  created_at: string
}

export type PreAnalysisMode = 'direct' | 'brainstorm' | 'mentor'

export interface BrainstormIdea {
  title: string
  description: string
  target_market: string
  unique_value: string
}

export interface MentorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface DailyTask {
  id: number
  project_id: number
  title: string
  description: string
  category: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  due_date: string
  estimated_hours: number
  completed_at: string | null
  ai_generated: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface AiSuggestion {
  id: number
  project_id: number | null
  type: 'tip' | 'warning' | 'pivot' | 'encouragement'
  title: string
  content: string
  is_read: number
  is_dismissed: number
  created_at: string
}

// IPC Channel types
export interface IpcApi {
  // Database - Projects
  getProjects: () => Promise<Project[]>
  getProject: (id: number) => Promise<Project | null>
  createProject: (data: { title: string; description: string; industry: string; tags: string }) => Promise<Project>
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>
  deleteProject: (id: number) => Promise<void>

  // Database - Analyses
  getAnalyses: (projectId: number) => Promise<Analysis[]>
  getAnalysis: (id: number) => Promise<Analysis | null>
  saveAnalysis: (data: { project_id: number; type: AnalysisType; result: string; model_used: string; input_tokens: number; output_tokens: number }) => Promise<Analysis>

  // Database - Conversations
  getConversations: (projectId: number, analysisType?: string) => Promise<Conversation[]>
  addConversation: (data: { project_id: number; analysis_type: string; role: string; content: string }) => Promise<Conversation>

  // Settings
  getSettings: () => Promise<Settings>
  updateSettings: (data: Partial<Settings>) => Promise<Settings>

  // Claude API
  testApiKey: (apiKey: string) => Promise<{ success: boolean; error?: string }>
  runAnalysis: (projectId: number, type: AnalysisType, idea: string, previousResults?: Record<string, unknown>) => Promise<Analysis>
  brainstorm: (idea: string) => Promise<BrainstormIdea[]>
  mentorChat: (messages: MentorMessage[], idea: string) => Promise<string>
  followUpChat: (projectId: number, analysisType: AnalysisType, messages: MentorMessage[], analysisResult: unknown) => Promise<string>

  // Usage
  getUsageLogs: () => Promise<UsageLog[]>
  getTotalUsage: () => Promise<{ total_cost: number; total_input_tokens: number; total_output_tokens: number }>

  // Daily Tasks
  getDailyTasks: (date: string) => Promise<(DailyTask & { project_title: string })[]>
  getTasksByProject: (projectId: number) => Promise<DailyTask[]>
  createTask: (data: {
    project_id: number
    title: string
    description: string
    category: string
    priority: 'high' | 'medium' | 'low'
    due_date: string
    estimated_hours: number
    ai_generated: number
  }) => Promise<DailyTask>
  updateTask: (id: number, data: Partial<DailyTask>) => Promise<DailyTask>
  deleteTask: (id: number) => Promise<void>
  generateDailyTasks: (date: string) => Promise<DailyTask[]>

  // AI Suggestions
  getSuggestions: () => Promise<AiSuggestion[]>
  dismissSuggestion: (id: number) => Promise<void>
  generateSuggestions: () => Promise<AiSuggestion[]>
}
