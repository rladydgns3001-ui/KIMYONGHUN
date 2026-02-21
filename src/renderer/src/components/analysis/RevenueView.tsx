import type { RevenueAnalysis } from '../../../../shared/schemas'

export default function RevenueView({ data }: { data: unknown }) {
  const d = data as RevenueAnalysis

  return (
    <div className="space-y-6">
      {/* Primary Model */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">주요 수익 모델</h3>
        <div className="mb-4">
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
            {d.primary_model.type}
          </span>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{d.primary_model.description}</p>
        </div>

        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">가격 티어</h4>
        <div className="grid gap-3">
          {d.primary_model.pricing_tiers.map((tier, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 dark:text-white">{tier.name}</h5>
                <span className="text-lg font-bold text-primary-600">{tier.price}</span>
              </div>
              <ul className="space-y-1">
                {tier.features.map((f, j) => (
                  <li key={j} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Models */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">보조 수익 모델</h3>
        <div className="space-y-3">
          {d.secondary_models.map((m, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white">{m.type}</p>
                <span className="text-xs text-gray-500">{m.potential_revenue_share}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{m.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Strategy */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">가격 전략</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">접근법</p>
            <p className="text-gray-900 dark:text-white">{d.pricing_strategy.approach}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">근거</p>
            <p className="text-gray-600 dark:text-gray-300">{d.pricing_strategy.justification}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">경쟁사 비교</p>
            <p className="text-gray-600 dark:text-gray-300">{d.pricing_strategy.competitive_comparison}</p>
          </div>
        </div>
      </div>

      {/* Monetization Timeline */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">수익화 타임라인</h3>
        <div className="relative">
          {d.monetization_timeline.map((phase, i) => (
            <div key={i} className="flex gap-4 mb-4 last:mb-0">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                {i < d.monetization_timeline.length - 1 && (
                  <div className="w-0.5 flex-1 bg-primary-200 dark:bg-primary-800 mt-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white">{phase.phase}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {phase.period}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{phase.revenue_source}</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{phase.expected_revenue}</p>
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
