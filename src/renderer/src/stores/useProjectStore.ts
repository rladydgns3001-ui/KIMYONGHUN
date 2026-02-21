import { create } from 'zustand'
import type { Project, Analysis, AnalysisType } from '../../../shared/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  analyses: Analysis[]
  analyzingTypes: AnalysisType[]
  batchProgress: { current: number; total: number } | null

  loadProjects: () => Promise<void>
  loadProject: (id: number) => Promise<void>
  loadAnalyses: (projectId: number) => Promise<void>
  createProject: (data: { title: string; description: string; industry: string; tags: string }) => Promise<Project>
  deleteProject: (id: number) => Promise<void>
  setAnalyzingType: (type: AnalysisType, analyzing: boolean) => void
  setBatchProgress: (progress: { current: number; total: number } | null) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  analyses: [],
  analyzingTypes: [],
  batchProgress: null,

  loadProjects: async () => {
    const projects = await window.api.getProjects()
    set({ projects })
  },

  loadProject: async (id) => {
    const project = await window.api.getProject(id)
    set({ currentProject: project })
  },

  loadAnalyses: async (projectId) => {
    const analyses = await window.api.getAnalyses(projectId)
    set({ analyses })
  },

  createProject: async (data) => {
    const project = await window.api.createProject(data)
    await get().loadProjects()
    return project
  },

  deleteProject: async (id) => {
    await window.api.deleteProject(id)
    await get().loadProjects()
  },

  setAnalyzingType: (type, analyzing) => {
    set((state) => ({
      analyzingTypes: analyzing
        ? [...state.analyzingTypes, type]
        : state.analyzingTypes.filter((t) => t !== type)
    }))
  },

  setBatchProgress: (progress) => set({ batchProgress: progress })
}))
