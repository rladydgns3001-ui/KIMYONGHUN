import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { RiskAnalysis } from '../../../../shared/schemas'

export default function RiskView({ data }: { data: unknown }) {
  const d = data as RiskAnalysis

  const categoryLabels: Record<string, string> = {
    market: '시장',
    technical: '기술',
    financial: '재무',
    legal: '법률',
    operational: '운영',
    competitive: '경쟁'
  }

  const overallColors: Record<string, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }

  const decisionColors: Record<string, string> = {
    go: 'bg-green-500',
    conditional_go: 'bg-yellow-500',
    no_go: 'bg-red-500'
  }

  const decisionLabels: Record<string, string> = {
    go: 'GO - 진행',
    conditional_go: '조건부 진행',
    no_go: 'NO-GO - 중단'
  }

  // Risk matrix data
  const matrixData = d.risks.map((r) => ({
    name: r.name,
    probability: r.probability,
    impact: r.impact,
    score: r.risk_score
  }))

  const getCellColor = (score: number): string => {
    if (score >= 15) return '#ef4444'
    if (score >= 10) return '#f97316'
    if (score >= 5) return '#eab308'
    return '#22c55e'
  }

  return (
    <div className="space-y-6">
      {/* Overall Risk & Go/No-Go */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">전체 리스크 수준</h3>
          <span className={`px-4 py-2 rounded-full text-lg font-bold ${overallColors[d.overall_risk_level]}`}>
            {d.overall_risk_level === 'low' ? '낮음' :
              d.overall_risk_level === 'medium' ? '보통' :
                d.overall_risk_level === 'high' ? '높음' : '심각'}
          </span>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Go/No-Go 판단</h3>
          <div className="flex items-center gap-3 mb-2">
            <span className={`w-4 h-4 rounded-full ${decisionColors[d.go_no_go.decision]}`} />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {decisionLabels[d.go_no_go.decision]}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{d.go_no_go.reasoning}</p>
          {d.go_no_go.conditions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 mb-1">조건:</p>
              <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                {d.go_no_go.conditions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Risk Matrix Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">리스크 매트릭스</h3>
        <div className="mb-2 text-xs text-gray-500 flex justify-between">
          <span>X축: 발생 확률</span>
          <span>Y축: 영향도</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="probability" domain={[0, 5]} name="발생확률" />
            <YAxis type="number" dataKey="impact" domain={[0, 5]} name="영향도" />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const item = payload[0].payload as typeof matrixData[0]
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow text-sm border">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">점수: {item.score}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter data={matrixData}>
              {matrixData.map((entry, index) => (
                <Cell key={index} fill={getCellColor(entry.score)} r={8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Risk List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">리스크 목록</h3>
        <div className="space-y-4">
          {d.risks.map((risk, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{risk.name}</h4>
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-xs rounded">
                    {categoryLabels[risk.category]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>확률: {risk.probability}</span>
                  <span>영향: {risk.impact}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    risk.risk_score >= 15 ? 'bg-red-100 text-red-700' :
                      risk.risk_score >= 10 ? 'bg-orange-100 text-orange-700' :
                        risk.risk_score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                  }`}>
                    점수: {risk.risk_score}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{risk.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="font-medium text-blue-700 dark:text-blue-300">완화 계획</p>
                  <p className="text-blue-600 dark:text-blue-400">{risk.mitigation_plan}</p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <p className="font-medium text-orange-700 dark:text-orange-300">대응 계획</p>
                  <p className="text-orange-600 dark:text-orange-400">{risk.contingency_plan}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">완화 우선순위</h3>
        <div className="space-y-2">
          {d.risk_mitigation_priority.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                {p.priority}
              </span>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{p.risk_name}</p>
                <p className="text-xs text-gray-500">{p.immediate_action}</p>
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
