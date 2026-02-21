import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Trash2, ChevronRight, TrendingUp, FolderOpen } from 'lucide-react'
import { useProjectStore } from '../stores/useProjectStore'
import { useAppStore } from '../stores/useAppStore'
import type { Project } from '../../../shared/types'

export default function Dashboard() {
  const { projects, loadProjects, deleteProject } = useProjectStore()
  const { addToast } = useAppStore()
  const navigate = useNavigate()

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    if (confirm(`"${project.title}" 프로젝트를 삭제하시겠습니까?`)) {
      await deleteProject(project.id)
      addToast('info', '프로젝트가 삭제되었습니다.')
    }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    analyzing: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  }

  const statusLabels: Record<string, string> = {
    draft: '초안',
    analyzing: '분석 중',
    completed: '완료'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">대시보드</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {projects.length}개의 프로젝트
          </p>
        </div>
        <button onClick={() => navigate('/new')} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-5 h-5" />
          새 아이디어
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16">
          <FolderOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            아직 프로젝트가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            새 아이디어를 입력하여 사업 분석을 시작하세요
          </p>
          <button onClick={() => navigate('/new')} className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            시작하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="card cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
                <button
                  onClick={(e) => handleDelete(e, project)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                {project.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{project.industry || '업종 미설정'}</span>
                <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400">
                  <span>상세보기</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
