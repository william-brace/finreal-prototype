'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CurrencyInput } from "@/components/ui/CurrencyInput"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { saveProject } from "@/lib/session-storage"
import { formatProvinceCode } from "@/lib/utils"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  notes: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  address: z.string().min(1, "Address is required"),
  landCost: z.number().min(0, "Land cost must be greater than or equal to 0"),
})

type ProjectFormData = z.infer<typeof projectSchema>

const testData: ProjectFormData = {
  name: "The Douglas Tower",
  notes: "Prime downtown location with excellent transit access. Mixed-use development with retail on ground floor.",
  city: "Toronto",
  province: "on",
  address: "123 Douglas Street",
  landCost: 15000000,
}

export default function NewProjectPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      landCost: 0,
      province: "on", // Default to Ontario
    },
  })

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const project = {
        id: Date.now().toString(),
        ...data,
        location: `${data.city}, ${formatProvinceCode(data.province)}`,
        proformas: [],
      }
      saveProject(project)
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error("Failed to create project:", error)
      // In a real app, we would show an error message to the user
    }
  }

  const fillWithTestData = () => {
    reset(testData)
  }

  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <p className="text-sm text-muted-foreground">Enter the details for your project.</p>
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
                <label className="text-sm font-medium">Land Cost ($)</label>
                <Controller
                  name="landCost"
                  control={control}
                  render={({ field }) => (
                    <CurrencyInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Enter land cost"
                    />
                  )}
                />
                {errors.landCost && (
                  <p className="text-sm text-destructive">{errors.landCost.message}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={fillWithTestData}
                >
                  Fill with Test Data
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <Link href="/">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 