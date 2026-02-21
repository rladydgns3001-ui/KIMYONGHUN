import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import NewProject from './pages/NewProject'
import ProjectDetail from './pages/ProjectDetail'
import AnalysisDetail from './pages/AnalysisDetail'
import Settings from './pages/Settings'
import Brainstorm from './pages/Brainstorm'
import Mentor from './pages/Mentor'
import Report from './pages/Report'
import DailyTasks from './pages/DailyTasks'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<DailyTasks />} />
        <Route path="/new" element={<NewProject />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/project/:id/analysis/:type" element={<AnalysisDetail />} />
        <Route path="/project/:id/report" element={<Report />} />
        <Route path="/brainstorm" element={<Brainstorm />} />
        <Route path="/mentor" element={<Mentor />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
