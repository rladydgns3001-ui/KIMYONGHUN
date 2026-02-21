import { create } from 'zustand'
import type { DailyTask, AiSuggestion } from '../../../shared/types'

interface TaskState {
  tasks: (DailyTask & { project_title: string })[]
  suggestions: AiSuggestion[]
  selectedDate: string
  generating: boolean
  generatingSuggestions: boolean

  setSelectedDate: (date: string) => void
  loadTasks: (date: string) => Promise<void>
  updateTask: (id: number, data: Partial<DailyTask>) => Promise<void>
  createTask: (data: {
    project_id: number
    title: string
    description: string
    category: string
    priority: 'high' | 'medium' | 'low'
    due_date: string
    estimated_hours: number
    ai_generated: number
  }) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  generateTasks: () => Promise<void>
  loadSuggestions: () => Promise<void>
  dismissSuggestion: (id: number) => Promise<void>
  generateSuggestions: () => Promise<void>
}

function getTodayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  suggestions: [],
  selectedDate: getTodayString(),
  generating: false,
  generatingSuggestions: false,

  setSelectedDate: (date) => {
    set({ selectedDate: date })
    get().loadTasks(date)
  },

  loadTasks: async (date) => {
    const tasks = await window.api.getDailyTasks(date)
    set({ tasks })
  },

  updateTask: async (id, data) => {
    await window.api.updateTask(id, data)
    await get().loadTasks(get().selectedDate)
  },

  createTask: async (data) => {
    await window.api.createTask(data)
    await get().loadTasks(get().selectedDate)
  },

  deleteTask: async (id) => {
    await window.api.deleteTask(id)
    await get().loadTasks(get().selectedDate)
  },

  generateTasks: async () => {
    set({ generating: true })
    try {
      await window.api.generateDailyTasks(get().selectedDate)
      await get().loadTasks(get().selectedDate)
    } finally {
      set({ generating: false })
    }
  },

  loadSuggestions: async () => {
    const suggestions = await window.api.getSuggestions()
    set({ suggestions })
  },

  dismissSuggestion: async (id) => {
    await window.api.dismissSuggestion(id)
    await get().loadSuggestions()
  },

  generateSuggestions: async () => {
    set({ generatingSuggestions: true })
    try {
      await window.api.generateSuggestions()
      await get().loadSuggestions()
    } finally {
      set({ generatingSuggestions: false })
    }
  }
}))
