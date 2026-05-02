import React from 'react'
import { useStore } from './store.js'
import PortfolioDashboard from './PortfolioDashboard.jsx'
import ProjectWizard from './ProjectWizard.jsx'

export default function App() {
  const view = useStore(s => s.view)
  return (
    <div className="min-h-screen bg-dark-900 font-arabic">
      {view === 'portfolio' ? <PortfolioDashboard /> : <ProjectWizard />}
    </div>
  )
}
