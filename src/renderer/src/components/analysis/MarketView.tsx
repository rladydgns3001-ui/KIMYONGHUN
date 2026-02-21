import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MarketAnalysis } from '../../../../shared/schemas'

export default function MarketView({ data }: { data: unknown }) {
  const d = data as MarketAnalysis

  const impactIcons = {
    positive: <TrendingUp className="w-4 h-4 text-green-500" />,
    negative: <TrendingDown className="w-4 h-4 text-red-500" />,
    neutral: <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Market Fit Score */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">시장 적합성 점수</h3>
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={d.market_fit_score >= 70 ? '#22c55e' : d.market_fit_score >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10"
                strokeDasharray={`${(d.market_fit_score / 100) * 314} 314`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{d.market_fit_score}</span>
            </div>
          </div>
          <p className="flex-1 text-gray-600 dark:text-gray-300">{d.market_fit_reasoning}</p>
        </div>
      </div>

      {/* TAM/SAM/SOM */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">시장 규모</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'TAM (전체시장)', data: d.tam, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
            { label: 'SAM (유효시장)', data: d.sam, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
            { label: 'SOM (수익가능)', data: d.som, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' }
          ].map((item) => (
            <div key={item.label} className={`p-4 rounded-xl ${item.color}`}>
              <p className="text-xs font-medium mb-1">{item.label}</p>
              <p className="text-xl font-bold mb-2">{item.data.value}</p>
              <p className="text-xs opacity-80">{item.data.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trends */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">시장 트렌드</h3>
        <div className="space-y-3">
          {d.trends.map((trend, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {impactIcons[trend.impact]}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{trend.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{trend.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">요약</h3>
        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{d.summary}</p>
      </div>
    </div>
  )
}
