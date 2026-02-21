import Anthropic from '@anthropic-ai/sdk'
import { zodToJsonSchema } from './zodToJson'
import * as repo from '../database/repository'
import { getSystemPrompt, getAnalysisPrompt, getAnalysisSchema, getBrainstormPrompt, getMentorSystemPrompt, getDailyTaskPrompt, getSuggestionPrompt } from './prompts'
import { brainstormSchema, dailyTasksSchema, aiSuggestionsSchema } from '../../shared/schemas'
import type { AnalysisType, BrainstormIdea, MentorMessage, DailyTask, AiSuggestion } from '../../shared/types'

function getClient(): Anthropic {
  const settings = repo.getSettings()
  if (!settings.api_key) {
    throw new Error('API 키가 설정되지 않았습니다. 설정에서 API 키를 입력하세요.')
  }
  return new Anthropic({ apiKey: settings.api_key })
}

function getModel(): string {
  const settings = repo.getSettings()
  return settings.preferred_model || 'claude-sonnet-4-20250514'
}

export async function testApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = new Anthropic({ apiKey })
    await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }]
    })
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function runAnalysis(
  type: AnalysisType,
  idea: string,
  previousResults?: Record<string, unknown>
): Promise<{ result: unknown; model: string; inputTokens: number; outputTokens: number }> {
  const client = getClient()
  const model = getModel()
  const schema = getAnalysisSchema(type)
  const jsonSchema = zodToJsonSchema(schema)

  const response = await client.messages.create({
    model,
    max_tokens: 8192,
    system: getSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: getAnalysisPrompt(type, idea, previousResults) +
          '\n\n반드시 다음 JSON 스키마에 맞춰 응답하세요. JSON만 출력하고 다른 텍스트는 포함하지 마세요:\n' +
          JSON.stringify(jsonSchema, null, 2)
      }
    ]
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => {
      if (block.type === 'text') return block.text
      return ''
    })
    .join('')

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 추출할 수 없습니다.')
  }

  const parsed = JSON.parse(jsonMatch[0])

  return {
    result: parsed,
    model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens
  }
}

export async function brainstorm(idea: string): Promise<BrainstormIdea[]> {
  const client = getClient()
  const model = getModel()
  const jsonSchema = zodToJsonSchema(brainstormSchema)

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: getSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: getBrainstormPrompt(idea) +
          '\n\n반드시 다음 JSON 스키마에 맞춰 응답하세요. JSON만 출력하고 다른 텍스트는 포함하지 마세요:\n' +
          JSON.stringify(jsonSchema, null, 2)
      }
    ]
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => {
      if (block.type === 'text') return block.text
      return ''
    })
    .join('')

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 추출할 수 없습니다.')
  }

  const parsed = JSON.parse(jsonMatch[0])
  return parsed.ideas
}

export async function mentorChat(messages: MentorMessage[], idea: string): Promise<string> {
  const client = getClient()
  const model = getModel()

  const apiMessages = [
    {
      role: 'user' as const,
      content: `사용자의 초기 아이디어: "${idea}"\n\n이 아이디어를 구체화하도록 도와주세요.`
    },
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  ]

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: getMentorSystemPrompt(),
    messages: apiMessages
  })

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => {
      if (block.type === 'text') return block.text
      return ''
    })
    .join('')
}

export async function followUpChat(
  analysisType: AnalysisType,
  messages: MentorMessage[],
  analysisResult: unknown
): Promise<string> {
  const client = getClient()
  const model = getModel()

  const apiMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content
  }))

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: `당신은 사업 분석 전문가입니다. 다음은 이전에 수행한 ${analysisType} 분석 결과입니다:\n\n${JSON.stringify(analysisResult, null, 2)}\n\n사용자의 후속 질문에 이 분석 결과를 바탕으로 상세하게 답변하세요. 한국어로 답변하세요.`,
    messages: apiMessages
  })

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => {
      if (block.type === 'text') return block.text
      return ''
    })
    .join('')
}

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text.trim())
  } catch {
    // Fall back to regex extraction
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 추출할 수 없습니다.')
  }
  return JSON.parse(jsonMatch[0])
}

export async function generateDailyTasks(date: string): Promise<DailyTask[]> {
  // Gather context: all projects with their analyses
  const projects = repo.getProjects()
  if (projects.length === 0) {
    throw new Error('프로젝트가 없습니다. 먼저 프로젝트를 생성하세요.')
  }

  const client = getClient()
  const model = getModel()
  const jsonSchema = zodToJsonSchema(dailyTasksSchema)
  const projectContexts = projects.map((p) => {
    const analyses = repo.getAnalyses(p.id)
    return {
      id: p.id,
      title: p.title,
      description: p.description,
      analyses: analyses.map((a) => a.type)
    }
  })

  // Get recent completed and pending tasks
  const allTasks = repo.getDailyTasks(date)
  const completedTasks = allTasks
    .filter((t) => t.status === 'completed')
    .map((t) => ({ title: t.title, project_title: t.project_title }))
  const pendingTasks = allTasks
    .filter((t) => t.status === 'pending' || t.status === 'in_progress')
    .map((t) => ({ title: t.title, project_title: t.project_title }))

  const prompt = getDailyTaskPrompt(date, projectContexts, completedTasks, pendingTasks)

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: getSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: prompt +
          '\n\n반드시 다음 JSON 스키마에 맞춰 응답하세요. JSON만 출력하고 다른 텍스트는 포함하지 마세요:\n' +
          JSON.stringify(jsonSchema, null, 2)
      }
    ]
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')

  const parsed = extractJson(text) as { tasks: Array<{ project_title: string; title: string; description: string; category: string; priority: 'high' | 'medium' | 'low'; estimated_hours: number; reasoning: string }> }

  // Match tasks to projects by title, fallback to first project
  const createdTasks: DailyTask[] = []
  for (const task of parsed.tasks) {
    const matched = projectContexts.find((p) => p.title === task.project_title)
    const projectId = matched?.id ?? projectContexts[0].id

    const created = repo.createTask({
      project_id: projectId,
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      due_date: date,
      estimated_hours: task.estimated_hours,
      ai_generated: 1
    })
    createdTasks.push(created)
  }

  return createdTasks
}

export async function generateSuggestions(): Promise<AiSuggestion[]> {
  const client = getClient()
  const model = getModel()
  const jsonSchema = zodToJsonSchema(aiSuggestionsSchema)

  const projects = repo.getProjects()
  const projectList = projects.map((p) => ({ title: p.title, description: p.description }))

  // Calculate task stats
  const today = new Date().toISOString().split('T')[0]
  const stats = repo.getTaskStats(today)
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const prompt = getSuggestionPrompt(projectList, {
    total: stats.total,
    completed: stats.completed,
    completionRate
  })

  const response = await client.messages.create({
    model,
    max_tokens: 2048,
    system: getSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: prompt +
          '\n\n반드시 다음 JSON 스키마에 맞춰 응답하세요. JSON만 출력하고 다른 텍스트는 포함하지 마세요:\n' +
          JSON.stringify(jsonSchema, null, 2)
      }
    ]
  })

  const text = response.content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('')

  const parsed = extractJson(text) as { suggestions: Array<{ type: 'tip' | 'warning' | 'pivot' | 'encouragement'; title: string; content: string }> }

  const createdSuggestions: AiSuggestion[] = []
  for (const suggestion of parsed.suggestions) {
    const created = repo.createSuggestion({
      project_id: null,
      type: suggestion.type,
      title: suggestion.title,
      content: suggestion.content
    })
    createdSuggestions.push(created)
  }

  return createdSuggestions
}
