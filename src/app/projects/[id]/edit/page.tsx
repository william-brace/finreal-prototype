'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { use } from "react"
import { getProject, saveProject } from "@/lib/session-storage"
import { useEffect, useState } from "react"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  notes: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  address: z.string().min(1, "Address is required"),
  proformaType: z.string().min(1, "Proforma type is required"),
  landCost: z.number().min(0, "Land cost must be greater than or equal to 0"),
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  })

  useEffect(() => {
    const loadProject = () => {
      try {
        const projectData = getProject(id)
        if (projectData) {
          setProject(projectData)
          // Split location into city and province
          const [city, province] = projectData.location.split(',').map(s => s.trim())
          reset({
            name: projectData.name,
            notes: projectData.notes || '',
            city,
            province: province.toLowerCase(),
            address: projectData.address,
            proformaType: projectData.proformaType,
            landCost: projectData.landCost,
          })
        }
      } catch (error) {
        console.error("Error loading project:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id, reset])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const updatedProject = {
        ...project,
        ...data,
        location: `${data.city}, ${data.province}`,
      }
      saveProject(updatedProject)
      router.push(`/projects/${id}`)
    } catch (error) {
      console.error("Failed to update project:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <p className="text-center text-gray-600">Project not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Project</CardTitle>
            <p className="text-sm text-muted-foreground">Update the details for your project.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name</label>
                <Input 
                  placeholder="e.g. The Douglas Tower" 
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Project Notes</label>
                <Textarea 
                  placeholder="Additional details about this project" 
                  {...register("notes")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Input 
                    placeholder="e.g. Toronto" 
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Province</label>
                  <Controller
                    name="province"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a province" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on">Ontario</SelectItem>
                          <SelectItem value="bc">British Columbia</SelectItem>
                          <SelectItem value="ab">Alberta</SelectItem>
                          <SelectItem value="qc">Quebec</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.province && (
                    <p className="text-sm text-destructive">{errors.province.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input 
                  placeholder="e.g. 123 Main Street" 
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Proforma Type</label>
                <Controller
                  name="proformaType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pick a selection" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="purpose-built-rental">Purpose Built Rental</SelectItem>
                        <SelectItem value="land-development">Land Development</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.proformaType && (
                  <p className="text-sm text-destructive">{errors.proformaType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Land Cost ($)</label>
                <Input 
                  type="number" 
                  min={0} 
                  {...register("landCost", { valueAsNumber: true })}
                />
                {errors.landCost && (
                  <p className="text-sm text-destructive">{errors.landCost.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href={`/projects/${id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 