'use client'

import { GeneralTab } from "@/components/proforma/tabs/GeneralTab"
import { OtherIncomeTab } from "@/components/proforma/tabs/OtherIncomeTab"
import { ResultsTab } from "@/components/proforma/tabs/ResultsTab"
import { SourcesUsesTab } from "@/components/proforma/tabs/SourcesUsesTab"
import { SummaryCard } from "@/components/proforma/tabs/SummaryCard"
import { UnitMixTab } from "@/components/proforma/tabs/UnitMixTab"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { exportProformaPDF } from '@/lib/pdf/exportProformaPDF'
import { Proforma, Project, getActiveTab, getProforma, getProject, saveProforma, setActiveTab } from "@/lib/session-storage"
import Link from "next/link"
import { use, useEffect, useState } from "react"


export default function ProformaEditorPage({
  params,
}: {
  params: Promise<{ id: string; proformaId: string }>
}) {
  const { id, proformaId } = use(params)
  const [proforma, setProforma] = useState<Proforma | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [proformaName, setProformaName] = useState('')
  const [activeTab, setActiveTabState] = useState('general')

  useEffect(() => {
    const fetchData = () => {
      try {
        const proformaData = getProforma(id, proformaId)
        const projectData = getProject(id)
        if (proformaData) {
          setProforma(proformaData)
          setProformaName(proformaData.name)
          setActiveTabState(getActiveTab(id, proformaId))
        }
        if (projectData) {
          setProject(projectData)
          // Set the land cost from the project if it doesn't exist in the proforma
          if (proformaData && projectData.landCost && proformaData.uses.landCosts.baseCost === 0) {
            const updatedProforma = {
              ...proformaData,
              uses: {
                ...proformaData.uses,
                landCosts: {
                  ...proformaData.uses.landCosts,
                  baseCost: projectData.landCost
                }
              }
            }
            setProforma(updatedProforma)
            saveProforma(id, updatedProforma)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, proformaId])

  const handleInputChange = (field: string, value: string | number) => {
    if (!proforma) return
    const updatedProforma: Proforma = {
      ...proforma,
      [field]: value
    }
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
  }


  const handleExportPDF = () => {
    if (!proforma) return;
    exportProformaPDF(proforma, project);
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (!proforma) {
    return <div className="container mx-auto py-8">Proforma not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 max-w-2xl">
          <h1 
            className="text-3xl font-bold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
          >
            {proformaName || "Untitled Proforma"}
          </h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleExportPDF}>Export to PDF</Button>
          <Link href={`/projects/${id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTabState(value)
              setActiveTab(id, proformaId, value)
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
              <TabsTrigger value="other-income">Other Income</TabsTrigger>
              <TabsTrigger value="sources-uses">Sources & Uses</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralTab
                gbaValue={proforma.gba?.toString() ?? ''}
                setGbaValue={(value) => handleInputChange('gba', value)}
                storiesValue={proforma.stories?.toString() ?? ''}
                setStoriesValue={(value) => handleInputChange('stories', value)}
                projectLengthValue={proforma.projectLength?.toString() ?? ''}
                setProjectLengthValue={(value) => handleInputChange('projectLength', value)}
                absorptionPeriodValue={proforma.absorptionPeriod?.toString() ?? ''}
                setAbsorptionPeriodValue={(value) => handleInputChange('absorptionPeriod', value)}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="unit-mix">
              <UnitMixTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="other-income">
              <OtherIncomeTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="sources-uses">
              <SourcesUsesTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="results">
              <ResultsTab proforma={proforma} />
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Info</CardTitle>
                  <CardDescription>Assumptions and input sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Auto-filled Values</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Development Charges - Based on Toronto, ON rates</li>
                        <li>Permit Fees - Based on Toronto, ON rates</li>
                        <li>Legal Costs - Based on market averages</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Manual Inputs</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Unit Mix - User defined</li>
                        <li>Construction Debt Ratio - User defined</li>
                        <li>Interest Rate - User defined</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Last Updated</h3>
                      <p className="text-sm text-muted-foreground">March 15, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <SummaryCard proforma={proforma} />
        </div>
      </div>
    </div>
  )
}