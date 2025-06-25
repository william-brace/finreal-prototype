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
import { Trash2 } from "lucide-react"
import { Proforma } from "@/lib/session-storage"
import { useOtherIncome } from "@/hooks/useOtherIncome"
import { formatCurrencyWithSymbol } from "@/lib/utils"
import { NumberInput } from "@/components/ui/NumberInput"

interface OtherIncomeTabProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function OtherIncomeTab({ proforma, onProformaChange }: OtherIncomeTabProps) {
  const {
    newOtherIncome,
    setNewOtherIncome,
    isOtherIncomeDialogOpen,
    setIsOtherIncomeDialogOpen,
    editingOtherIncomeDialog,
    setEditingOtherIncomeDialog,
    unitTypeDisplayNames,
    handleAddOrEditOtherIncome,
    openEditOtherIncomeDialog,
    handleDeleteOtherIncome
  } = useOtherIncome({ proforma, onProformaChange })

  return (
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
                  <NumberInput
                    id="income-number-of-units"
                    value={parseInt(newOtherIncome.numberOfUnits) || 0}
                    onChange={(value) => setNewOtherIncome(prev => ({ ...prev, numberOfUnits: value.toString() }))}
                    placeholder="Enter number of units"
                    allowDecimals={false}
                    showCommas={false}
                    min={1}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="income-value-per-unit">
                    Value per {newOtherIncome.unitType === 'other'
                      ? newOtherIncome.customUnitType || 'unit'
                      : unitTypeDisplayNames[newOtherIncome.unitType] || 'unit'} ($)
                  </label>
                  <NumberInput
                    id="income-value-per-unit"
                    value={parseFloat(newOtherIncome.valuePerUnit) || 0}
                    onChange={(value) => setNewOtherIncome(prev => ({ ...prev, valuePerUnit: value.toString() }))}
                    placeholder="Enter value per unit"
                    allowDecimals={true}
                    showCommas={true}
                    prefix="$"
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
                            {formatCurrencyWithSymbol(item.numberOfUnits * item.valuePerUnit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.numberOfUnits} {plural} @ {formatCurrencyWithSymbol(item.valuePerUnit)} each
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
  )
} 