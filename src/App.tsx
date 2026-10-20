import { Analytics } from '@vercel/analytics/react'
import EnhancedPortfolio from './components/EnhancedPortfolio'
import ProjectPage from './components/projects/ProjectPage'
import { PROJECTS } from './data/projects'
import { useHashRoute } from './router'

function App() {
  const route = useHashRoute()
  const project = route.page === 'project' ? PROJECTS.find((p) => p.slug === route.slug) : undefined

  return (
    <>
      {project ? (
        <ProjectPage key={project.slug} project={project} />
      ) : (
        <EnhancedPortfolio initialSection={route.page === 'home' ? route.section : undefined} />
      )}
      <Analytics />
    </>
  )
}

export default App
