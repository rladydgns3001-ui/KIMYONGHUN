import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, Send, RefreshCw } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAnalysis } from '../hooks/useAnalysis'
import { useAppStore } from '../stores/useAppStore'
import { ANALYSIS_LABELS } from '../../../shared/types'
import type { AnalysisType, MentorMessage } from '../../../shared/types'
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

export default function AnalysisDetail() {
  const { id, type } = useParams<{ id: string; type: AnalysisType }>()
  const navigate = useNavigate()
  const { currentProject, analyses, loadProject, loadAnalyses, analyzingTypes } = useProjectStore()
  const { runSingleAnalysis } = useAnalysis()
  const { addToast } = useAppStore()

  // Follow-up chat state
  const [chatMessages, setChatMessages] = useState<MentorMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (id) {
      loadProject(Number(id))
      loadAnalyses(Number(id))
    }
  }, [id, loadProject, loadAnalyses])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const analysis = analyses.find((a) => a.type === type)
  const isAnalyzing = type ? analyzingTypes.includes(type) : false

  if (!currentProject || !type) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const ViewComponent = VIEW_MAP[type]
  let parsedResult: unknown = null
  if (analysis) {
    try {
      parsedResult = JSON.parse(analysis.result)
    } catch {
      parsedResult = null
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading || !analysis) return

    const userMsg: MentorMessage = { role: 'user', content: chatInput }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const response = await window.api.followUpChat(
        Number(id),
        type,
        newMessages,
        parsedResult
      )
      setChatMessages([...newMessages, { role: 'assistant', content: response }])
    } catch {
      addToast('error', '응답을 받지 못했습니다.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/project/${id}`)} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {ANALYSIS_LABELS[type]}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentProject.title}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className="btn-secondary text-sm"
          >
            {showChat ? '채팅 닫기' : '후속 질문'}
          </button>
          <button
            onClick={() => runSingleAnalysis(type)}
            disabled={isAnalyzing}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            재분석
          </button>
        </div>
      </div>

      <div className={`flex gap-6 ${showChat ? '' : ''}`}>
        {/* Analysis Result */}
        <div className={`${showChat ? 'flex-1' : 'w-full'}`}>
          {isAnalyzing ? (
            <div className="card flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">분석 중입니다...</p>
            </div>
          ) : parsedResult ? (
            <ViewComponent data={parsedResult} />
          ) : (
            <div className="card text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">분석 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Follow-up Chat */}
        {showChat && (
          <div className="w-96 flex flex-col card p-4 max-h-[calc(100vh-12rem)]">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">후속 질문</h3>
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {chatMessages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  이 분석에 대해 궁금한 점을 질문하세요
                </p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                placeholder="질문 입력..."
                className="input flex-1 text-sm"
                disabled={chatLoading}
              />
              <button onClick={handleSendChat} disabled={chatLoading || !chatInput.trim()} className="btn-primary p-2">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
