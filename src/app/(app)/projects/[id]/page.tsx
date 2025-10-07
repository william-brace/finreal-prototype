'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import { Project } from "@/lib/mock-data"
import { getProject, getProformas, saveProforma, Proforma, createNewProforma, deleteProforma } from "@/lib/session-storage"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

const formatLocation = (location: string) => {
  const parts = location.split(',')
  if (parts.length === 2) {
    return parts[0].trim() + ', ' + parts[1].trim().toUpperCase()
  }
  return location
}

const formatProformaType = (type: string) => {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function ProjectDetailsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [proformas, setProformas] = useState<Proforma[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedProformaType, setSelectedProformaType] = useState<string>('')

  useEffect(() => {
    const fetchData = () => {
      try {
        const projectData = getProject(id)
        const proformasData = getProformas(id)
        setProject(projectData || null)
        setProformas(proformasData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleCreateProforma = () => {
    if (!project || !selectedProformaType) return;
    const newProforma = createNewProforma(id, project.landCost, selectedProformaType);
    const proformas = getProformas(id);
    proformas.push(newProforma);
    saveProforma(id, newProforma);
    setShowCreateDialog(false);
    setSelectedProformaType('');
    router.push(`/projects/${id}/proformas/${newProforma.id}`);
  };

  const handleDeleteProforma = (e: React.MouseEvent, proformaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this proforma? This action cannot be undone.')) {
      deleteProforma(id, proformaId);
      const updatedProformas = getProformas(id);
      setProformas(updatedProformas);
    }
  };

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
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>New Proforma</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Proforma</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Proforma Type</label>
                  <Select value={selectedProformaType} onValueChange={setSelectedProformaType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select proforma type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="purpose-built-rental">Purpose Built Rental</SelectItem>
                      <SelectItem value="land-development">Land Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProforma} disabled={!selectedProformaType}>
                    Create Proforma
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  <p className="font-medium">{formatLocation(project.location)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{project.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Land Cost</p>
                  <p className="font-medium">${project.landCost.toLocaleString()}</p>
                </div>
                {project.notes && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="font-medium">{project.notes}</p>
                  </div>
                )}
              </div>
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
                {proformas.map((proforma) => (
                  <Link
                    key={proforma.id}
                    href={`/projects/${id}/proformas/${proforma.id}`}
                    className="block"
                  >
                    <Card className="hover:bg-accent transition-colors relative group">
                      <CardContent className="pt-6">
                        {/* Trash Icon Button - Top Right, only on hover */}
                        <button
                          type="button"
                          aria-label="Delete proforma"
                          onClick={(e) => handleDeleteProforma(e, proforma.id)}
                          className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow rounded-md p-2.5 flex items-center justify-center hover:bg-destructive/90 hover:text-white text-destructive"
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                        >
                          <Trash2 className="h-6 w-6" />
                        </button>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-lg">{proforma.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatProformaType(proforma.proformaType)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Last updated: {proforma.lastUpdated}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-xl">${proforma.totalProjectCostInclFinancing?.toLocaleString() ?? proforma.totalCost?.toLocaleString() ?? '—'}</p>
                              <p className="text-xs text-muted-foreground">Total Cost</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="block text-xs text-muted-foreground">Net Profit</span>
                              <span className="font-semibold">${proforma.metrics?.grossProfit?.toLocaleString() ?? '—'}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground">ROI</span>
                              <span className="font-semibold">{proforma.metrics?.roi?.toFixed(1) ?? '—'}%</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground">Annualized ROI</span>
                              <span className="font-semibold">{proforma.metrics?.annualizedRoi?.toFixed(1) ?? '—'}%</span>
                            </div>
                            <div>
                              <span className="block text-xs text-muted-foreground">Total Revenue</span>
                              <span className="font-semibold">${proforma.totalRevenue?.toLocaleString() ?? '—'}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {proformas.length === 0 && (
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