import { create } from 'zustand'
import type { Settings } from '../../../shared/types'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface AppState {
  settings: Settings | null
  theme: 'light' | 'dark' | 'system'
  toasts: Toast[]
  loading: boolean

  setSettings: (settings: Settings) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  addToast: (type: Toast['type'], message: string) => void
  removeToast: (id: string) => void
  setLoading: (loading: boolean) => void
  loadSettings: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: null,
  theme: 'light',
  toasts: [],
  loading: false,

  setSettings: (settings) => {
    set({ settings, theme: settings.theme })
    applyTheme(settings.theme)
  },

  setTheme: (theme) => {
    set({ theme })
    applyTheme(theme)
  },

  addToast: (type, message) => {
    const id = Date.now().toString()
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },

  setLoading: (loading) => set({ loading }),

  loadSettings: async () => {
    try {
      const settings = await window.api.getSettings()
      set({ settings, theme: settings.theme })
      applyTheme(settings.theme)
    } catch {
      // Settings will be loaded later
    }
  }
}))

function applyTheme(theme: 'light' | 'dark' | 'system') {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', isDark)
}
