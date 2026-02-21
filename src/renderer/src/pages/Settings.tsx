import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Key, Cpu, Palette, BarChart3, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useAppStore } from '../stores/useAppStore'
import type { Settings as SettingsType } from '../../../shared/types'

export default function Settings() {
  const { settings, setSettings, addToast } = useAppStore()
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-20250514')
  const [theme, setTheme] = useState<SettingsType['theme']>('light')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [usage, setUsage] = useState<{ total_cost: number; total_input_tokens: number; total_output_tokens: number } | null>(null)

  useEffect(() => {
    if (settings) {
      setApiKey(settings.api_key)
      setModel(settings.preferred_model)
      setTheme(settings.theme)
    }
    loadUsage()
  }, [settings])

  const loadUsage = async () => {
    try {
      const u = await window.api.getTotalUsage()
      setUsage(u)
    } catch {
      // ignore
    }
  }

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      addToast('error', 'API 키를 입력하세요.')
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const result = await window.api.testApiKey(apiKey)
      setTestResult(result.success ? 'success' : 'error')
      if (result.success) {
        addToast('success', 'API 연결 성공!')
      } else {
        addToast('error', `API 연결 실패: ${result.error}`)
      }
    } catch {
      setTestResult('error')
      addToast('error', 'API 테스트 중 오류가 발생했습니다.')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    try {
      const updated = await window.api.updateSettings({
        api_key: apiKey,
        preferred_model: model,
        theme
      })
      setSettings(updated)
      addToast('success', '설정이 저장되었습니다.')
    } catch {
      addToast('error', '설정 저장에 실패했습니다.')
    }
  }

  const models = [
    { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', desc: '빠르고 효율적 (권장)' },
    { value: 'claude-haiku-3-5-20241022', label: 'Claude Haiku 3.5', desc: '가장 빠르고 저렴' },
    { value: 'claude-opus-4-20250514', label: 'Claude Opus 4', desc: '가장 강력하고 정교' }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-8">
        <SettingsIcon className="w-7 h-7" />
        설정
      </h1>

      {/* API Key */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API 키</h2>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setTestResult(null) }}
            placeholder="sk-ant-api03-..."
            className="input flex-1"
          />
          <button
            onClick={handleTestApiKey}
            disabled={testing}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : testResult === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : testResult === 'error' ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : null}
            연결 테스트
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Anthropic Console에서 API 키를 발급받으세요. 키는 로컬에만 저장됩니다.
        </p>
      </div>

      {/* Model Selection */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI 모델</h2>
        </div>
        <div className="space-y-2">
          {models.map((m) => (
            <label
              key={m.value}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                model === m.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <input
                type="radio"
                name="model"
                value={m.value}
                checked={model === m.value}
                onChange={(e) => setModel(e.target.value)}
                className="accent-primary-600"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{m.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">테마</h2>
        </div>
        <div className="flex gap-2">
          {([['light', '라이트'], ['dark', '다크'], ['system', '시스템']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTheme(val)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                theme === val
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Usage */}
      {usage && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">사용량</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${usage.total_cost.toFixed(4)}
              </p>
              <p className="text-xs text-gray-500">총 비용</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(usage.total_input_tokens / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500">입력 토큰</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(usage.total_output_tokens / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-gray-500">출력 토큰</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <button onClick={handleSave} className="btn-primary w-full">
        설정 저장
      </button>
    </div>
  )
}
