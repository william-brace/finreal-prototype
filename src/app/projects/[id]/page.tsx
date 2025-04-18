'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { getProject } from "@/lib/mock-data"
import { useEffect, useState, use } from "react"
import { Project } from "@/lib/mock-data"

export default function ProjectDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id)
        setProject(data || null)
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (!project) {
    return <div className="container mx-auto py-8">Project not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{project.name}</h1>
        <div className="flex gap-4">
          <Link href={`/projects/${id}/edit`}>
            <Button variant="outline">Edit Project</Button>
          </Link>
          <Link href={`/projects/${id}/proformas/new`}>
            <Button>New Proforma</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{project.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Proforma Type</p>
                  <p className="font-medium">{project.proformaType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stories</p>
                  <p className="font-medium">{project.stories}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GBA (sqft)</p>
                  <p className="font-medium">{project.gba.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Land Cost</p>
                  <p className="font-medium">${project.landCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project Length (months)</p>
                  <p className="font-medium">{project.projectLength}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absorption Period (months)</p>
                  <p className="font-medium">{project.absorptionPeriod}</p>
                </div>
              </div>
              {project.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{project.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Proformas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.proformas.map((proforma) => (
                  <Link
                    key={proforma.id}
                    href={`/projects/${params.id}/proformas/${proforma.id}`}
                    className="block"
                  >
                    <Card className="hover:bg-accent transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{proforma.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Last updated: {proforma.lastUpdated}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${proforma.totalCost.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              ROI: {proforma.roi}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {project.proformas.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No proformas yet. Create one to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 