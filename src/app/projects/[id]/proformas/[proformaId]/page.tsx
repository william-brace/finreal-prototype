'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"

// Mock data for a proforma
const defaultProforma = {
  id: "1",
  name: "Base Case",
  projectId: "1",
  lastUpdated: "2024-03-15",
  totalCost: 75000000,
  netProfit: 25000000,
  roi: 33.3,
  gba: 250000,
  stories: 30,
  projectLength: 36,
  absorptionPeriod: 12,
  unitMix: [] as UnitType[],
  otherIncome: [] as OtherIncome[],
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
  metrics: {
    grossRevenue: 0,
    totalExpenses: 0,
    grossProfit: 0,
    roi: 0,
    annualizedRoi: 0,
    leveredEmx: 0,
  }
}

// New types for unit mix
interface Unit {
  id: string;
  name: string;
  area: number;
  value: number;
}

interface UnitType {
  id: string;
  name: string;
  description: string;
  units: Unit[];
}

interface OtherIncome {
  id: string;
  name: string;
  description: string;
  value: number;
  unitType: string;
  numberOfUnits: number;
  valuePerUnit: number;
}

export default function ProformaEditorPage({
  params,
}: {
  params: Promise<{ id: string; proformaId: string }>
}) {
  const { id, proformaId } = use(params)
  const [proforma, setProforma] = useState(defaultProforma)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [newUnitType, setNewUnitType] = useState({ name: '', description: '' })
  const [newUnit, setNewUnit] = useState({ 
    name: '', 
    area: '', 
    value: '', 
    quantity: '1' 
  })
  const [selectedUnitTypeId, setSelectedUnitTypeId] = useState<string | null>(null)
  const [isUnitTypeDialogOpen, setIsUnitTypeDialogOpen] = useState(false)
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<{ id: string; field: string; value: string } | null>(null)
  const [expandedUnitTypes, setExpandedUnitTypes] = useState<Record<string, boolean>>({})
  const [editingField, setEditingField] = useState<{ section: string; field: string; value: string } | null>(null)
  const [newAdditionalCost, setNewAdditionalCost] = useState({ name: '', amount: '' })
  const [newOtherIncome, setNewOtherIncome] = useState({ 
    name: '', 
    description: '', 
    value: '',
    unitType: '',
    numberOfUnits: '1',
    valuePerUnit: '',
    customUnitType: ''
  })
  const [isOtherIncomeDialogOpen, setIsOtherIncomeDialogOpen] = useState(false)
  const [editingOtherIncome, setEditingOtherIncome] = useState<{ id: string; field: string; value: string } | null>(null)
  const [editingOtherIncomeDialog, setEditingOtherIncomeDialog] = useState<OtherIncome | null>(null)

  const unitTypeDisplayNames: Record<string, string> = {
    parking: 'Parking Space',
    storage: 'Storage Unit',
    retail: 'Retail Space',
  };

  useEffect(() => {
    // In a real app, we would fetch the proforma data here
    setLoading(false)
  }, [id, proformaId])

  const handleInputChange = (field: string, value: string | number) => {
    setProforma(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    // In a real app, we would save the changes to the backend here
    setIsEditing(false)
  }

  const handleAddUnitType = () => {
    const newUnitTypeObj: UnitType = {
      id: Date.now().toString(),
      name: newUnitType.name,
      description: newUnitType.description,
      units: []
    }
    setProforma(prev => ({
      ...prev,
      unitMix: [...prev.unitMix, newUnitTypeObj]
    }))
    setNewUnitType({ name: '', description: '' })
    setIsUnitTypeDialogOpen(false)
  }

  const handleAddUnits = (unitTypeId: string) => {
    const unitType = proforma.unitMix.find(ut => ut.id === unitTypeId)
    if (!unitType) return

    const newUnits = Array.from({ length: parseInt(newUnit.quantity) || 1 }, (_, i) => ({
      id: `${unitTypeId}-${Date.now()}-${i}`,
      name: newUnit.name,
      area: parseInt(newUnit.area) || 0,
      value: parseInt(newUnit.value) || 0
    }))

    setProforma(prev => ({
      ...prev,
      unitMix: prev.unitMix.map(ut => 
        ut.id === unitTypeId 
          ? { ...ut, units: [...ut.units, ...newUnits] }
          : ut
      )
    }))
    setNewUnit({ name: '', area: '', value: '', quantity: '1' })
    setIsUnitDialogOpen(false)
  }

  const handleUnitUpdate = (unitTypeId: string, unitId: string, field: string, value: string) => {
    setProforma(prev => ({
      ...prev,
      unitMix: prev.unitMix.map(ut => 
        ut.id === unitTypeId 
          ? {
              ...ut,
              units: ut.units.map(u => 
                u.id === unitId 
                  ? { ...u, [field]: field === 'name' ? value : parseInt(value) || 0 }
                  : u
              )
            }
          : ut
      )
    }))
    setEditingUnit(null)
  }

  const toggleUnitType = (unitTypeId: string) => {
    setExpandedUnitTypes(prev => ({
      ...prev,
      [unitTypeId]: !prev[unitTypeId]
    }))
  }

  const handleDeleteUnit = (unitTypeId: string, unitId: string) => {
    setProforma(prev => ({
      ...prev,
      unitMix: prev.unitMix.map(ut => 
        ut.id === unitTypeId 
          ? {
              ...ut,
              units: ut.units.filter(u => u.id !== unitId)
            }
          : ut
      )
    }))
  }

  const handleSourcesUsesUpdate = (section: 'sources' | 'uses', field: string, value: string) => {
    setProforma(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: field.includes('Rate') ? parseFloat(value) : parseInt(value) || 0
      }
    }))
    setEditingField(null)
  }

  const handleAddAdditionalCost = () => {
    if (!newAdditionalCost.name || !newAdditionalCost.amount) return

    setProforma(prev => ({
      ...prev,
      uses: {
        ...prev.uses,
        additionalCosts: [
          ...prev.uses.additionalCosts,
          {
            name: newAdditionalCost.name,
            amount: parseInt(newAdditionalCost.amount) || 0
          }
        ]
      }
    }))
    setNewAdditionalCost({ name: '', amount: '' })
  }

  const handleDeleteAdditionalCost = (index: number) => {
    setProforma(prev => ({
      ...prev,
      uses: {
        ...prev.uses,
        additionalCosts: prev.uses.additionalCosts.filter((_, i) => i !== index)
      }
    }))
  }

  const handleAddOrEditOtherIncome = () => {
    const unitType = newOtherIncome.unitType === 'other' ? newOtherIncome.customUnitType : newOtherIncome.unitType;
    const totalValue = parseInt(newOtherIncome.numberOfUnits) * parseInt(newOtherIncome.valuePerUnit);

    const newOtherIncomeObj: OtherIncome = {
      id: editingOtherIncomeDialog ? editingOtherIncomeDialog.id : Date.now().toString(),
      name: newOtherIncome.name,
      description: newOtherIncome.description,
      value: totalValue,
      unitType: unitType,
      numberOfUnits: parseInt(newOtherIncome.numberOfUnits),
      valuePerUnit: parseInt(newOtherIncome.valuePerUnit)
    }
    setProforma(prev => ({
      ...prev,
      otherIncome: editingOtherIncomeDialog
        ? prev.otherIncome.map(item => item.id === editingOtherIncomeDialog.id ? newOtherIncomeObj : item)
        : [...prev.otherIncome, newOtherIncomeObj]
    }))
    setNewOtherIncome({ 
      name: '', 
      description: '', 
      value: '',
      unitType: '',
      numberOfUnits: '1',
      valuePerUnit: '',
      customUnitType: ''
    })
    setIsOtherIncomeDialogOpen(false)
    setEditingOtherIncomeDialog(null)
  }

  const openEditOtherIncomeDialog = (item: OtherIncome) => {
    setNewOtherIncome({
      name: item.name,
      description: item.description,
      value: item.value.toString(),
      unitType: ['parking','storage','retail'].includes(item.unitType) ? item.unitType : 'other',
      numberOfUnits: item.numberOfUnits.toString(),
      valuePerUnit: item.valuePerUnit.toString(),
      customUnitType: ['parking','storage','retail'].includes(item.unitType) ? '' : item.unitType
    })
    setEditingOtherIncomeDialog(item)
    setIsOtherIncomeDialogOpen(true)
  }

  const handleDeleteOtherIncome = (id: string) => {
    setProforma(prev => ({
      ...prev,
      otherIncome: prev.otherIncome.filter(item => item.id !== id)
    }))
  }

  const calculateMetrics = (proformaData: typeof defaultProforma) => {
    const grossRevenue = proformaData.unitMix.reduce((sum, unitType) => 
      sum + unitType.units.reduce((sum, unit) => sum + unit.value, 0), 0) +
      proformaData.otherIncome.reduce((sum, item) => sum + item.value, 0);
    
    const totalExpenses = (proformaData.uses.legalCosts || 0) +
      (proformaData.uses.quantitySurveyorCosts || 0) +
      (proformaData.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0);
    
    const grossProfit = grossRevenue - totalExpenses;
    const roi = totalExpenses > 0 ? (grossProfit / totalExpenses) * 100 : 0;
    const annualizedRoi = proformaData.projectLength > 0 ? (roi / proformaData.projectLength) * 12 : 0;
    const leveredEmx = totalExpenses > 0 ? grossRevenue / totalExpenses : 0;

    // Calculate total units and cost per unit
    const totalUnits = proformaData.unitMix.reduce((sum, unitType) => 
      sum + unitType.units.length, 0);
    const costPerUnit = totalUnits > 0 ? totalExpenses / totalUnits : 0;

    return {
      grossRevenue,
      totalExpenses,
      grossProfit,
      roi,
      annualizedRoi,
      leveredEmx,
      totalUnits,
      costPerUnit,
    };
  };

  // Update metrics and results whenever relevant data changes
  useEffect(() => {
    setProforma(prev => {
      const metrics = calculateMetrics(prev);
      return {
        ...prev,
        metrics,
        results: {
          totalProjectCost: metrics.totalExpenses,
          netProfit: metrics.grossProfit,
          roi: metrics.roi,
          costPerUnit: metrics.costPerUnit,
        }
      };
    });
  }, [
    proforma.unitMix,
    proforma.otherIncome,
    proforma.uses.legalCosts,
    proforma.uses.quantitySurveyorCosts,
    proforma.uses.additionalCosts,
    proforma.projectLength
  ]);

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{proforma.name}</h1>
        <div className="flex gap-4">
          <Button variant="outline">Export to PDF</Button>
          <Link href={`/projects/${id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
              <TabsTrigger value="other-income">Other Income</TabsTrigger>
              <TabsTrigger value="sources-uses">Sources & Uses</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>General Information</CardTitle>
                      <CardDescription>Basic project details and timeline</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                          <Button onClick={handleSave}>Save Changes</Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit</Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">GBA (sqft)</label>
                      <Input 
                        value={proforma.gba?.toLocaleString() || ''} 
                        onChange={(e) => handleInputChange('gba', parseInt(e.target.value.replace(/,/g, '')) || 0)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stories</label>
                      <Input 
                        value={proforma.stories || ''} 
                        onChange={(e) => handleInputChange('stories', parseInt(e.target.value) || 0)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Project Length (months)</label>
                      <Input 
                        value={proforma.projectLength || ''} 
                        onChange={(e) => handleInputChange('projectLength', parseInt(e.target.value) || 0)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Absorption Period (months)</label>
                      <Input 
                        value={proforma.absorptionPeriod || ''} 
                        onChange={(e) => handleInputChange('absorptionPeriod', parseInt(e.target.value) || 0)}
                        readOnly={!isEditing}
                        className={!isEditing ? "bg-muted" : ""}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unit-mix">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Unit Mix</CardTitle>
                      <CardDescription>Configure the unit types and their units</CardDescription>
                    </div>
                    <Dialog open={isUnitTypeDialogOpen} onOpenChange={setIsUnitTypeDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>Add Unit Type</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Unit Type</DialogTitle>
                          <DialogDescription>
                            Create a new unit type (e.g., 2 Bedroom, Studio, etc.)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label htmlFor="name">Name</label>
                            <Input
                              id="name"
                              value={newUnitType.name}
                              onChange={(e) => setNewUnitType(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., 2 Bedroom"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="description">Description</label>
                            <Input
                              id="description"
                              value={newUnitType.description}
                              onChange={(e) => setNewUnitType(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="e.g., Two bedroom apartment with living room"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsUnitTypeDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddUnitType}>Create Unit Type</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {proforma.unitMix.map((unitType) => (
                      <div key={unitType.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleUnitType(unitType.id)}
                              className="h-8 w-8"
                            >
                              {expandedUnitTypes[unitType.id] ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <div>
                              <h3 className="text-lg font-semibold">{unitType.name}</h3>
                              <p className="text-sm text-muted-foreground">{unitType.description}</p>
                            </div>
                          </div>
                          <Dialog open={isUnitDialogOpen && selectedUnitTypeId === unitType.id} onOpenChange={(open) => {
                            if (!open) setIsUnitDialogOpen(false)
                            else {
                              setIsUnitDialogOpen(true)
                              setSelectedUnitTypeId(unitType.id)
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => {
                                setIsUnitDialogOpen(true)
                                setSelectedUnitTypeId(unitType.id)
                              }}>
                                Add Units
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Units to {unitType.name}</DialogTitle>
                                <DialogDescription>
                                  Specify the details for the new units
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <label htmlFor="unit-name">Unit Name</label>
                                  <Input
                                    id="unit-name"
                                    value={newUnit.name}
                                    onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Unit A"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <label htmlFor="area">Area (sqft)</label>
                                  <Input
                                    id="area"
                                    type="number"
                                    value={newUnit.area}
                                    onChange={(e) => setNewUnit(prev => ({ ...prev, area: e.target.value }))}
                                    placeholder="Enter area"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <label htmlFor="value">Value per Unit ($)</label>
                                  <Input
                                    id="value"
                                    type="number"
                                    value={newUnit.value}
                                    onChange={(e) => setNewUnit(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="Enter value"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <label htmlFor="quantity">Number of Units</label>
                                  <Input
                                    id="quantity"
                                    type="number"
                                    value={newUnit.quantity}
                                    onChange={(e) => setNewUnit(prev => ({ ...prev, quantity: e.target.value }))}
                                    placeholder="Enter quantity"
                                    min="1"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsUnitDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => handleAddUnits(unitType.id)}>Create Units</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          expandedUnitTypes[unitType.id] 
                            ? 'max-h-[2000px]'
                            : 'max-h-0'
                        }`}>
                          <div className="overflow-x-auto pb-4">
                            {unitType.units.length > 0 ? (
                              <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full min-w-[800px]">
                                  <thead className="sticky top-0 bg-background z-10 shadow-sm">
                                    <tr className="border-b">
                                      <th className="text-left p-3">Unit Name</th>
                                      <th className="text-left p-3">Area (sqft)</th>
                                      <th className="text-left p-3">Value ($)</th>
                                      <th className="text-left p-3">Value per Sqft</th>
                                      <th className="text-left p-3 w-[100px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {unitType.units.map((unit) => (
                                      <tr key={unit.id} className="border-b hover:bg-muted/50">
                                        <td className="p-3 min-w-[200px]">
                                          {editingUnit?.id === unit.id && editingUnit.field === 'name' ? (
                                            <Input
                                              autoFocus
                                              value={editingUnit.value}
                                              onChange={(e) => setEditingUnit(prev => ({ ...prev!, value: e.target.value }))}
                                              onBlur={() => handleUnitUpdate(unitType.id, unit.id, 'name', editingUnit.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  handleUnitUpdate(unitType.id, unit.id, 'name', editingUnit.value)
                                                }
                                              }}
                                              className="h-8 w-full"
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer truncate"
                                              onClick={() => setEditingUnit({ id: unit.id, field: 'name', value: unit.name })}
                                              title={unit.name}
                                            >
                                              {unit.name}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-3 min-w-[150px]">
                                          {editingUnit?.id === unit.id && editingUnit.field === 'area' ? (
                                            <Input
                                              autoFocus
                                              type="number"
                                              value={editingUnit.value}
                                              onChange={(e) => setEditingUnit(prev => ({ ...prev!, value: e.target.value }))}
                                              onBlur={() => handleUnitUpdate(unitType.id, unit.id, 'area', editingUnit.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  handleUnitUpdate(unitType.id, unit.id, 'area', editingUnit.value)
                                                }
                                              }}
                                              className="h-8 w-full"
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer"
                                              onClick={() => setEditingUnit({ id: unit.id, field: 'area', value: unit.area.toString() })}
                                            >
                                              {unit.area.toLocaleString()}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-3 min-w-[200px]">
                                          {editingUnit?.id === unit.id && editingUnit.field === 'value' ? (
                                            <Input
                                              autoFocus
                                              type="number"
                                              value={editingUnit.value}
                                              onChange={(e) => setEditingUnit(prev => ({ ...prev!, value: e.target.value }))}
                                              onBlur={() => handleUnitUpdate(unitType.id, unit.id, 'value', editingUnit.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                  handleUnitUpdate(unitType.id, unit.id, 'value', editingUnit.value)
                                                }
                                              }}
                                              className="h-8 w-full"
                                            />
                                          ) : (
                                            <div 
                                              className="cursor-pointer"
                                              onClick={() => setEditingUnit({ id: unit.id, field: 'value', value: unit.value.toString() })}
                                            >
                                              ${unit.value.toLocaleString()}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-3 min-w-[150px]">
                                          ${(unit.value / unit.area).toFixed(2)}
                                        </td>
                                        <td className="p-3 min-w-[100px]">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteUnit(unitType.id, unit.id)}
                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete unit</span>
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                No units added yet
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
                          {editingField?.section === 'sources' && editingField.field === 'constructionDebt' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('sources', 'constructionDebt', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('sources', 'constructionDebt', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'sources', 
                                field: 'constructionDebt', 
                                value: proforma.sources.constructionDebt.toString() 
                              })}
                            >
                              {proforma.sources.constructionDebt}%
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Equity (%)</label>
                          {editingField?.section === 'sources' && editingField.field === 'equity' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('sources', 'equity', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('sources', 'equity', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'sources', 
                                field: 'equity', 
                                value: proforma.sources.equity.toString() 
                              })}
                            >
                              {proforma.sources.equity}%
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Interest Rate (%)</label>
                          {editingField?.section === 'sources' && editingField.field === 'interestRate' ? (
                            <Input
                              autoFocus
                              type="number"
                              step="0.1"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('sources', 'interestRate', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('sources', 'interestRate', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'sources', 
                                field: 'interestRate', 
                                value: proforma.sources.interestRate.toString() 
                              })}
                            >
                              {proforma.sources.interestRate}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Uses</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Monthly Legal Costs ($)</label>
                          {editingField?.section === 'uses' && editingField.field === 'legalCosts' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('uses', 'legalCosts', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('uses', 'legalCosts', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'uses', 
                                field: 'legalCosts', 
                                value: proforma.uses.legalCosts.toString() 
                              })}
                            >
                              ${proforma.uses.legalCosts.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Monthly QS Costs ($)</label>
                          {editingField?.section === 'uses' && editingField.field === 'quantitySurveyorCosts' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('uses', 'quantitySurveyorCosts', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('uses', 'quantitySurveyorCosts', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'uses', 
                                field: 'quantitySurveyorCosts', 
                                value: proforma.uses.quantitySurveyorCosts.toString() 
                              })}
                            >
                              ${proforma.uses.quantitySurveyorCosts.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Realtor Fee (%)</label>
                          {editingField?.section === 'uses' && editingField.field === 'realtorFee' ? (
                            <Input
                              autoFocus
                              type="number"
                              step="0.1"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('uses', 'realtorFee', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('uses', 'realtorFee', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'uses', 
                                field: 'realtorFee', 
                                value: proforma.uses.realtorFee.toString() 
                              })}
                            >
                              {proforma.uses.realtorFee}%
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Hard Cost Contingency (%)</label>
                          {editingField?.section === 'uses' && editingField.field === 'hardCostContingency' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('uses', 'hardCostContingency', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('uses', 'hardCostContingency', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'uses', 
                                field: 'hardCostContingency', 
                                value: proforma.uses.hardCostContingency.toString() 
                              })}
                            >
                              {proforma.uses.hardCostContingency}%
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">Soft Cost Contingency (%)</label>
                          {editingField?.section === 'uses' && editingField.field === 'softCostContingency' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                              onBlur={() => handleSourcesUsesUpdate('uses', 'softCostContingency', editingField.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSourcesUsesUpdate('uses', 'softCostContingency', editingField.value)
                                }
                              }}
                              className="h-8"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded hover:bg-muted"
                              onClick={() => setEditingField({ 
                                section: 'uses', 
                                field: 'softCostContingency', 
                                value: proforma.uses.softCostContingency.toString() 
                              })}
                            >
                              {proforma.uses.softCostContingency}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium">Additional Costs</h4>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">Add Cost</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Additional Cost</DialogTitle>
                                <DialogDescription>
                                  Specify the name and amount for the additional cost
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <label htmlFor="cost-name">Cost Name</label>
                                  <Input
                                    id="cost-name"
                                    value={newAdditionalCost.name}
                                    onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Permit Fees"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <label htmlFor="cost-amount">Amount ($)</label>
                                  <Input
                                    id="cost-amount"
                                    type="number"
                                    value={newAdditionalCost.amount}
                                    onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="Enter amount"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleAddAdditionalCost}>Add Cost</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                        {proforma.uses.additionalCosts.map((cost, index) => (
                          <div key={index} className="flex items-center justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <label className="text-sm text-muted-foreground">{cost.name}</label>
                              {editingField?.section === 'additionalCosts' && editingField.field === index.toString() ? (
                                <Input
                                  autoFocus
                                  type="number"
                                  value={editingField.value}
                                  onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                                  onBlur={() => {
                                    const newCosts = [...proforma.uses.additionalCosts];
                                    newCosts[index].amount = parseInt(editingField.value) || 0;
                                    setProforma(prev => ({
                                      ...prev,
                                      uses: {
                                        ...prev.uses,
                                        additionalCosts: newCosts
                                      }
                                    }));
                                    setEditingField(null);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newCosts = [...proforma.uses.additionalCosts];
                                      newCosts[index].amount = parseInt(editingField.value) || 0;
                                      setProforma(prev => ({
                                        ...prev,
                                        uses: {
                                          ...prev.uses,
                                          additionalCosts: newCosts
                                        }
                                      }));
                                      setEditingField(null);
                                    }
                                  }}
                                  className="h-8"
                                />
                              ) : (
                                <div 
                                  className="cursor-pointer p-2 rounded hover:bg-muted"
                                  onClick={() => setEditingField({ 
                                    section: 'additionalCosts', 
                                    field: index.toString(), 
                                    value: cost.amount.toString() 
                                  })}
                                >
                                  ${cost.amount.toLocaleString()}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteAdditionalCost(index)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete cost</span>
                            </Button>
                          </div>
                        ))}
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

            <TabsContent value="other-income">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Other Income</CardTitle>
                      <CardDescription>Add additional income sources like parking, storage, etc.</CardDescription>
                    </div>
                    <Dialog open={isOtherIncomeDialogOpen} onOpenChange={(open) => {
                      setIsOtherIncomeDialogOpen(open)
                      if (!open) {
                        setEditingOtherIncomeDialog(null)
                        setNewOtherIncome({ 
                          name: '', 
                          description: '', 
                          value: '',
                          unitType: '',
                          numberOfUnits: '1',
                          valuePerUnit: '',
                          customUnitType: ''
                        })
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button onClick={() => {
                          setEditingOtherIncomeDialog(null)
                          setNewOtherIncome({ 
                            name: '', 
                            description: '', 
                            value: '',
                            unitType: '',
                            numberOfUnits: '1',
                            valuePerUnit: '',
                            customUnitType: ''
                          })
                          setIsOtherIncomeDialogOpen(true)
                        }}>Add Income Source</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingOtherIncomeDialog ? 'Edit Income Source' : 'Add New Income Source'}</DialogTitle>
                          <DialogDescription>
                            {editingOtherIncomeDialog ? 'Edit the details for this income source' : 'Add a new income source with its details'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label htmlFor="income-name">Name</label>
                            <Input
                              id="income-name"
                              value={newOtherIncome.name}
                              onChange={(e) => setNewOtherIncome(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., Parking Revenue"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="income-description">Description</label>
                            <Input
                              id="income-description"
                              value={newOtherIncome.description}
                              onChange={(e) => setNewOtherIncome(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="e.g., Revenue from sale of parking spaces"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="income-unit-type">Unit Type</label>
                            <select
                              id="income-unit-type"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={newOtherIncome.unitType}
                              onChange={(e) => setNewOtherIncome(prev => ({ ...prev, unitType: e.target.value }))}
                            >
                              <option value="">Select a unit type</option>
                              <option value="parking">Parking Space</option>
                              <option value="storage">Storage Unit</option>
                              <option value="retail">Retail Space</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          {newOtherIncome.unitType === 'other' && (
                            <div className="grid gap-2">
                              <label htmlFor="income-custom-unit-type">Custom Unit Type</label>
                              <Input
                                id="income-custom-unit-type"
                                value={newOtherIncome.customUnitType}
                                onChange={(e) => setNewOtherIncome(prev => ({ ...prev, customUnitType: e.target.value }))}
                                placeholder="Enter custom unit type"
                              />
                            </div>
                          )}
                          <div className="grid gap-2">
                            <label htmlFor="income-number-of-units">Number of Units</label>
                            <Input
                              id="income-number-of-units"
                              type="number"
                              min="1"
                              value={newOtherIncome.numberOfUnits}
                              onChange={(e) => setNewOtherIncome(prev => ({ ...prev, numberOfUnits: e.target.value }))}
                              placeholder="Enter number of units"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="income-value-per-unit">
                              Value per {newOtherIncome.unitType === 'other'
                                ? newOtherIncome.customUnitType || 'unit'
                                : unitTypeDisplayNames[newOtherIncome.unitType] || 'unit'} ($)
                            </label>
                            <Input
                              id="income-value-per-unit"
                              type="number"
                              value={newOtherIncome.valuePerUnit}
                              onChange={(e) => setNewOtherIncome(prev => ({ ...prev, valuePerUnit: e.target.value }))}
                              placeholder="Enter value per unit"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setIsOtherIncomeDialogOpen(false)
                            setEditingOtherIncomeDialog(null)
                          }}>Cancel</Button>
                          <Button onClick={handleAddOrEditOtherIncome}>{editingOtherIncomeDialog ? 'Save Changes' : 'Add Income Source'}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {proforma.otherIncome.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                          <thead className="sticky top-0 bg-background z-10 shadow-sm">
                            <tr className="border-b">
                              <th className="text-left p-3">Name</th>
                              <th className="text-left p-3">Description</th>
                              <th className="text-left p-3">Annual Value ($)</th>
                              <th className="text-left p-3 w-[100px]">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {proforma.otherIncome.map((item) => (
                              <tr key={item.id} className="border-b hover:bg-muted/50">
                                <td className="p-3 min-w-[200px] cursor-pointer" onClick={() => openEditOtherIncomeDialog(item)}>
                                  {item.name}
                                </td>
                                <td className="p-3 min-w-[300px] cursor-pointer" onClick={() => openEditOtherIncomeDialog(item)}>
                                  {item.description}
                                </td>
                                <td className="p-3 min-w-[150px] cursor-pointer" onClick={() => openEditOtherIncomeDialog(item)}>
                                  <div className="font-semibold">
                                    ${ (item.numberOfUnits * item.valuePerUnit).toLocaleString() }
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.numberOfUnits} {item.unitType}(s) @ ${item.valuePerUnit.toLocaleString()} each
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteOtherIncome(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No other income sources added yet. Click "Add Income Source" to get started.
                      </div>
                    )}
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
              {/* Key Metrics */}
              <div className="space-y-4 border-b pb-4 mb-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex justify-between"><span>ROI</span><span className="font-semibold">{proforma.metrics.roi.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span>Annualized ROI</span><span className="font-semibold">{proforma.metrics.annualizedRoi.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span>Levered IRR</span><span className="font-semibold">20%</span></div>
                  <div className="flex justify-between"><span>Levered EMx</span><span className="font-semibold">{proforma.metrics.leveredEmx.toFixed(1)}x</span></div>
                </div>
              </div>

              {/* Revenue */}
              <div className="mb-4 border-b pb-4">
                <div className="font-bold mb-2">Revenue</div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Gross Sales Revenue</span>
                  <span className="font-semibold">${proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.reduce((sum, unit) => sum + unit.value, 0), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Other Income</span>
                  <span className="font-semibold">${proforma.otherIncome.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Expenses</span>
                  <span className="font-semibold border-b-2 border-black">${(
                    (proforma.uses.legalCosts || 0) +
                    (proforma.uses.quantitySurveyorCosts || 0) +
                    (proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0)
                  ).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold mt-2">
                  <span>Gross Profit</span>
                  <span className="font-bold">${(
                    proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.reduce((sum, unit) => sum + unit.value, 0), 0) +
                    proforma.otherIncome.reduce((sum, item) => sum + item.value, 0) -
                    ((proforma.uses.legalCosts || 0) +
                    (proforma.uses.quantitySurveyorCosts || 0) +
                    (proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0))
                  ).toLocaleString()}</span>
                </div>
              </div>

              {/* Unit Summary */}
              <div className="mb-4 border-b pb-4">
                <div className="font-bold mb-2">Unit Summary</div>
                <div className="flex justify-between text-sm font-semibold mb-1">
                  <span className="underline">Total Units</span>
                  <span className="underline">Avg $/SF</span>
                  <span className="underline">Total Value</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0)}</span>
                  <span>${(
                    proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.reduce((sum, unit) => sum + unit.value, 0), 0) /
                    Math.max(1, proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.reduce((sum, unit) => sum + unit.area, 0), 0))
                  ).toFixed(0)}</span>
                  <span>${proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.reduce((sum, unit) => sum + unit.value, 0), 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Expenses Breakdown */}
              <div>
                <div className="font-bold mb-2">Expenses Breakdown</div>
                <div className="flex justify-between text-sm mb-1"><span>Land Cost</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>Hard Costs</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('hard'))?.amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>Soft Costs</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('soft'))?.amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1"><span>Contingency</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('contingency'))?.amount || 0).toLocaleString()}</span></div>
                <div className="flex justify-between text-sm font-semibold mt-2"><span>Total Expenses</span><span className="border-b-2 border-black">${(
                  (proforma.uses.legalCosts || 0) +
                  (proforma.uses.quantitySurveyorCosts || 0) +
                  (proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0)
                ).toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}