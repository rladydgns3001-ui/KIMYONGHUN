import { ipcMain } from 'electron'
import * as repo from '../database/repository'
import * as claude from '../services/claude'
import type { AnalysisType, MentorMessage } from '../../shared/types'

export function registerIpcHandlers(): void {
  // Projects
  ipcMain.handle('db:getProjects', () => repo.getProjects())
  ipcMain.handle('db:getProject', (_, id: number) => repo.getProject(id))
  ipcMain.handle('db:createProject', (_, data) => repo.createProject(data))
  ipcMain.handle('db:updateProject', (_, id: number, data) => repo.updateProject(id, data))
  ipcMain.handle('db:deleteProject', (_, id: number) => repo.deleteProject(id))

  // Analyses
  ipcMain.handle('db:getAnalyses', (_, projectId: number) => repo.getAnalyses(projectId))
  ipcMain.handle('db:getAnalysis', (_, id: number) => repo.getAnalysis(id))
  ipcMain.handle('db:saveAnalysis', (_, data) => repo.saveAnalysis(data))

  // Conversations
  ipcMain.handle('db:getConversations', (_, projectId: number, analysisType?: string) =>
    repo.getConversations(projectId, analysisType)
  )
  ipcMain.handle('db:addConversation', (_, data) => repo.addConversation(data))

  // Settings
  ipcMain.handle('db:getSettings', () => repo.getSettings())
  ipcMain.handle('db:updateSettings', (_, data) => repo.updateSettings(data))

  // Usage
  ipcMain.handle('db:getUsageLogs', () => repo.getUsageLogs())
  ipcMain.handle('db:getTotalUsage', () => repo.getTotalUsage())

  // Claude API
  ipcMain.handle('claude:testApiKey', (_, apiKey: string) => claude.testApiKey(apiKey))

  ipcMain.handle(
    'claude:runAnalysis',
    async (_, projectId: number, type: AnalysisType, idea: string, previousResults?: Record<string, unknown>) => {
      const { result, model, inputTokens, outputTokens } = await claude.runAnalysis(type, idea, previousResults)
      const analysis = repo.saveAnalysis({
        project_id: projectId,
        type,
        result: JSON.stringify(result),
        model_used: model,
        input_tokens: inputTokens,
        output_tokens: outputTokens
      })
      return analysis
    }
  )

  ipcMain.handle('claude:brainstorm', (_, idea: string) => claude.brainstorm(idea))

  ipcMain.handle('claude:mentorChat', (_, messages: MentorMessage[], idea: string) =>
    claude.mentorChat(messages, idea)
  )

  ipcMain.handle(
    'claude:followUpChat',
    (_, _projectId: number, analysisType: AnalysisType, messages: MentorMessage[], analysisResult: unknown) =>
      claude.followUpChat(analysisType, messages, analysisResult)
  )

  // Daily Tasks
  ipcMain.handle('db:getDailyTasks', (_, date: string) => repo.getDailyTasks(date))
  ipcMain.handle('db:getTasksByProject', (_, projectId: number) => repo.getTasksByProject(projectId))
  ipcMain.handle('db:createTask', (_, data) => repo.createTask(data))
  ipcMain.handle('db:updateTask', (_, id: number, data) => repo.updateTask(id, data))
  ipcMain.handle('db:deleteTask', (_, id: number) => repo.deleteTask(id))
  ipcMain.handle('claude:generateDailyTasks', (_, date: string) => claude.generateDailyTasks(date))

  // AI Suggestions
  ipcMain.handle('db:getSuggestions', () => repo.getSuggestions())
  ipcMain.handle('db:dismissSuggestion', (_, id: number) => repo.dismissSuggestion(id))
  ipcMain.handle('claude:generateSuggestions', () => claude.generateSuggestions())
}
