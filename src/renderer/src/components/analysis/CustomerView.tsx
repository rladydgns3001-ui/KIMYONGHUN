import type { CustomerAnalysis } from '../../../../shared/schemas'

export default function CustomerView({ data }: { data: unknown }) {
  const d = data as CustomerAnalysis

  const effectivenessColors = {
    high: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
    low: 'text-red-600 bg-red-100 dark:bg-red-900/30'
  }

  return (
    <div className="space-y-6">
      {/* Primary Persona */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">주요 페르소나</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">이름</p>
            <p className="font-medium text-gray-900 dark:text-white">{d.primary_persona.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">연령대</p>
            <p className="font-medium text-gray-900 dark:text-white">{d.primary_persona.age_range}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">직업</p>
            <p className="font-medium text-gray-900 dark:text-white">{d.primary_persona.occupation}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">소득 수준</p>
            <p className="font-medium text-gray-900 dark:text-white">{d.primary_persona.income_level}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">주요 고충</p>
            <div className="flex flex-wrap gap-2">
              {d.primary_persona.pain_points.map((p, i) => (
                <span key={i} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded-full">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">목표</p>
            <div className="flex flex-wrap gap-2">
              {d.primary_persona.goals.map((g, i) => (
                <span key={i} className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">행동 패턴</p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {d.primary_persona.behavior_patterns.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Secondary Personas */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">보조 페르소나</h3>
        <div className="grid gap-3">
          {d.secondary_personas.map((p, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                <span className="text-xs text-gray-500">{p.size_percentage}%</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demographics & Psychographics */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">인구통계</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">연령</span><span>{d.demographics.age}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">성별</span><span>{d.demographics.gender}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">지역</span><span>{d.demographics.location}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">학력</span><span>{d.demographics.education}</span></div>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">심리통계</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-500">라이프스타일:</span> {d.psychographics.lifestyle}</div>
            <div>
              <span className="text-gray-500">가치관:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {d.psychographics.values.map((v, i) => (
                  <span key={i} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAC */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">고객 획득 비용</h3>
        <p className="text-2xl font-bold text-primary-600 mb-4">{d.customer_acquisition_cost.estimated_cac}</p>
        <div className="space-y-2">
          {d.customer_acquisition_cost.channels.map((ch, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <span className="font-medium text-sm">{ch.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{ch.cost}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${effectivenessColors[ch.effectiveness]}`}>
                  {ch.effectiveness === 'high' ? '높음' : ch.effectiveness === 'medium' ? '보통' : '낮음'}
                </span>
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
