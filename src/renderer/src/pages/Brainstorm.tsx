import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Sparkles, ArrowLeft, Check, Loader2 } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAppStore } from '../stores/useAppStore'
import type { BrainstormIdea } from '../../../shared/types'

export default function Brainstorm() {
  const [ideas, setIdeas] = useState<BrainstormIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { createProject } = useProjectStore()
  const { addToast } = useAppStore()

  const { idea, industry, tags } = (location.state as { idea: string; industry: string; tags: string }) || {}

  useEffect(() => {
    if (!idea) {
      navigate('/new')
      return
    }

    const fetchIdeas = async () => {
      try {
        const result = await window.api.brainstorm(idea)
        setIdeas(result)
      } catch (error) {
        addToast('error', error instanceof Error ? error.message : '브레인스토밍 중 오류가 발생했습니다.')
        navigate('/new')
      } finally {
        setLoading(false)
      }
    }
    fetchIdeas()
  }, [idea, navigate, addToast])

  const handleSelect = async () => {
    if (selectedIndex === null) return
    const selected = ideas[selectedIndex]

    const project = await createProject({
      title: selected.title,
      description: `${selected.description}\n\n타겟 시장: ${selected.target_market}\n고유 가치: ${selected.unique_value}`,
      industry: industry || '',
      tags: tags || ''
    })

    navigate(`/project/${project.id}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">AI가 아이디어를 확장하고 있습니다...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">잠시만 기다려주세요</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/new')} className="btn-secondary p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-purple-500" />
            브레인스토밍
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI가 제안한 사업 아이디어 중 하나를 선택하세요
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
        원본 아이디어: "{idea}"
      </div>

      <div className="grid gap-4 mb-6">
        {ideas.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`card cursor-pointer transition-all ${
              selectedIndex === index
                ? 'ring-2 ring-primary-500 shadow-md'
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description}</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    <strong>타겟:</strong> {item.target_market}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    <strong>가치:</strong> {item.unique_value}
                  </span>
                </div>
              </div>
              {selectedIndex === index && (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 ml-4">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSelect}
          disabled={selectedIndex === null}
          className="btn-primary flex items-center gap-2"
        >
          선택한 아이디어로 분석 시작
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
