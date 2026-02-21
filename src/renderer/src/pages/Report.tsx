import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { ANALYSIS_LABELS, ANALYSIS_TYPES } from '../../../shared/types'
import type { AnalysisType } from '../../../shared/types'
import MarketView from '../components/analysis/MarketView'
import CustomerView from '../components/analysis/CustomerView'
import CompetitionView from '../components/analysis/CompetitionView'
import RevenueView from '../components/analysis/RevenueView'
import FinancialView from '../components/analysis/FinancialView'
import RoadmapView from '../components/analysis/RoadmapView'
import SwotView from '../components/analysis/SwotView'
import RiskView from '../components/analysis/RiskView'

const VIEW_MAP: Record<AnalysisType, React.FC<{ data: unknown }>> = {
  market: MarketView,
  customer: CustomerView,
  competition: CompetitionView,
  revenue: RevenueView,
  financial: FinancialView,
  roadmap: RoadmapView,
  swot: SwotView,
  risk: RiskView
}

export default function Report() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, analyses, loadProject, loadAnalyses } = useProjectStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (id) {
        await loadProject(Number(id))
        await loadAnalyses(Number(id))
      }
      setLoading(false)
    }
    load()
  }, [id, loadProject, loadAnalyses])

  if (loading || !currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const analysisMap = new Map(analyses.map((a) => [a.type, a]))

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/project/${id}`)} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">전체 보고서</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentProject.title}</p>
        </div>
      </div>

      {/* Project Summary */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{currentProject.title}</h2>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{currentProject.description}</p>
        <div className="flex gap-4 mt-4 text-sm text-gray-500">
          {currentProject.industry && <span>업종: {currentProject.industry}</span>}
          {currentProject.tags && <span>태그: {currentProject.tags}</span>}
          <span>분석 완료: {analyses.length}/8</span>
        </div>
      </div>

      {/* All Analysis Results */}
      <div className="space-y-10">
        {ANALYSIS_TYPES.map((type) => {
          const analysis = analysisMap.get(type)
          if (!analysis) return null

          let parsedResult: unknown = null
          try {
            parsedResult = JSON.parse(analysis.result)
          } catch {
            return null
          }

          const ViewComponent = VIEW_MAP[type]

          return (
            <div key={type}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b dark:border-gray-700">
                {ANALYSIS_LABELS[type]}
              </h2>
              <ViewComponent data={parsedResult} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
