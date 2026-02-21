import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { CompetitionAnalysis } from '../../../../shared/schemas'

export default function CompetitionView({ data }: { data: unknown }) {
  const d = data as CompetitionAnalysis

  const threatColors = {
    high: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    low: 'text-green-600 bg-green-100 dark:bg-green-900/30'
  }

  const feasibilityColors = {
    high: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    low: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  }

  // Positioning map data
  const positionData = [
    { name: '우리', x: d.positioning.our_position.x, y: d.positioning.our_position.y, fill: '#3b82f6' },
    ...d.positioning.competitor_positions.map((cp) => ({
      name: cp.name, x: cp.x, y: cp.y, fill: '#ef4444'
    }))
  ]

  return (
    <div className="space-y-6">
      {/* Direct Competitors */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">직접 경쟁자</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2 px-3">경쟁자</th>
                <th className="text-left py-2 px-3">강점</th>
                <th className="text-left py-2 px-3">약점</th>
                <th className="text-left py-2 px-3">시장점유율</th>
                <th className="text-left py-2 px-3">가격</th>
              </tr>
            </thead>
            <tbody>
              {d.direct_competitors.map((c, i) => (
                <tr key={i} className="border-b dark:border-gray-700/50">
                  <td className="py-3 px-3">
                    <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <ul className="space-y-1">
                      {c.strengths.map((s, j) => (
                        <li key={j} className="text-xs text-green-600 dark:text-green-400">+ {s}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-3">
                    <ul className="space-y-1">
                      {c.weaknesses.map((w, j) => (
                        <li key={j} className="text-xs text-red-600 dark:text-red-400">- {w}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-3 px-3 text-center">{c.market_share}</td>
                  <td className="py-3 px-3">{c.pricing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indirect Competitors */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">간접 경쟁자</h3>
        <div className="space-y-2">
          {d.indirect_competitors.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${threatColors[c.threat_level]}`}>
                위협: {c.threat_level === 'high' ? '높음' : c.threat_level === 'medium' ? '보통' : '낮음'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Positioning Map */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">포지셔닝 맵</h3>
        <div className="mb-2 text-xs text-gray-500 flex justify-between">
          <span>X축: {d.positioning.x_axis}</span>
          <span>Y축: {d.positioning.y_axis}</span>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" domain={[0, 100]} name={d.positioning.x_axis} />
            <YAxis type="number" dataKey="y" domain={[0, 100]} name={d.positioning.y_axis} />
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length > 0) {
                  const item = payload[0].payload as typeof positionData[0]
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2 rounded shadow text-sm border">
                      <p className="font-medium">{item.name}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter data={positionData} fill="#3b82f6">
              {positionData.map((entry, index) => (
                <text key={index} x={0} y={0} textAnchor="middle" fill="#666" fontSize={10}>
                  {/* Labels handled by tooltip */}
                </text>
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> 우리
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" /> 경쟁자
          </span>
        </div>
      </div>

      {/* Differentiation */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">차별화 전략</h3>
        <div className="space-y-3">
          {d.differentiation_strategy.map((ds, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white">{ds.area}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${feasibilityColors[ds.feasibility]}`}>
                  실현성: {ds.feasibility === 'high' ? '높음' : ds.feasibility === 'medium' ? '보통' : '낮음'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ds.strategy}</p>
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
