import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { FinancialAnalysis } from '../../../../shared/schemas'

export default function FinancialView({ data }: { data: unknown }) {
  const d = data as FinancialAnalysis

  const chartData = d.revenue_projection.map((item) => ({
    name: `${item.month}월`,
    매출: item.revenue,
    비용: item.costs,
    손익: item.profit
  }))

  return (
    <div className="space-y-6">
      {/* Initial Investment */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">초기 투자</h3>
        <p className="text-3xl font-bold text-primary-600 mb-4">{d.initial_investment.total}</p>
        <div className="space-y-2">
          {d.initial_investment.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{item.category}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <span className="font-medium text-sm">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Costs */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">월 비용</h3>
        <p className="text-2xl font-bold text-orange-600 mb-4">{d.monthly_costs.total}/월</p>
        <div className="grid grid-cols-2 gap-2">
          {d.monthly_costs.breakdown.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
              <span className="text-sm font-medium">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Projection Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">12개월 재무 전망</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number) => value.toLocaleString() + '원'} />
            <Legend />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="매출" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="비용" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="손익" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Break-even */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">손익분기점</h3>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-emerald-600">{d.break_even.month}월</span>
          </div>
          <p className="flex-1 text-gray-600 dark:text-gray-300">{d.break_even.description}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">핵심 지표</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-xs text-blue-600 dark:text-blue-400">고객 생애 가치 (LTV)</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{d.key_metrics.ltv}</p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
            <p className="text-xs text-orange-600 dark:text-orange-400">고객 획득 비용 (CAC)</p>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{d.key_metrics.cac}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-xs text-green-600 dark:text-green-400">LTV/CAC 비율</p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">{d.key_metrics.ltv_cac_ratio}</p>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
            <p className="text-xs text-violet-600 dark:text-violet-400">매출총이익률</p>
            <p className="text-xl font-bold text-violet-700 dark:text-violet-300">{d.key_metrics.gross_margin}</p>
          </div>
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
