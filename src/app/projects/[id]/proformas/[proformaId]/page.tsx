'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState } from "react"

// Mock data for a proforma
const defaultProforma = {
  id: "1",
  name: "Base Case",
  projectId: "1",
  unitMix: [
    {
      type: "1 Bedroom",
      sqft: 750,
      pricePerSqft: 1000,
      quantity: 50,
      totalValue: 37500000,
    },
    {
      type: "2 Bedroom",
      sqft: 1100,
      pricePerSqft: 900,
      quantity: 30,
      totalValue: 29700000,
    },
    {
      type: "3 Bedroom",
      sqft: 1500,
      pricePerSqft: 800,
      quantity: 20,
      totalValue: 24000000,
    },
  ],
  sources: {
    constructionDebt: 70,
    equity: 30,
    interestRate: 5.5,
  },
  uses: {
    legalCosts: 5000,
    quantitySurveyorCosts: 8000,
    realtorFee: 2.5,
    hardCostContingency: 10,
    softCostContingency: 5,
    additionalCosts: [
      { name: "Permit Fees", amount: 250000 },
      { name: "Development Charges", amount: 1500000 },
    ],
  },
  results: {
    totalProjectCost: 75000000,
    netProfit: 25000000,
    roi: 33.3,
    costPerUnit: 750000,
  },
}

export default function ProformaEditorPage({
  params,
}: {
  params: { id: string; proformaId: string }
}) {
  const [proforma, setProforma] = useState(defaultProforma)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, we would fetch the proforma data here
    setLoading(false)
  }, [params.id, params.proformaId])

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{proforma.name}</h1>
        <div className="flex gap-4">
          <Button variant="outline">Export to PDF</Button>
          <Link href={`/projects/${params.id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="unit-mix" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
              <TabsTrigger value="sources-uses">Sources & Uses</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="unit-mix">
              <Card>
                <CardHeader>
                  <CardTitle>Unit Mix</CardTitle>
                  <CardDescription>Configure the unit types and quantities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {proforma.unitMix.map((unit, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 items-end">
                        <div>
                          <label className="text-sm font-medium">Unit Type</label>
                          <Input value={unit.type} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Sqft</label>
                          <Input value={unit.sqft} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">$/sqft</label>
                          <Input value={unit.pricePerSqft} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Quantity</label>
                          <Input value={unit.quantity} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Total Value</label>
                          <Input value={`$${unit.totalValue.toLocaleString()}`} readOnly />
                        </div>
                      </div>
                    ))}
                    <Button>Add Unit Type</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sources-uses">
              <Card>
                <CardHeader>
                  <CardTitle>Sources & Uses</CardTitle>
                  <CardDescription>Configure the financial structure</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Sources</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Construction Debt (%)</label>
                          <Input value={proforma.sources.constructionDebt} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Equity (%)</label>
                          <Input value={proforma.sources.equity} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Interest Rate (%)</label>
                          <Input value={proforma.sources.interestRate} readOnly />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Uses</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Monthly Legal Costs ($)</label>
                          <Input value={proforma.uses.legalCosts} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Monthly QS Costs ($)</label>
                          <Input value={proforma.uses.quantitySurveyorCosts} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Realtor Fee (%)</label>
                          <Input value={proforma.uses.realtorFee} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Hard Cost Contingency (%)</label>
                          <Input value={proforma.uses.hardCostContingency} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Soft Cost Contingency (%)</label>
                          <Input value={proforma.uses.softCostContingency} readOnly />
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Additional Costs</h4>
                        {proforma.uses.additionalCosts.map((cost, index) => (
                          <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                            <Input value={cost.name} readOnly />
                            <Input value={`$${cost.amount.toLocaleString()}`} readOnly />
                          </div>
                        ))}
                        <Button className="mt-2">Add Cost</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Results</CardTitle>
                  <CardDescription>Financial analysis and metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Total Project Cost</label>
                      <Input value={`$${proforma.results.totalProjectCost.toLocaleString()}`} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Net Profit</label>
                      <Input value={`$${proforma.results.netProfit.toLocaleString()}`} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium">ROI</label>
                      <Input value={`${proforma.results.roi}%`} readOnly />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Cost per Unit</label>
                      <Input value={`$${proforma.results.costPerUnit.toLocaleString()}`} readOnly />
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Key metrics and totals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Units</p>
                  <p className="text-lg font-medium">
                    {proforma.unitMix.reduce((sum, unit) => sum + unit.quantity, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-lg font-medium">
                    ${proforma.unitMix.reduce((sum, unit) => sum + unit.totalValue, 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Price per Sqft</p>
                  <p className="text-lg font-medium">
                    ${(
                      proforma.unitMix.reduce((sum, unit) => sum + unit.pricePerSqft * unit.quantity, 0) /
                      proforma.unitMix.reduce((sum, unit) => sum + unit.quantity, 0)
                    ).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected ROI</p>
                  <p className="text-lg font-medium">{proforma.results.roi}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 