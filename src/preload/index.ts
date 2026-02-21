import { contextBridge, ipcRenderer } from 'electron'
import type { IpcApi } from '../shared/types'

const api: IpcApi = {
  // Projects
  getProjects: () => ipcRenderer.invoke('db:getProjects'),
  getProject: (id) => ipcRenderer.invoke('db:getProject', id),
  createProject: (data) => ipcRenderer.invoke('db:createProject', data),
  updateProject: (id, data) => ipcRenderer.invoke('db:updateProject', id, data),
  deleteProject: (id) => ipcRenderer.invoke('db:deleteProject', id),

  // Analyses
  getAnalyses: (projectId) => ipcRenderer.invoke('db:getAnalyses', projectId),
  getAnalysis: (id) => ipcRenderer.invoke('db:getAnalysis', id),
  saveAnalysis: (data) => ipcRenderer.invoke('db:saveAnalysis', data),

  // Conversations
  getConversations: (projectId, analysisType) =>
    ipcRenderer.invoke('db:getConversations', projectId, analysisType),
  addConversation: (data) => ipcRenderer.invoke('db:addConversation', data),

  // Settings
  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  updateSettings: (data) => ipcRenderer.invoke('db:updateSettings', data),

  // Claude API
  testApiKey: (apiKey) => ipcRenderer.invoke('claude:testApiKey', apiKey),
  runAnalysis: (projectId, type, idea, previousResults) =>
    ipcRenderer.invoke('claude:runAnalysis', projectId, type, idea, previousResults),
  brainstorm: (idea) => ipcRenderer.invoke('claude:brainstorm', idea),
  mentorChat: (messages, idea) => ipcRenderer.invoke('claude:mentorChat', messages, idea),
  followUpChat: (projectId, analysisType, messages, analysisResult) =>
    ipcRenderer.invoke('claude:followUpChat', projectId, analysisType, messages, analysisResult),

  // Usage
  getUsageLogs: () => ipcRenderer.invoke('db:getUsageLogs'),
  getTotalUsage: () => ipcRenderer.invoke('db:getTotalUsage'),

  // Daily Tasks
  getDailyTasks: (date) => ipcRenderer.invoke('db:getDailyTasks', date),
  getTasksByProject: (projectId) => ipcRenderer.invoke('db:getTasksByProject', projectId),
  createTask: (data) => ipcRenderer.invoke('db:createTask', data),
  updateTask: (id, data) => ipcRenderer.invoke('db:updateTask', id, data),
  deleteTask: (id) => ipcRenderer.invoke('db:deleteTask', id),
  generateDailyTasks: (date) => ipcRenderer.invoke('claude:generateDailyTasks', date),

  // AI Suggestions
  getSuggestions: () => ipcRenderer.invoke('db:getSuggestions'),
  dismissSuggestion: (id) => ipcRenderer.invoke('db:dismissSuggestion', id),
  generateSuggestions: () => ipcRenderer.invoke('claude:generateSuggestions')
}

contextBridge.exposeInMainWorld('api', api)
