import { useEffect, useState } from 'react'
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Plus,
  X,
  Loader2,
  Lightbulb,
  AlertTriangle,
  RefreshCw,
  Heart,
  PlayCircle,
  SkipForward
} from 'lucide-react'
import { useTaskStore } from '../stores/useTaskStore'
import { useProjectStore } from '../stores/useProjectStore'
import { useAppStore } from '../stores/useAppStore'
import type { DailyTask } from '../../../shared/types'

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
}

const priorityLabels: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음'
}

const categoryLabels: Record<string, string> = {
  market: '시장',
  customer: '고객',
  finance: '재무',
  tech: '기술',
  legal: '법률',
  operations: '운영',
  marketing: '마케팅',
  general: '일반'
}

const suggestionStyles: Record<string, { bg: string; icon: typeof Lightbulb; label: string }> = {
  tip: { bg: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800', icon: Lightbulb, label: '팁' },
  warning: { bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800', icon: AlertTriangle, label: '주의' },
  pivot: { bg: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800', icon: RefreshCw, label: '방향 제안' },
  encouragement: { bg: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800', icon: Heart, label: '격려' }
}

export default function DailyTasks() {
  const {
    tasks, suggestions, selectedDate, generating, generatingSuggestions,
    setSelectedDate, loadTasks, updateTask, createTask, deleteTask,
    generateTasks, loadSuggestions, dismissSuggestion, generateSuggestions
  } = useTaskStore()
  const { projects, loadProjects } = useProjectStore()
  const { addToast } = useAppStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium' as 'high' | 'medium' | 'low',
    estimated_hours: 1,
    project_id: 0
  })

  useEffect(() => {
    loadProjects()
    loadTasks(selectedDate)
    loadSuggestions()
  }, [])

  // Group tasks by project
  const tasksByProject = tasks.reduce<Record<string, (DailyTask & { project_title: string })[]>>((acc, task) => {
    const key = task.project_title
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {})

  const completedCount = tasks.filter((t) => t.status === 'completed').length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const getLocalDateString = (date: Date = new Date()): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const navigateDate = (direction: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const date = new Date(y, m - 1, d + direction)
    setSelectedDate(getLocalDateString(date))
  }

  const isToday = selectedDate === getLocalDateString()

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const days = ['일', '월', '화', '수', '목', '금', '토']
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
  }

  const handleStatusToggle = async (task: DailyTask & { project_title: string }) => {
    const nextStatus: Record<string, string> = {
      pending: 'in_progress',
      in_progress: 'completed',
      completed: 'pending',
      skipped: 'pending'
    }
    await updateTask(task.id, { status: nextStatus[task.status] as DailyTask['status'] })
  }

  const handleGenerate = async () => {
    if (projects.length === 0) {
      addToast('error', '프로젝트가 없습니다. 먼저 프로젝트를 생성하세요.')
      return
    }
    try {
      await generateTasks()
      addToast('success', 'AI가 오늘의 과제를 생성했습니다!')
    } catch (err) {
      addToast('error', '과제 생성에 실패했습니다. API 키를 확인하세요.')
    }
  }

  const handleGenerateSuggestions = async () => {
    try {
      await generateSuggestions()
      addToast('success', 'AI 인사이트가 생성되었습니다!')
    } catch (err) {
      addToast('error', '제안 생성에 실패했습니다.')
    }
  }

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.project_id) {
      addToast('error', '제목과 프로젝트를 선택하세요.')
      return
    }
    try {
      await createTask({
        ...newTask,
        due_date: selectedDate,
        ai_generated: 0
      })
      setNewTask({ title: '', description: '', category: 'general', priority: 'medium', estimated_hours: 1, project_id: 0 })
      setShowAddForm(false)
      addToast('success', '과제가 추가되었습니다.')
    } catch {
      addToast('error', '과제 추가에 실패했습니다.')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTask(id)
      addToast('info', '과제가 삭제되었습니다.')
    } catch {
      addToast('error', '과제 삭제에 실패했습니다.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <PlayCircle className="w-5 h-5 text-blue-500" />
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-gray-400" />
      default:
        return <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">오늘의 할 일</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            AI가 분석 결과를 바탕으로 생성한 실행 과제
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateSuggestions}
            disabled={generatingSuggestions}
            className="btn-secondary flex items-center gap-2"
          >
            {generatingSuggestions ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            AI 인사이트
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI 과제 생성
          </button>
        </div>
      </div>

      {/* Date Navigation + Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigateDate(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(selectedDate)}
              </span>
              {isToday && (
                <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full text-xs font-medium">
                  오늘
                </span>
              )}
            </div>
            <button onClick={() => navigateDate(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(getLocalDateString())}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline ml-2"
              >
                오늘로 이동
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">{completedCount}</span>
              /{totalCount} 완료
            </div>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {suggestions.map((suggestion) => {
            const style = suggestionStyles[suggestion.type] || suggestionStyles.tip
            const IconComp = style.icon
            return (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border ${style.bg} relative group`}
              >
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-3">
                  <IconComp className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                        {style.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                    <p className="text-xs opacity-80 leading-relaxed">{suggestion.content}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Task List by Project */}
      {totalCount === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            오늘의 과제가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
            AI 과제 생성 버튼을 눌러 오늘의 할 일을 만들거나,<br />
            직접 과제를 추가하세요
          </p>
          <div className="flex gap-3">
            <button onClick={handleGenerate} disabled={generating} className="btn-primary flex items-center gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI 과제 생성
            </button>
            <button onClick={() => setShowAddForm(true)} className="btn-secondary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              직접 추가
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByProject).map(([projectTitle, projectTasks]) => (
            <div key={projectTitle} className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
                {projectTitle}
                <span className="text-xs text-gray-400 font-normal">
                  ({projectTasks.filter((t) => t.status === 'completed').length}/{projectTasks.length})
                </span>
              </h3>
              <div className="space-y-2">
                {projectTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      task.status === 'completed'
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <button onClick={() => handleStatusToggle(task)} className="flex-shrink-0">
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${
                          task.status === 'completed'
                            ? 'line-through text-gray-400 dark:text-gray-500'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          {categoryLabels[task.category] || task.category}
                        </span>
                        {task.ai_generated === 1 && (
                          <Sparkles className="w-3 h-3 text-purple-400" />
                        )}
                      </div>
                      {task.description && (
                        <p className={`text-xs mt-1 ${
                          task.status === 'completed'
                            ? 'text-gray-300 dark:text-gray-600'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {task.estimated_hours}h
                      </span>
                      {task.completed_at && (
                        <span className="text-xs text-green-500">
                          {new Date(task.completed_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Button */}
      {totalCount > 0 && !showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-400 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          과제 추가
        </button>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <div className="card mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">새 과제 추가</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">프로젝트</label>
              <select
                value={newTask.project_id}
                onChange={(e) => setNewTask({ ...newTask, project_id: Number(e.target.value) })}
                className="input-field"
              >
                <option value={0}>프로젝트 선택...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="과제 제목을 입력하세요"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">설명</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="과제에 대한 설명 (선택)"
                className="input-field"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">카테고리</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  className="input-field"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">우선순위</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="input-field"
                >
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">예상 시간</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={newTask.estimated_hours}
                  onChange={(e) => setNewTask({ ...newTask, estimated_hours: Number(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAddForm(false)} className="btn-secondary">
                취소
              </button>
              <button onClick={handleAddTask} className="btn-primary">
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
