import { useState, useCallback } from 'react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAppStore } from '../stores/useAppStore'
import { ANALYSIS_TYPES } from '../../../shared/types'
import type { AnalysisType, Analysis } from '../../../shared/types'

export function useAnalysis() {
  const { currentProject, analyses, loadAnalyses, setAnalyzingType, setBatchProgress } = useProjectStore()
  const { addToast } = useAppStore()
  const [isRunning, setIsRunning] = useState(false)

  const runSingleAnalysis = useCallback(
    async (type: AnalysisType): Promise<Analysis | null> => {
      if (!currentProject) return null

      setAnalyzingType(type, true)
      try {
        // Gather previous results for context chaining
        const previousResults: Record<string, unknown> = {}
        for (const a of analyses) {
          try {
            previousResults[a.type] = JSON.parse(a.result)
          } catch {
            // skip
          }
        }

        const analysis = await window.api.runAnalysis(
          currentProject.id,
          type,
          currentProject.description,
          Object.keys(previousResults).length > 0 ? previousResults : undefined
        )
        await loadAnalyses(currentProject.id)
        addToast('success', `${type} 분석이 완료되었습니다.`)
        return analysis
      } catch (error) {
        const message = error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.'
        addToast('error', message)
        return null
      } finally {
        setAnalyzingType(type, false)
      }
    },
    [currentProject, analyses, loadAnalyses, setAnalyzingType, addToast]
  )

  const runAllAnalyses = useCallback(async () => {
    if (!currentProject) return
    setIsRunning(true)

    try {
      await window.api.updateProject(currentProject.id, { status: 'analyzing' } as never)

      for (let i = 0; i < ANALYSIS_TYPES.length; i++) {
        setBatchProgress({ current: i + 1, total: ANALYSIS_TYPES.length })
        await runSingleAnalysis(ANALYSIS_TYPES[i])
      }

      await window.api.updateProject(currentProject.id, { status: 'completed' } as never)
      addToast('success', '모든 분석이 완료되었습니다!')
    } catch (error) {
      addToast('error', '일부 분석이 실패했습니다.')
    } finally {
      setIsRunning(false)
      setBatchProgress(null)
    }
  }, [currentProject, runSingleAnalysis, setBatchProgress, addToast])

  return { runSingleAnalysis, runAllAnalyses, isRunning }
}
