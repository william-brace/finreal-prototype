'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Proforma } from "@/lib/session-storage"
import { useUnitMix } from "@/hooks/useUnitMix"

interface UnitMixTabProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function UnitMixTab({ proforma, onProformaChange }: UnitMixTabProps) {
  const {
    newUnitType,
    setNewUnitType,
    newUnit,
    setNewUnit,
    selectedUnitTypeId,
    setSelectedUnitTypeId,
    isUnitTypeDialogOpen,
    setIsUnitTypeDialogOpen,
    isUnitDialogOpen,
    setIsUnitDialogOpen,
    expandedUnitTypes,
    setEditingUnitGroup,
    unitDialogMode,
    setUnitDialogMode,
    handleAddUnitType,
    handleAddUnits,
    toggleUnitType,
    handleDeleteUnit,
    handleDeleteUnitType,
    collateUnits
  } = useUnitMix({ proforma, onProformaChange })

  return (
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
                <div className="flex items-center gap-2">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUnitType(unitType.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete unit type"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete unit type</span>
                  </Button>
                </div>
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
  )
} 