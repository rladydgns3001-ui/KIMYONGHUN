import { getDb } from './connection'
import type { Project, Analysis, Conversation, Settings, UsageLog, AnalysisType, DailyTask, AiSuggestion } from '../../shared/types'

// Projects
export function getProjects(): Project[] {
  return getDb().prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as Project[]
}

export function getProject(id: number): Project | null {
  return (getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project) || null
}

export function createProject(data: { title: string; description: string; industry: string; tags: string }): Project {
  const stmt = getDb().prepare(
    'INSERT INTO projects (title, description, industry, tags) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(data.title, data.description, data.industry, data.tags)
  return getProject(result.lastInsertRowid as number)!
}

export function updateProject(id: number, data: Partial<Project>): Project {
  const fields: string[] = []
  const values: unknown[] = []

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.industry !== undefined) { fields.push('industry = ?'); values.push(data.industry) }
  if (data.tags !== undefined) { fields.push('tags = ?'); values.push(data.tags) }
  if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status) }

  fields.push("updated_at = datetime('now')")
  values.push(id)

  getDb().prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  return getProject(id)!
}

export function deleteProject(id: number): void {
  getDb().prepare('DELETE FROM projects WHERE id = ?').run(id)
}

// Analyses
export function getAnalyses(projectId: number): Analysis[] {
  return getDb().prepare('SELECT * FROM analyses WHERE project_id = ? ORDER BY created_at ASC').all(projectId) as Analysis[]
}

export function getAnalysis(id: number): Analysis | null {
  return (getDb().prepare('SELECT * FROM analyses WHERE id = ?').get(id) as Analysis) || null
}

export function saveAnalysis(data: {
  project_id: number
  type: AnalysisType
  result: string
  model_used: string
  input_tokens: number
  output_tokens: number
}): Analysis {
  // Delete existing analysis of same type for project
  getDb().prepare('DELETE FROM analyses WHERE project_id = ? AND type = ?').run(data.project_id, data.type)

  const stmt = getDb().prepare(
    'INSERT INTO analyses (project_id, type, result, model_used, input_tokens, output_tokens) VALUES (?, ?, ?, ?, ?, ?)'
  )
  const result = stmt.run(data.project_id, data.type, data.result, data.model_used, data.input_tokens, data.output_tokens)

  // Log usage
  const cost = estimateCost(data.model_used, data.input_tokens, data.output_tokens)
  getDb().prepare(
    'INSERT INTO usage_log (project_id, analysis_type, model, input_tokens, output_tokens, cost) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.project_id, data.type, data.model_used, data.input_tokens, data.output_tokens, cost)

  return getAnalysis(result.lastInsertRowid as number)!
}

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Approximate costs per 1M tokens
  const costs: Record<string, { input: number; output: number }> = {
    'claude-sonnet-4-20250514': { input: 3, output: 15 },
    'claude-haiku-3-5-20241022': { input: 0.8, output: 4 },
    'claude-opus-4-20250514': { input: 15, output: 75 }
  }
  const rate = costs[model] || costs['claude-sonnet-4-20250514']
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
}

// Conversations
export function getConversations(projectId: number, analysisType?: string): Conversation[] {
  if (analysisType) {
    return getDb().prepare(
      'SELECT * FROM conversations WHERE project_id = ? AND analysis_type = ? ORDER BY created_at ASC'
    ).all(projectId, analysisType) as Conversation[]
  }
  return getDb().prepare(
    'SELECT * FROM conversations WHERE project_id = ? ORDER BY created_at ASC'
  ).all(projectId) as Conversation[]
}

export function addConversation(data: {
  project_id: number
  analysis_type: string
  role: string
  content: string
}): Conversation {
  const stmt = getDb().prepare(
    'INSERT INTO conversations (project_id, analysis_type, role, content) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(data.project_id, data.analysis_type, data.role, data.content)
  return getDb().prepare('SELECT * FROM conversations WHERE id = ?').get(result.lastInsertRowid as number) as Conversation
}

// Settings
export function getSettings(): Settings {
  const rows = getDb().prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }
  return {
    api_key: settings.api_key || '',
    preferred_model: settings.preferred_model || 'claude-sonnet-4-20250514',
    theme: (settings.theme as Settings['theme']) || 'light',
    export_path: settings.export_path || ''
  }
}

export function updateSettings(data: Partial<Settings>): Settings {
  const upsert = getDb().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
  if (data.api_key !== undefined) upsert.run('api_key', data.api_key)
  if (data.preferred_model !== undefined) upsert.run('preferred_model', data.preferred_model)
  if (data.theme !== undefined) upsert.run('theme', data.theme)
  if (data.export_path !== undefined) upsert.run('export_path', data.export_path)
  return getSettings()
}

