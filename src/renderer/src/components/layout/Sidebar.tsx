import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  Settings,
  Lightbulb,
  BarChart3,
  CheckSquare
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/tasks', icon: CheckSquare, label: '오늘의 할 일' },
  { to: '/new', icon: PlusCircle, label: '새 아이디어' },
  { to: '/settings', icon: Settings, label: '설정' }
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">BizPlan AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">아이디어 사업화 분석</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <BarChart3 className="w-4 h-4" />
          <span>Powered by Claude AI</span>
        </div>
      </div>
    </aside>
  )
}
