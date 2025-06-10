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
import { getProforma, saveProforma, Proforma } from "@/lib/session-storage"
import { jsPDF } from 'jspdf'

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
  customUnitType?: string;
}

export default function ProformaEditorPage({
  params,
}: {
  params: Promise<{ id: string; proformaId: string }>
}) {
  const { id, proformaId } = use(params)
  const [proforma, setProforma] = useState<Proforma | null>(null)
  const [loading, setLoading] = useState(true)
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
  const [editingOtherIncomeDialog, setEditingOtherIncomeDialog] = useState<OtherIncome | null>(null)
  const [gbaValue, setGbaValue] = useState<string>('')
  const [storiesValue, setStoriesValue] = useState<string>('')
  const [projectLengthValue, setProjectLengthValue] = useState<string>('')
  const [absorptionPeriodValue, setAbsorptionPeriodValue] = useState<string>('')
  const [editingUnitGroup, setEditingUnitGroup] = useState<{ unitTypeId: string, groupKey: string } | null>(null)
  const [unitDialogMode, setUnitDialogMode] = useState<'add' | 'edit'>('add')
  const [isEditingName, setIsEditingName] = useState(false)
  const [proformaName, setProformaName] = useState('')
  const [isLandCostDialogOpen, setIsLandCostDialogOpen] = useState(false)

  const unitTypeDisplayNames: Record<string, string> = {
    parking: 'Parking Space',
    storage: 'Storage Unit',
    retail: 'Retail Space',
  };

  useEffect(() => {
    const fetchProforma = () => {
      try {
        const data = getProforma(id, proformaId)
        if (data) {
          setProforma(data)
          setProformaName(data.name)
          setIsEditingName(data.name === "New Proforma")
          setGbaValue(data.gba?.toString() ?? '')
          setStoriesValue(data.stories?.toString() ?? '')
          setProjectLengthValue(data.projectLength?.toString() ?? '')
          setAbsorptionPeriodValue(data.absorptionPeriod?.toString() ?? '')
        }
      } catch (error) {
        console.error("Error fetching proforma:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProforma()
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


  const handleAddUnitType = () => {
    if (!proforma) return
    const newUnitTypeObj: UnitType = {
      id: Date.now().toString(),
      name: newUnitType.name,
      description: newUnitType.description,
      units: []
    }
    const updatedProforma: Proforma = {
      ...proforma,
      unitMix: [...proforma.unitMix, newUnitTypeObj]
    }
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
    setNewUnitType({ name: '', description: '' })
    setIsUnitTypeDialogOpen(false)
  }

  const handleAddUnits = (unitTypeId: string) => {
    if (!proforma) return
    if (editingUnitGroup && editingUnitGroup.unitTypeId === unitTypeId) {
      // Edit mode: update all units in the group
      const updatedProforma: Proforma = {
        ...proforma,
        unitMix: proforma.unitMix.map(ut => {
          if (ut.id !== unitTypeId) return ut;
          const groupKey = editingUnitGroup.groupKey;
          const filteredUnits = ut.units.filter(u => `${u.name}|${u.area}|${u.value}` !== groupKey);
          const newUnits = Array.from({ length: parseInt(newUnit.quantity) || 1 }, (_, i) => ({
            id: `${unitTypeId}-${Date.now()}-${i}`,
            name: newUnit.name,
            area: parseInt(newUnit.area) || 0,
            value: parseInt(newUnit.value) || 0
          }));
          return { ...ut, units: [...filteredUnits, ...newUnits] };
        })
      };
      setProforma(prev => {
        if (!prev) return prev;
        return updatedProforma;
      })
      saveProforma(id, updatedProforma)
      setEditingUnitGroup(null);
    } else {
      // Add mode: add new units as before
      const unitType = proforma.unitMix.find(ut => ut.id === unitTypeId);
      if (!unitType) return;
      const newUnits = Array.from({ length: parseInt(newUnit.quantity) || 1 }, (_, i) => ({
        id: `${unitTypeId}-${Date.now()}-${i}`,
        name: newUnit.name,
        area: parseInt(newUnit.area) || 0,
        value: parseInt(newUnit.value) || 0
      }));
      const updatedProforma: Proforma = {
        ...proforma,
        unitMix: proforma.unitMix.map(ut => 
          ut.id === unitTypeId 
            ? { ...ut, units: [...ut.units, ...newUnits] }
            : ut
        )
      };
      setProforma(prev => {
        if (!prev) return prev;
        return updatedProforma;
      })
      saveProforma(id, updatedProforma)
    }
    setExpandedUnitTypes(prev => ({ ...prev, [unitTypeId]: true }));
    setNewUnit({ name: '', area: '', value: '', quantity: '1' });
    setIsUnitDialogOpen(false);
  };



  const toggleUnitType = (unitTypeId: string) => {
    setExpandedUnitTypes(prev => ({
      ...prev,
      [unitTypeId]: !prev[unitTypeId]
    }))
  }

  const handleDeleteUnit = (unitTypeId: string, unitId: string) => {
    if (!proforma) return
    const updatedProforma: Proforma = {
      ...proforma,
      unitMix: proforma.unitMix.map(ut => 
        ut.id === unitTypeId 
          ? {
              ...ut,
              units: ut.units.filter(u => u.id !== unitId)
            }
          : ut
      )
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
  }

  const handleSourcesUsesUpdate = (section: 'sources' | 'uses', field: string, value: string) => {
    if (!proforma) return
    const updatedProforma: Proforma = {
      ...proforma,
      [section]: {
        ...proforma[section],
        [field]: field.includes('Rate') ? parseFloat(value) : parseInt(value) || 0
      }
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
    setEditingField(null)
  }

  const handleAddAdditionalCost = () => {
    if (!proforma) return
    if (!newAdditionalCost.name || !newAdditionalCost.amount) return

    const updatedProforma: Proforma = {
      ...proforma,
      uses: {
        ...proforma.uses,
        additionalCosts: [
          ...proforma.uses.additionalCosts,
          {
            name: newAdditionalCost.name,
            amount: parseInt(newAdditionalCost.amount) || 0
          }
        ]
      }
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
    setNewAdditionalCost({ name: '', amount: '' })
    setIsLandCostDialogOpen(false)
  }

  const handleDeleteAdditionalCost = (name: string) => {
    if (!proforma) return;
    const updatedProforma: Proforma = {
      ...proforma,
      uses: {
        ...proforma.uses,
        additionalCosts: proforma.uses.additionalCosts.filter(
          c => c.name !== name || ['land cost', 'closing costs'].includes(c.name.toLowerCase())
        )
      }
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    });
    saveProforma(id, updatedProforma);
  };

  const handleAddOrEditOtherIncome = () => {
    if (!proforma) return
    const unitType = newOtherIncome.unitType === 'other' ? newOtherIncome.customUnitType : newOtherIncome.unitType;
    const totalValue = parseInt(newOtherIncome.numberOfUnits) * parseInt(newOtherIncome.valuePerUnit);

    const newOtherIncomeObj: OtherIncome = {
      id: editingOtherIncomeDialog ? editingOtherIncomeDialog.id : Date.now().toString(),
      name: newOtherIncome.name,
      description: newOtherIncome.description,
      value: totalValue,
      unitType: unitType || '',
      numberOfUnits: parseInt(newOtherIncome.numberOfUnits),
      valuePerUnit: parseInt(newOtherIncome.valuePerUnit)
    }
    const updatedProforma: Proforma = {
      ...proforma,
      otherIncome: editingOtherIncomeDialog
        ? proforma.otherIncome.map(item => item.id === editingOtherIncomeDialog.id ? newOtherIncomeObj : item)
        : [...proforma.otherIncome, newOtherIncomeObj]
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
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
    if (!proforma) return
    const updatedProforma: Proforma = {
      ...proforma,
      otherIncome: proforma.otherIncome.filter(item => item.id !== id)
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
  }

  const calculateMetrics = (proformaData: Proforma) => {
    const grossRevenue = proformaData.unitMix.reduce((sum: number, unitType: UnitType) => 
      sum + unitType.units.reduce((sum: number, unit: Unit) => sum + unit.value, 0), 0) +
      proformaData.otherIncome.reduce((sum: number, item: OtherIncome) => sum + item.value, 0);
    
    const totalExpenses = (proformaData.uses.legalCosts || 0) +
      (proformaData.uses.quantitySurveyorCosts || 0) +
      (proformaData.uses.additionalCosts?.reduce((sum: number, c: { name: string; amount: number }) => sum + (c.amount || 0), 0) || 0);
    
    const grossProfit = grossRevenue - totalExpenses;
    const roi = totalExpenses > 0 ? (grossProfit / totalExpenses) * 100 : 0;
    const annualizedRoi = proformaData.projectLength > 0 ? (roi / proformaData.projectLength) * 12 : 0;
    const leveredEmx = totalExpenses > 0 ? grossRevenue / totalExpenses : 0;

    // Calculate total units and cost per unit
    const totalUnits = proformaData.unitMix.reduce((sum: number, unitType: UnitType) => 
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
    if (!proforma) return;
    const metrics = calculateMetrics(proforma);
    const updatedProforma: Proforma = {
      ...proforma,
      metrics,
      results: {
        totalProjectCost: metrics.totalExpenses,
        netProfit: metrics.grossProfit,
        roi: metrics.roi,
        costPerUnit: metrics.costPerUnit,
      }
    };
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    proforma?.unitMix,
    proforma?.otherIncome,
    proforma?.uses.legalCosts,
    proforma?.uses.quantitySurveyorCosts,
    proforma?.uses.additionalCosts,
    proforma?.projectLength
  ]);

  // Helper to collate units by name, area, value
  function collateUnits(units: Unit[]): Array<Unit & { quantity: number; ids: string[], groupKey: string }> {
    const map = new Map<string, Unit & { quantity: number; ids: string[], groupKey: string }>();
    units.forEach((unit: Unit) => {
      const key = `${unit.name}|${unit.area}|${unit.value}`;
      if (map.has(key)) {
        map.get(key)!.quantity += 1;
        map.get(key)!.ids.push(unit.id);
      } else {
        map.set(key, { ...unit, quantity: 1, ids: [unit.id], groupKey: key });
      }
    });
    return Array.from(map.values());
  }

  const handleNameChange = (newName: string) => {
    if (!proforma) return
    setProformaName(newName)
    const updatedProforma: Proforma = {
      ...proforma,
      name: newName
    }
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
  }

  const handleExportPDF = () => {
    if (!proforma) return
    const doc = new jsPDF()
    doc.text("Hi this is a pdf", 10, 10)
    doc.save(`${proforma.name}.pdf`)
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
          {isEditingName ? (
            <Input
              value={proformaName}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              className="text-3xl font-bold h-12 px-2"
              autoFocus={proformaName === "New Proforma"}
              placeholder="Enter proforma name"
            />
          ) : (
            <h1 
              className="text-3xl font-bold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              onClick={() => setIsEditingName(true)}
            >
              {proformaName || "Untitled Proforma"}
            </h1>
          )}
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
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
              <TabsTrigger value="other-income">Other Income</TabsTrigger>
              <TabsTrigger value="sources-uses">Uses</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>General Information</CardTitle>
                      <CardDescription>Salient project details</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">GBA (sqft)</label>
                      <Input 
                        type="number"
                        step="any"
                        value={gbaValue}
                        onChange={e => setGbaValue(e.target.value)}
                        onBlur={() => handleInputChange('gba', parseFloat(gbaValue) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Stories</label>
                      <Input 
                        type="number"
                        value={storiesValue}
                        onChange={e => setStoriesValue(e.target.value)}
                        onBlur={() => handleInputChange('stories', parseInt(storiesValue) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Project Length (months)</label>
                      <Input 
                        type="number"
                        value={projectLengthValue}
                        onChange={e => setProjectLengthValue(e.target.value)}
                        onBlur={() => handleInputChange('projectLength', parseInt(projectLengthValue) || 0)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Absorption Period (months)</label>
                      <Input 
                        type="number"
                        value={absorptionPeriodValue}
                        onChange={e => setAbsorptionPeriodValue(e.target.value)}
                        onBlur={() => handleInputChange('absorptionPeriod', parseInt(absorptionPeriodValue) || 0)}
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
                                setSelectedUnitTypeId(unitType.id);
                                setUnitDialogMode('add');
                                if (unitType.units.length > 0) {
                                  setEditingUnitGroup({ unitTypeId: unitType.id, groupKey: `${unitType.name}|${unitType.units[0].area}|${unitType.units[0].value}` });
                                } else {
                                  setEditingUnitGroup(null);
                                }
                              }}>
                                Add Units
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  {unitDialogMode === 'edit' ? 'Edit Units' : 'Add Units'}
                                </DialogTitle>
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
                                  <label htmlFor="value">Price per Square Foot ($)</label>
                                  <Input
                                    id="value"
                                    type="number"
                                    value={newUnit.value}
                                    onChange={(e) => setNewUnit(prev => ({ ...prev, value: e.target.value }))}
                                    placeholder="Enter price per sqft"
                                  />
                                  {newUnit.area && newUnit.value && !isNaN(Number(newUnit.area)) && !isNaN(Number(newUnit.value)) && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Total Value: {(Number(newUnit.area) * Number(newUnit.value)).toLocaleString(undefined, { style: 'currency', currency: 'USD' })} ({newUnit.area} sqft × ${newUnit.value}/sqft)
                                    </div>
                                  )}
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
                                <Button variant="outline" onClick={() => {
                                  setIsUnitDialogOpen(false);
                                  setEditingUnitGroup(null);
                                }}>Cancel</Button>
                                <Button onClick={() => handleAddUnits(unitType.id)}>{unitDialogMode === 'edit' ? 'Save Changes' : 'Create Units'}</Button>
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
                                      <th className="text-left p-3">Price per Sqft ($)</th>
                                      <th className="text-left p-3">Quantity</th>
                                      <th className="text-left p-3">Total Value</th>
                                      <th className="text-left p-3 w-[100px]">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {collateUnits(unitType.units).map((unit) => (
                                      <tr key={unit.ids.join('-')} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => {
                                        setSelectedUnitTypeId(unitType.id);
                                        setNewUnit({
                                          name: unit.name,
                                          area: unit.area.toString(),
                                          value: unit.value.toString(),
                                          quantity: unit.quantity.toString()
                                        });
                                        setEditingUnitGroup({ unitTypeId: unitType.id, groupKey: unit.groupKey });
                                        setUnitDialogMode('edit');
                                        setIsUnitDialogOpen(true);
                                      }}>
                                        <td className="p-3 min-w-[200px]">{unit.name}</td>
                                        <td className="p-3 min-w-[150px]">{unit.area.toLocaleString()}</td>
                                        <td className="p-3 min-w-[150px]">${unit.value.toLocaleString()}</td>
                                        <td className="p-3 min-w-[100px]">{unit.quantity}</td>
                                        <td className="p-3 min-w-[150px]">${(unit.area * unit.value * unit.quantity).toLocaleString()}</td>
                                        <td className="p-3 min-w-[100px]">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={e => {
                                              e.stopPropagation();
                                              unit.ids.forEach((id: string) => handleDeleteUnit(unitType.id, id));
                                            }}
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
                  <CardTitle>Uses</CardTitle>
                  <CardDescription>Configure project costs and expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Project Summary */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">Total GBA</div>
                        <div className="text-lg font-semibold">
                          {proforma.gba?.toLocaleString() || '0'} SF
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Total Units</div>
                        <div className="text-lg font-semibold">
                          {proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Land Costs Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">Land Costs</h3>
                          <p className="text-sm text-muted-foreground">Costs associated with land acquisition and related expenses</p>
                            </div>
                        <Dialog open={isLandCostDialogOpen} onOpenChange={setIsLandCostDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setIsLandCostDialogOpen(true)}>Add Land Cost</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Land Cost</DialogTitle>
                              <DialogDescription>
                                Add a new land cost item with its details
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <label htmlFor="land-cost-name">Cost Name</label>
                                <Input
                                  id="land-cost-name"
                                  value={newAdditionalCost.name}
                                  onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g., Survey Costs"
                                />
                              </div>
                              <div className="grid gap-2">
                                <label htmlFor="land-cost-amount">Amount ($)</label>
                                <Input
                                  id="land-cost-amount"
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

                      <div className="space-y-4">
                        {/* Pre-populated Land Cost */}
                        <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Land Cost</label>
                            <div className="text-sm text-muted-foreground">Base land acquisition cost</div>
                            </div>
                          <div className="text-right">
                            {editingField?.section === 'land' && editingField.field === 'landCost' ? (
                            <Input
                              autoFocus
                              type="number"
                              value={editingField.value}
                              onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                                onBlur={() => {
                                  const newCosts = [...(proforma.uses.additionalCosts || [])];
                                  const landCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('land'));
                                  if (landCostIndex >= 0) {
                                    newCosts[landCostIndex].amount = parseInt(editingField.value) || 0;
                                  } else {
                                    newCosts.push({ name: 'Land Cost', amount: parseInt(editingField.value) || 0 });
                                  }
                                  setProforma(prev => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      uses: {
                                        ...prev.uses,
                                        additionalCosts: newCosts
                                      }
                                    };
                                  });
                                  setEditingField(null);
                                }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const newCosts = [...(proforma.uses.additionalCosts || [])];
                                    const landCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('land'));
                                    if (landCostIndex >= 0) {
                                      newCosts[landCostIndex].amount = parseInt(editingField.value) || 0;
                                    } else {
                                      newCosts.push({ name: 'Land Cost', amount: parseInt(editingField.value) || 0 });
                                    }
                                    setProforma(prev => {
                                      if (!prev) return prev;
                                      return {
                                        ...prev,
                                        uses: {
                                          ...prev.uses,
                                          additionalCosts: newCosts
                                        }
                                      };
                                    });
                                    setEditingField(null);
                                }
                              }}
                                className="h-8 w-48"
                            />
                          ) : (
                            <div 
                              className="cursor-pointer p-2 rounded bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                              onClick={() => setEditingField({ 
                                  section: 'land', 
                                  field: 'landCost', 
                                  value: (proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0).toString() 
                              })}
                            >
                                ${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                        {/* Pre-populated Closing Costs */}
                        <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1">
                            <label className="text-sm font-medium">Closing Costs</label>
                            <div className="text-sm text-muted-foreground">Based on land cost percentage</div>
                          </div>
                          <div className="flex items-center gap-4">
                            {editingField?.section === 'land' && editingField.field === 'closingCost' ? (
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                  ${(() => {
                                    const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                                    const percentage = parseFloat(editingField.value) || 0;
                                    return Math.round(landCost * percentage / 100).toLocaleString();
                                  })()}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    autoFocus
                                    type="number"
                                    step="0.1"
                                    value={editingField.value}
                                    onChange={(e) => setEditingField(prev => ({ ...prev!, value: e.target.value }))}
                                    onBlur={() => {
                                      const newCosts = [...(proforma.uses.additionalCosts || [])];
                                      const closingCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('closing'));
                                      const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                                      const closingCostAmount = Math.round(landCost * (parseFloat(editingField.value) || 0) / 100);
                                      
                                      if (closingCostIndex >= 0) {
                                        newCosts[closingCostIndex].amount = closingCostAmount;
                                      } else {
                                        newCosts.push({ name: 'Closing Costs', amount: closingCostAmount });
                                      }
                                      setProforma(prev => {
                                        if (!prev) return prev;
                                        return {
                                          ...prev,
                                          uses: {
                                            ...prev.uses,
                                            additionalCosts: newCosts
                                          }
                                        };
                                      });
                                      setEditingField(null);
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        const newCosts = [...(proforma.uses.additionalCosts || [])];
                                        const closingCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('closing'));
                                        const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                                        const closingCostAmount = Math.round(landCost * (parseFloat(editingField.value) || 0) / 100);
                                        
                                        if (closingCostIndex >= 0) {
                                          newCosts[closingCostIndex].amount = closingCostAmount;
                                        } else {
                                          newCosts.push({ name: 'Closing Costs', amount: closingCostAmount });
                                        }
                                        setProforma(prev => {
                                          if (!prev) return prev;
                                          return {
                                            ...prev,
                                            uses: {
                                              ...prev.uses,
                                              additionalCosts: newCosts
                                            }
                                          };
                                        });
                                        setEditingField(null);
                                      }
                                    }}
                                    className="h-8 w-24"
                                  />
                                  <span className="text-sm">%</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <div className="text-sm text-muted-foreground">
                                  ${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('closing'))?.amount || 0).toLocaleString()}
                                </div>
                                <div 
                                  className="cursor-pointer p-2 rounded bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                                  onClick={() => {
                                    const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                                    const closingCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('closing'))?.amount || 0;
                                    const percentage = landCost > 0 ? (closingCost / landCost * 100).toFixed(1) : '0';
                                    setEditingField({ 
                                      section: 'land', 
                                      field: 'closingCost', 
                                      value: percentage
                                    });
                                  }}
                                >
                                  {(() => {
                                    const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                                    const closingCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('closing'))?.amount || 0;
                                    return landCost > 0 ? `${(closingCost / landCost * 100).toFixed(1)}%` : '0%';
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Additional Land Costs */}
                        {proforma.uses.additionalCosts
                          ?.filter(cost => 
                            !cost.name.toLowerCase().includes('land') && 
                            !cost.name.toLowerCase().includes('closing')
                          )
                          .map((cost) => (
                            <div key={cost.name} className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                              <div className="flex-1">
                                <label className="text-sm font-medium">{cost.name}</label>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-semibold">${cost.amount.toLocaleString()}</div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAdditionalCost(cost.name)}
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete cost</span>
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Total Land Costs */}
                      <div className="mt-6 pt-4 border-t">
                        {/* Per Unit and Per SF Calculations */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Total Cost per Unit</div>
                            <div className="text-sm font-semibold">
                              ${(() => {
                                const totalCost = proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
                                const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                                return totalUnits > 0 ? Number(totalCost / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                              })()}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm font-medium">Total Cost per SF</div>
                            <div className="text-sm font-semibold">
                              ${(() => {
                                const totalCost = proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
                                const gba = proforma.gba || 0;
                                return gba > 0 ? Number(totalCost / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-lg font-semibold">Total Land Costs</div>
                          <div className="text-lg font-bold">
                            ${(
                              (proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0)
                            ).toLocaleString()}
                          </div>
                        </div>
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
                            {proforma.otherIncome.map((item) => {
                              // Determine display name for unit type
                              let displayUnitType = item.unitType;
                              if (item.unitType === 'other') {
                                displayUnitType = item.customUnitType || 'unit';
                              } else {
                                displayUnitType = unitTypeDisplayNames[item.unitType] || item.unitType;
                              }
                              // Pluralize if needed
                              const plural = Number(item.numberOfUnits) === 1 ? displayUnitType : displayUnitType + 's';
                              return (
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
                                      {item.numberOfUnits} {plural} @ ${item.valuePerUnit.toLocaleString()} each
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
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No other income sources added yet. Click &apos;Add Income Source&apos; to get started.
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