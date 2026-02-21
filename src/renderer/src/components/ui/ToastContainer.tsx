import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="w-5 h-5 text-green-500" />,
          error: <AlertCircle className="w-5 h-5 text-red-500" />,
          info: <Info className="w-5 h-5 text-blue-500" />
        }
        const bgColors = {
          success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
          error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
          info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[450px] ${bgColors[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="flex-1 text-sm text-gray-800 dark:text-gray-200">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
