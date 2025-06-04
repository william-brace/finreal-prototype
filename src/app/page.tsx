'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getProjects } from "@/lib/session-storage"
import { Project } from "@/lib/mock-data"

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const loadProjects = () => {
      const projects = getProjects()
      setProjects(projects)
    }

    loadProjects()
  }, [])

  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold">FinReal</h1>
            <nav>
              <Link href="/" className="text-sm font-medium">Dashboard</Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <img src="/placeholder-logo.png" alt="Logo" className="h-8 w-8 rounded-full" />
            <span className="text-sm font-medium">John Doe</span>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Projects</h2>
          <Button asChild>
            <Link href="/projects/new">Create New Project</Link>
          </Button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-lg text-gray-600 mb-4">No projects yet</p>
            <p className="text-sm text-gray-500 mb-6">Create your first project to get started.</p>
            <Button asChild>
              <Link href="/projects/new">Create New Project</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block"
              >
                <div className="bg-white rounded-lg border p-6 hover:bg-accent transition-colors">
                  <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{project.location}</p>
                  <div className="flex justify-between text-sm">
                    <span>Land Cost</span>
                    <span className="font-medium">${project.landCost.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
