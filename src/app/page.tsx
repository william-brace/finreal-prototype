'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getProjects } from "@/lib/session-storage"
import { Project } from "@/lib/mock-data"

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = () => {
      try {
        const projects = getProjects()
        setProjects(projects)
      } catch (error) {
        console.error("Error loading projects:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Projects</h2>
        <Button asChild>
          <Link href="/projects/new">Create New Project</Link>
        </Button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      ) : projects.length === 0 ? (
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
  )
}
