import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Play,
  TrendingUp,
  Users,
  Swords,
  DollarSign,
  BarChart3,
  Map,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAnalysis } from '../hooks/useAnalysis'
import ProgressBar from '../components/ui/ProgressBar'
import type { AnalysisType } from '../../../shared/types'
import { ANALYSIS_LABELS, ANALYSIS_DESCRIPTIONS } from '../../../shared/types'

const ANALYSIS_ICONS: Record<AnalysisType, typeof TrendingUp> = {
  market: TrendingUp,
  customer: Users,
  competition: Swords,
  revenue: DollarSign,
  financial: BarChart3,
  roadmap: Map,
  swot: Shield,
  risk: AlertTriangle
}

const ANALYSIS_COLORS: Record<AnalysisType, string> = {
  market: 'bg-blue-500',
  customer: 'bg-emerald-500',
  competition: 'bg-orange-500',
  revenue: 'bg-violet-500',
  financial: 'bg-cyan-500',
  roadmap: 'bg-pink-500',
  swot: 'bg-amber-500',
  risk: 'bg-red-500'
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, analyses, analyzingTypes, batchProgress, loadProject, loadAnalyses } = useProjectStore()
  const { runSingleAnalysis, runAllAnalyses, isRunning } = useAnalysis()

  useEffect(() => {
    if (id) {
      loadProject(Number(id))
      loadAnalyses(Number(id))
    }
  }, [id, loadProject, loadAnalyses])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const analysisMap = new Map(analyses.map((a) => [a.type, a]))
  const completedCount = analyses.length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/')} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentProject.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {currentProject.description}
          </p>
        </div>
        <div className="flex gap-2">
          {completedCount > 0 && (
            <button
              onClick={() => navigate(`/project/${id}/report`)}
              className="btn-secondary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              보고서
            </button>
          )}
          <button
            onClick={runAllAnalyses}
            disabled={isRunning}
            className="btn-primary flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            {isRunning ? '분석 중...' : '전체 분석 실행'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {batchProgress && (
        <div className="mb-6 card">
          <ProgressBar
            current={batchProgress.current}
            total={batchProgress.total}
            label="분석 진행률"
          />
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-4 mb-6 mt-4">
        <div className="card flex-1 py-4">
          <p className="text-2xl font-bold text-primary-600">{completedCount}/8</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">완료된 분석</p>
        </div>
        <div className="card flex-1 py-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentProject.industry || '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">업종</p>
        </div>
        <div className="card flex-1 py-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentProject.tags || '-'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">태그</p>
        </div>
      </div>

      {/* Analysis Grid */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">분석 항목</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(ANALYSIS_LABELS) as AnalysisType[]).map((type) => {
          const Icon = ANALYSIS_ICONS[type]
          const analysis = analysisMap.get(type)
          const isAnalyzing = analyzingTypes.includes(type)

          return (
            <div
              key={type}
              onClick={() => {
                if (analysis) navigate(`/project/${id}/analysis/${type}`)
              }}
              className={`card transition-all ${
                analysis ? 'cursor-pointer hover:shadow-md' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${ANALYSIS_COLORS[type]} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {ANALYSIS_LABELS[type]}
                  </h3>
                </div>
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                ) : analysis ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : null}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {ANALYSIS_DESCRIPTIONS[type]}
              </p>
              {!analysis && !isAnalyzing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    runSingleAnalysis(type)
                  }}
                  disabled={isRunning}
                  className="w-full text-xs btn-secondary"
                >
                  분석 실행
                </button>
              )}
              {analysis && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  완료 - 클릭하여 결과 보기
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
