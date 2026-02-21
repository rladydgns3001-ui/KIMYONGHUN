import type { RoadmapAnalysis } from '../../../../shared/schemas'

export default function RoadmapView({ data }: { data: unknown }) {
  const d = data as RoadmapAnalysis

  const effortColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }

  return (
    <div className="space-y-6">
      {/* Phases */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">실행 단계</h3>
        <div className="space-y-6">
          {d.phases.map((phase, i) => (
            <div key={i} className="relative pl-8 pb-6 last:pb-0">
              {/* Timeline line */}
              {i < d.phases.length - 1 && (
                <div className="absolute left-3 top-8 w-0.5 h-full bg-primary-200 dark:bg-primary-800" />
              )}
              {/* Timeline dot */}
              <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{phase.name}</h4>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded">
                    {phase.duration}
                  </span>
                </div>

                {/* Goals */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">목표</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.goals.map((g, j) => (
                      <span key={j} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">마일스톤</p>
                  <div className="space-y-2">
                    {phase.milestones.map((ms, j) => (
                      <div key={j} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{ms.name}</p>
                          <span className="text-xs text-gray-500">{ms.deadline}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ms.deliverables.map((del, k) => (
                            <span key={k} className="text-xs text-gray-400">{del}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">필요 리소스</p>
                  <div className="flex flex-wrap gap-1">
                    {phase.resources_needed.map((r, j) => (
                      <span key={j} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Composition */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">팀 구성</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">역할</th>
                <th className="text-center py-2">인원</th>
                <th className="text-left py-2">채용 시기</th>
                <th className="text-left py-2">핵심 역량</th>
              </tr>
            </thead>
            <tbody>
              {d.team_composition.map((t, i) => (
                <tr key={i} className="border-b dark:border-gray-700/50">
                  <td className="py-2 font-medium">{t.role}</td>
                  <td className="py-2 text-center">{t.count}명</td>
                  <td className="py-2 text-gray-500">{t.timing}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {t.key_skills.map((s, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Wins */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Win</h3>
        <div className="space-y-2">
          {d.quick_wins.map((qw, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{qw.action}</p>
                <p className="text-xs text-gray-500">{qw.impact} / {qw.timeline}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${effortColors[qw.effort]}`}>
                노력: {qw.effort === 'low' ? '낮음' : qw.effort === 'medium' ? '보통' : '높음'}
              </span>
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
