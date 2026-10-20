import { useEffect, useState } from 'react'

export type Route =
  | { page: 'home'; section?: string }
  | { page: 'project'; slug: string }

export function parseRoute(hash: string): Route {
  const projectMatch = hash.match(/^#\/projects\/([\w-]+)/)
  if (projectMatch) return { page: 'project', slug: projectMatch[1] }
  if (hash === '#/projects') return { page: 'home', section: 'projects' }
  return { page: 'home' }
}

export function useHashRoute(): Route {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return parseRoute(hash)
}
