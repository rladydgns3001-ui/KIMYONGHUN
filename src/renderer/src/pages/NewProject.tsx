import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lightbulb,
  Zap,
  MessageCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAppStore } from '../stores/useAppStore'
import type { PreAnalysisMode } from '../../../shared/types'

export default function NewProject() {
  const [idea, setIdea] = useState('')
  const [industry, setIndustry] = useState('')
  const [tags, setTags] = useState('')
  const navigate = useNavigate()
  const { createProject } = useProjectStore()
  const { addToast } = useAppStore()

  const handleSubmit = async (mode: PreAnalysisMode) => {
    if (!idea.trim()) {
      addToast('error', '아이디어를 입력해주세요.')
      return
    }

    if (mode === 'direct') {
      const project = await createProject({
        title: idea.slice(0, 50),
        description: idea,
        industry,
        tags
      })
      navigate(`/project/${project.id}`)
    } else if (mode === 'brainstorm') {
      navigate('/brainstorm', { state: { idea, industry, tags } })
    } else if (mode === 'mentor') {
      navigate('/mentor', { state: { idea, industry, tags } })
    }
  }

  const modes: { mode: PreAnalysisMode; icon: typeof Zap; title: string; desc: string; color: string }[] = [
    {
      mode: 'direct',
      icon: Zap,
      title: '바로 분석',
      desc: '입력한 아이디어로 즉시 8가지 분석을 시작합니다',
      color: 'bg-blue-500'
    },
    {
      mode: 'brainstorm',
      icon: Sparkles,
      title: '브레인스토밍',
      desc: 'AI가 여러 구체적 사업 아이디어로 확장해줍니다',
      color: 'bg-purple-500'
    },
    {
      mode: 'mentor',
      icon: MessageCircle,
      title: '멘토 모드',
      desc: 'AI 멘토와 대화하며 아이디어를 구체화합니다',
      color: 'bg-green-500'
    }
  ]

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Lightbulb className="w-7 h-7 text-yellow-500" />
          새 아이디어
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          사업 아이디어를 입력하고 분석 방법을 선택하세요
        </p>
      </div>

      {/* Idea Input */}
      <div className="card mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          아이디어 / 키워드 / 문장
        </label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="예: 반려동물 건강관리 구독 서비스, AI 기반 맞춤형 영양제 추천 플랫폼, 시니어를 위한 디지털 리터러시 교육..."
          className="textarea h-32 mb-4"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              업종 (선택)
            </label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="예: 헬스케어, 에듀테크"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              태그 (선택)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="예: B2C, 모바일, 구독"
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          분석 방법 선택
        </h2>
        {modes.map(({ mode, icon: Icon, title, desc, color }) => (
          <button
            key={mode}
            onClick={() => handleSubmit(mode)}
            disabled={!idea.trim()}
            className="w-full card flex items-center gap-4 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  )
}
