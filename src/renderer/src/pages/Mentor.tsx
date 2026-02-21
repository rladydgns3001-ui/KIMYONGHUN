import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MessageCircle, ArrowLeft, Send, ArrowRight, Loader2 } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAppStore } from '../stores/useAppStore'
import type { MentorMessage } from '../../../shared/types'

export default function Mentor() {
  const [messages, setMessages] = useState<MentorMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
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

    const startConversation = async () => {
      try {
        const response = await window.api.mentorChat([], idea)
        setMessages([{ role: 'assistant', content: response }])
      } catch (error) {
        addToast('error', error instanceof Error ? error.message : '멘토 대화 시작 중 오류가 발생했습니다.')
      } finally {
        setInitialLoading(false)
      }
    }
    startConversation()
  }, [idea, navigate, addToast])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: MentorMessage = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await window.api.mentorChat(newMessages, idea)
      setMessages([...newMessages, { role: 'assistant', content: response }])
    } catch (error) {
      addToast('error', '응답을 받지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    const fullDescription = messages
      .map((m) => `${m.role === 'user' ? '사용자' : 'AI 멘토'}: ${m.content}`)
      .join('\n\n')

    const project = await createProject({
      title: idea.slice(0, 50),
      description: `${idea}\n\n--- 멘토 대화 정리 ---\n${fullDescription}`,
      industry: industry || '',
      tags: tags || ''
    })

    navigate(`/project/${project.id}`)
  }

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg text-gray-600 dark:text-gray-400">AI 멘토가 준비 중입니다...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/new')} className="btn-secondary p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-green-500" />
              멘토 모드
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI 멘토와 대화하며 아이디어를 구체화하세요
            </p>
          </div>
        </div>
        <button onClick={handleFinish} className="btn-primary flex items-center gap-2">
          분석 시작
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="메시지를 입력하세요..."
          className="input flex-1"
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary p-3">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
