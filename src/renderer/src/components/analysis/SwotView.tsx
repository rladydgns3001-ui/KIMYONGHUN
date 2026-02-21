import type { SwotAnalysis } from '../../../../shared/schemas'

export default function SwotView({ data }: { data: unknown }) {
  const d = data as SwotAnalysis

  const crossLabels: Record<string, string> = {
    SO: 'SO 전략 (강점+기회)',
    WO: 'WO 전략 (약점+기회)',
    ST: 'ST 전략 (강점+위협)',
    WT: 'WT 전략 (약점+위협)'
  }

  return (
    <div className="space-y-6">
      {/* SWOT Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="card border-l-4 border-l-blue-500">
          <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-3">강점 (S)</h3>
          <div className="space-y-3">
            {d.strengths.map((s, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{s.factor}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.description}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  활용 전략: {s.leverage_strategy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="card border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">약점 (W)</h3>
          <div className="space-y-3">
            {d.weaknesses.map((w, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{w.factor}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{w.description}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  보완 전략: {w.mitigation_strategy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="card border-l-4 border-l-green-500">
          <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">기회 (O)</h3>
          <div className="space-y-3">
            {d.opportunities.map((o, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{o.factor}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{o.description}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  포착 전략: {o.capture_strategy}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Threats */}
        <div className="card border-l-4 border-l-orange-500">
          <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-3">위협 (T)</h3>
          <div className="space-y-3">
            {d.threats.map((t, i) => (
              <div key={i}>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{t.factor}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.description}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  방어 전략: {t.defense_strategy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cross Analysis */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">SWOT 교차 분석</h3>
        <div className="grid grid-cols-2 gap-3">
          {d.cross_analysis.map((ca, i) => {
            const colors: Record<string, string> = {
              SO: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
              WO: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
              ST: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800',
              WT: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            }

            return (
              <div key={i} className={`p-4 rounded-xl border ${colors[ca.type]}`}>
                <p className="text-xs font-medium text-gray-500 mb-1">{crossLabels[ca.type]}</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{ca.strategy}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{ca.description}</p>
              </div>
            )
          })}
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