// Usage
export function getUsageLogs(): UsageLog[] {
  return getDb().prepare('SELECT * FROM usage_log ORDER BY created_at DESC').all() as UsageLog[]
}

export function getTotalUsage(): { total_cost: number; total_input_tokens: number; total_output_tokens: number } {
  const result = getDb().prepare(
    'SELECT COALESCE(SUM(cost), 0) as total_cost, COALESCE(SUM(input_tokens), 0) as total_input_tokens, COALESCE(SUM(output_tokens), 0) as total_output_tokens FROM usage_log'
  ).get() as { total_cost: number; total_input_tokens: number; total_output_tokens: number }
  return result
}

// Daily Tasks
export function getDailyTasks(date: string): (DailyTask & { project_title: string })[] {
  return getDb().prepare(
    `SELECT dt.*, p.title as project_title
     FROM daily_tasks dt
     JOIN projects p ON dt.project_id = p.id
     WHERE dt.due_date = ?
     ORDER BY dt.sort_order ASC,
       CASE dt.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 WHEN 'low' THEN 2 END ASC,
       dt.created_at ASC`
  ).all(date) as (DailyTask & { project_title: string })[]
}

export function getTasksByProject(projectId: number): DailyTask[] {
  return getDb().prepare(
    'SELECT * FROM daily_tasks WHERE project_id = ? ORDER BY due_date DESC, sort_order ASC'
  ).all(projectId) as DailyTask[]
}

export function createTask(data: {
  project_id: number
  title: string
  description: string
  category: string
  priority: string
  due_date: string
  estimated_hours: number
  ai_generated: number
}): DailyTask {
  const stmt = getDb().prepare(
    `INSERT INTO daily_tasks (project_id, title, description, category, priority, due_date, estimated_hours, ai_generated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
  const result = stmt.run(
    data.project_id, data.title, data.description, data.category,
    data.priority, data.due_date, data.estimated_hours, data.ai_generated
  )
  return getDb().prepare('SELECT * FROM daily_tasks WHERE id = ?').get(result.lastInsertRowid as number) as DailyTask
}

export function updateTask(id: number, data: Partial<DailyTask>): DailyTask {
  const fields: string[] = []
  const values: unknown[] = []

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description) }
  if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category) }
  if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority) }
  if (data.status !== undefined) {
    fields.push('status = ?'); values.push(data.status)
    if (data.status === 'completed') {
      fields.push("completed_at = datetime('now')")
    } else {
      fields.push('completed_at = NULL')
    }
  }
  if (data.due_date !== undefined) { fields.push('due_date = ?'); values.push(data.due_date) }
  if (data.estimated_hours !== undefined) { fields.push('estimated_hours = ?'); values.push(data.estimated_hours) }
  if (data.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(data.sort_order) }

  fields.push("updated_at = datetime('now')")
  values.push(id)

  getDb().prepare(`UPDATE daily_tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values)
  return getDb().prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id) as DailyTask
}

export function deleteTask(id: number): void {
  getDb().prepare('DELETE FROM daily_tasks WHERE id = ?').run(id)
}

export function getTaskStats(date: string): { total: number; completed: number; in_progress: number } {
  const result = getDb().prepare(
    `SELECT
       COUNT(*) as total,
       COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed,
       COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress
     FROM daily_tasks WHERE due_date = ?`
  ).get(date) as { total: number; completed: number; in_progress: number }
  return result
}

// AI Suggestions
export function getSuggestions(): AiSuggestion[] {
  return getDb().prepare(
    'SELECT * FROM ai_suggestions WHERE is_dismissed = 0 ORDER BY created_at DESC'
  ).all() as AiSuggestion[]
}

export function createSuggestion(data: {
  project_id: number | null
  type: string
  title: string
  content: string
}): AiSuggestion {
  const stmt = getDb().prepare(
    'INSERT INTO ai_suggestions (project_id, type, title, content) VALUES (?, ?, ?, ?)'
  )
  const result = stmt.run(data.project_id, data.type, data.title, data.content)
  return getDb().prepare('SELECT * FROM ai_suggestions WHERE id = ?').get(result.lastInsertRowid as number) as AiSuggestion
}

export function dismissSuggestion(id: number): void {
  getDb().prepare('UPDATE ai_suggestions SET is_dismissed = 1 WHERE id = ?').run(id)
}
