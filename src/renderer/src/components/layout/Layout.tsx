import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ToastContainer from '../ui/ToastContainer'
import { useAppStore } from '../../stores/useAppStore'

export default function Layout() {
  const { loadSettings } = useAppStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Outlet />
        </div>
      </main>
      <ToastContainer />
    </div>
  )
}
