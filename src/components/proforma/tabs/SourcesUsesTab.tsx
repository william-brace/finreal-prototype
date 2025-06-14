'use client'

import { useState } from "react"
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
import { Proforma } from "@/lib/session-storage"
import { CostRow } from "@/components/proforma/CostRow"
import { PercentageRow } from "@/components/proforma/PercentageRow"
import { AdditionalCostRow } from "@/components/proforma/AdditionalCostRow"

interface SourcesUsesTabProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function SourcesUsesTab({ proforma, onProformaChange }: SourcesUsesTabProps) {
  const [newAdditionalCost, setNewAdditionalCost] = useState({ name: '', amount: '' })
  const [newHardCost, setNewHardCost] = useState({ name: '', amount: '' })
  const [newSoftCost, setNewSoftCost] = useState({ name: '', amount: '' })
  const [isLandCostDialogOpen, setIsLandCostDialogOpen] = useState(false)
  const [isHardCostDialogOpen, setIsHardCostDialogOpen] = useState(false)
  const [isSoftCostDialogOpen, setIsSoftCostDialogOpen] = useState(false)
  const [isAdditionalCostDialogOpen, setIsAdditionalCostDialogOpen] = useState(false)
  const [editingCostName, setEditingCostName] = useState<string | null>(null)
  const [editingCostType, setEditingCostType] = useState<'land' | 'hard' | 'soft' | null>(null)
  const [hardCosts, setHardCosts] = useState<{ name: string; amount: number }[]>([])
  const [softCosts, setSoftCosts] = useState<{ name: string; amount: number }[]>([])
  const [constructionCost, setConstructionCost] = useState<number>(0)
  const [hardCostContingencyPct, setHardCostContingencyPct] = useState<number>(0)
  const [softDev, setSoftDev] = useState<number>(0)
  const [softConsultants, setSoftConsultants] = useState<number>(0)
  const [adminMarketing, setAdminMarketing] = useState<number>(0)
  const [softCostContingencyPct, setSoftCostContingencyPct] = useState<number>(0)
  const [equityPct, setEquityPct] = useState(30)
  const [debtPct, setDebtPct] = useState(70)
  const [interestPct, setInterestPct] = useState(0)
  const [brokerFeePct, setBrokerFeePct] = useState(0)

  const handleAddCost = (type: 'land' | 'hard' | 'soft') => {
    if (!newAdditionalCost.name || !newAdditionalCost.amount) return;

    switch (type) {
      case 'land':
        const updatedProforma: Proforma = {
          ...proforma,
          uses: {
            ...proforma.uses,
            additionalCosts: editingCostName
              ? proforma.uses.additionalCosts.map(cost => 
                  cost.name === editingCostName
                    ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                    : cost
                )
              : [
                  ...proforma.uses.additionalCosts,
                  {
                    name: newAdditionalCost.name,
                    amount: parseInt(newAdditionalCost.amount) || 0
                  }
                ]
          }
        };
        onProformaChange(updatedProforma);
        break;

      case 'hard':
        setHardCosts(prev => {
          if (editingCostName) {
            return prev.map(cost => 
              cost.name === editingCostName
                ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                : cost
            );
          }
          return [...prev, { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }];
        });
        break;

      case 'soft':
        setSoftCosts(prev => {
          if (editingCostName) {
            return prev.map(cost => 
              cost.name === editingCostName
                ? { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }
                : cost
            );
          }
          return [...prev, { name: newAdditionalCost.name, amount: parseInt(newAdditionalCost.amount) || 0 }];
        });
        break;
    }

    // Reset state
    setNewAdditionalCost({ name: '', amount: '' });
    setEditingCostName(null);
    setEditingCostType(null);
    setIsAdditionalCostDialogOpen(false);
    setIsLandCostDialogOpen(false);
    setIsHardCostDialogOpen(false);
    setIsSoftCostDialogOpen(false);
  };

  const handleDeleteAdditionalCost = (name: string) => {
    const updatedProforma: Proforma = {
      ...proforma,
      uses: {
        ...proforma.uses,
        additionalCosts: proforma.uses.additionalCosts.filter(
          c => c.name !== name || ['land cost', 'closing costs'].includes(c.name.toLowerCase())
        )
      }
    };
    onProformaChange(updatedProforma);
  };

  // Calculate totals
  const landCosts = proforma?.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
  const hardCostsTotal = constructionCost + Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + hardCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
  const softCostsTotal = softDev + softConsultants + adminMarketing + Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + softCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
  const totalProjectCost = landCosts + hardCostsTotal + softCostsTotal;
  const equityAmount = Math.round((equityPct / 100) * totalProjectCost).toLocaleString();
  const debtAmount = Math.round((debtPct / 100) * totalProjectCost).toLocaleString();
  const constructionDebtAmount = Math.round((debtPct / 100) * totalProjectCost);
  const projectLength = proforma?.projectLength || 0;
  const interestCostAmount = Math.round((interestPct / 100 / 12) * projectLength * constructionDebtAmount).toLocaleString();
  const brokerFeeAmount = Math.round((brokerFeePct / 100) * constructionDebtAmount).toLocaleString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sources & Uses</CardTitle>
        <CardDescription>Project costs and financing breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-12">
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

          {/* USES SECTION */}
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">Uses</h2>
              <p className="text-muted-foreground">Project costs and expenses breakdown</p>
            </div>

            {/* Land Costs Section */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
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
                      <Button onClick={() => handleAddCost('land')}>Add Cost</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {/* Pre-populated Land Cost */}
                <CostRow
                  label="Land Cost"
                  description="Base land acquisition cost"
                  value={proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0}
                  onChange={val => {
                    const newCosts = [...(proforma.uses.additionalCosts || [])];
                    const landCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('land'));
                    if (landCostIndex >= 0) {
                      newCosts[landCostIndex].amount = val;
                    } else {
                      newCosts.push({ name: 'Land Cost', amount: val });
                    }
                    onProformaChange({
                      ...proforma,
                      uses: {
                        ...proforma.uses,
                        additionalCosts: newCosts
                      }
                    });
                  }}
                />
                {/* Pre-populated Closing Costs */}
                <PercentageRow
                  label="Closing Costs"
                  description="Based on land cost percentage"
                  baseAmount={proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0}
                  percentage={(() => {
                    const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                    const closingCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('closing'))?.amount || 0;
                    return landCost > 0 ? (closingCost / landCost * 100) : 0;
                  })()}
                  onChange={(pct) => {
                    const newCosts = [...(proforma.uses.additionalCosts || [])];
                    const closingCostIndex = newCosts.findIndex(c => c.name.toLowerCase().includes('closing'));
                    const landCost = proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0;
                    const closingCostAmount = Math.round(landCost * pct / 100);
                    
                    if (closingCostIndex >= 0) {
                      newCosts[closingCostIndex].amount = closingCostAmount;
                    } else {
                      newCosts.push({ name: 'Closing Costs', amount: closingCostAmount });
                    }
                    onProformaChange({
                      ...proforma,
                      uses: {
                        ...proforma.uses,
                        additionalCosts: newCosts
                      }
                    });
                  }}
                />
                {/* Additional Land Costs */}
                {proforma.uses.additionalCosts
                  ?.filter(cost => 
                    !cost.name.toLowerCase().includes('land') && 
                    !cost.name.toLowerCase().includes('closing')
                  )
                  .map((cost) => (
                    <AdditionalCostRow
                      key={cost.name}
                      name={cost.name}
                      amount={cost.amount}
                      onDelete={() => handleDeleteAdditionalCost(cost.name)}
                      onEdit={() => {
                        setNewAdditionalCost({ name: cost.name, amount: cost.amount.toString() });
                        setEditingCostName(cost.name);
                        setIsAdditionalCostDialogOpen(true);
                      }}
                    />
                  ))}

                <Dialog open={isAdditionalCostDialogOpen} onOpenChange={(open) => {
                  setIsAdditionalCostDialogOpen(open);
                  if (!open) {
                    setEditingCostName(null);
                    setEditingCostType(null);
                    setNewAdditionalCost({ name: '', amount: '' });
                  }
                }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Additional Cost</DialogTitle>
                      <DialogDescription>
                        Edit the additional cost details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="additional-cost-name">Cost Name</label>
                        <Input
                          id="additional-cost-name"
                          value={newAdditionalCost.name}
                          onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Survey Costs"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="additional-cost-amount">Amount ($)</label>
                        <Input
                          id="additional-cost-amount"
                          type="number"
                          value={newAdditionalCost.amount}
                          onChange={(e) => setNewAdditionalCost(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        if (editingCostType) {
                          handleAddCost(editingCostType);
                        } else if (isHardCostDialogOpen) {
                          handleAddCost('hard');
                        } else if (isSoftCostDialogOpen) {
                          handleAddCost('soft');
                        } else {
                          handleAddCost('land');
                        }
                      }}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Total Land Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
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

            {/* Hard Costs Section */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Hard Costs</h3>
                  <p className="text-sm text-muted-foreground">Costs associated with construction and related expenses</p>
                </div>
                <Dialog open={isHardCostDialogOpen} onOpenChange={setIsHardCostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setIsHardCostDialogOpen(true)}>Add Hard Cost</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Hard Cost</DialogTitle>
                      <DialogDescription>
                        Add a new hard cost item with its details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="hard-cost-name">Cost Name</label>
                        <Input
                          id="hard-cost-name"
                          value={newHardCost.name}
                          onChange={(e) => setNewHardCost(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Site Work"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="hard-cost-amount">Amount ($)</label>
                        <Input
                          id="hard-cost-amount"
                          type="number"
                          value={newHardCost.amount}
                          onChange={(e) => setNewHardCost(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        if (!newHardCost.name || !newHardCost.amount) return;
                        setHardCosts(prev => [...prev, { name: newHardCost.name, amount: parseInt(newHardCost.amount) || 0 }]);
                        setNewHardCost({ name: '', amount: '' });
                        setIsHardCostDialogOpen(false);
                      }}>Add Cost</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                <CostRow
                  label="Construction Costs"
                  description="Base construction cost"
                  value={constructionCost}
                  onChange={setConstructionCost}
                />
                <PercentageRow
                  label="Hard Cost Contingency"
                  description="Based on construction cost percentage"
                  baseAmount={constructionCost}
                  percentage={hardCostContingencyPct}
                  onChange={setHardCostContingencyPct}
                />
                {/* Additional Hard Costs */}
                {hardCosts.map((cost) => (
                  <AdditionalCostRow
                    key={cost.name}
                    name={cost.name}
                    amount={cost.amount}
                    onDelete={() => setHardCosts(prev => prev.filter(c => c.name !== cost.name))}
                    onEdit={() => {
                      setNewAdditionalCost({ name: cost.name, amount: cost.amount.toString() });
                      setEditingCostName(cost.name);
                      setEditingCostType('hard');
                      setIsAdditionalCostDialogOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Totals for Hard Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per Unit</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const totalCost = constructionCost + Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + hardCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                        const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                        return totalUnits > 0 ? Number(totalCost / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const totalCost = constructionCost + Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + hardCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                        const gba = proforma.gba || 0;
                        return gba > 0 ? Number(totalCost / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Hard Costs</div>
                  <div className="text-lg font-bold">
                    ${(() => {
                      const totalCost = constructionCost + Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + hardCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                      return totalCost.toLocaleString();
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Soft Costs Section */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Soft Costs</h3>
                  <p className="text-sm text-muted-foreground">Costs associated with development, consultants, admin, and marketing</p>
                </div>
                <Dialog open={isSoftCostDialogOpen} onOpenChange={setIsSoftCostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setIsSoftCostDialogOpen(true)}>Add Soft Cost</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Soft Cost</DialogTitle>
                      <DialogDescription>
                        Add a new soft cost item with its details
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="soft-cost-name">Cost Name</label>
                        <Input
                          id="soft-cost-name"
                          value={newSoftCost.name}
                          onChange={(e) => setNewSoftCost(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Legal Fees"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="soft-cost-amount">Amount ($)</label>
                        <Input
                          id="soft-cost-amount"
                          type="number"
                          value={newSoftCost.amount}
                          onChange={(e) => setNewSoftCost(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => {
                        if (!newSoftCost.name || !newSoftCost.amount) return;
                        setSoftCosts(prev => [...prev, { name: newSoftCost.name, amount: parseInt(newSoftCost.amount) || 0 }]);
                        setNewSoftCost({ name: '', amount: '' });
                        setIsSoftCostDialogOpen(false);
                      }}>Add Cost</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {/* SOFT COSTS - DEVELOPMENT */}
                <CostRow
                  label="SOFT COSTS - DEVELOPMENT"
                  value={softDev}
                  onChange={setSoftDev}
                />
                {/* SOFT COSTS - CONSULTANTS */}
                <CostRow
                  label="SOFT COSTS - CONSULTANTS"
                  value={softConsultants}
                  onChange={setSoftConsultants}
                />
                {/* ADMIN & MARKETING */}
                <CostRow
                  label="ADMIN & MARKETING"
                  value={adminMarketing}
                  onChange={setAdminMarketing}
                />
                <PercentageRow
                  label="Soft cost contingency"
                  description="Based on total of above categories"
                  baseAmount={softDev + softConsultants + adminMarketing}
                  percentage={softCostContingencyPct}
                  onChange={setSoftCostContingencyPct}
                />
                {/* Additional Soft Costs */}
                {softCosts.map((cost) => (
                  <AdditionalCostRow
                    key={cost.name}
                    name={cost.name}
                    amount={cost.amount}
                    onDelete={() => setSoftCosts(prev => prev.filter(c => c.name !== cost.name))}
                    onEdit={() => {
                      setNewAdditionalCost({ name: cost.name, amount: cost.amount.toString() });
                      setEditingCostName(cost.name);
                      setEditingCostType('soft');
                      setIsAdditionalCostDialogOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Totals for Soft Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per Unit</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const totalCost = softDev + softConsultants + adminMarketing + Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + softCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                        const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                        return totalUnits > 0 ? Number(totalCost / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const totalCost = softDev + softConsultants + adminMarketing + Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + softCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                        const gba = proforma.gba || 0;
                        return gba > 0 ? Number(totalCost / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Soft Costs</div>
                  <div className="text-lg font-bold">
                    ${(() => {
                      const totalCost = softDev + softConsultants + adminMarketing + Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + softCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                      return totalCost.toLocaleString();
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Project Cost */}
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">Total Project Cost</div>
                <div className="text-xl font-bold">
                  ${(() => {
                    // Land Costs
                    const landCosts = proforma.uses.additionalCosts?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;
                    // Hard Costs
                    const hardCostsTotal = constructionCost + Math.round(constructionCost * (hardCostContingencyPct || 0) / 100) + hardCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                    // Soft Costs
                    const softCostsTotal = softDev + softConsultants + adminMarketing + Math.round((softDev + softConsultants + adminMarketing) * (softCostContingencyPct || 0) / 100) + softCosts.reduce((sum, c) => sum + (c.amount || 0), 0);
                    return (landCosts + hardCostsTotal + softCostsTotal).toLocaleString();
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* SOURCES SECTION */}
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">Sources</h2>
              <p className="text-muted-foreground">How the project is financed</p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
              {/* Equity */}
              <PercentageRow
                label="Equity"
                description="Owner/Investor capital"
                baseAmount={totalProjectCost}
                percentage={equityPct}
                onChange={(pct) => {
                  setEquityPct(pct);
                  setDebtPct(100 - pct);
                }}
              />
              {/* Construction Debt */}
              <PercentageRow
                label="Construction Debt"
                description="Loan or construction financing"
                baseAmount={totalProjectCost}
                percentage={debtPct}
                onChange={(pct) => {
                  setDebtPct(pct);
                  setEquityPct(100 - pct);
                }}
              />

              {/* Total Sources */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total per Unit</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                        return totalUnits > 0 ? Number(totalProjectCost / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total per SF</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0 ? Number(totalProjectCost / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Sources</div>
                  <div className="text-lg font-bold">
                    ${totalProjectCost.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FINANCING COSTS SECTION */}
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">Financing Costs</h2>
              <p className="text-muted-foreground">Costs associated with financing the project</p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
              {/* Interest Cost */}
              <PercentageRow
                label="Interest cost"
                description="Annual interest rate applied to construction debt"
                baseAmount={constructionDebtAmount}
                percentage={interestPct}
                onChange={setInterestPct}
                amount={Math.round((interestPct / 100 / 12) * projectLength * constructionDebtAmount)}
              />
              {/* Broker Fee */}
              <PercentageRow
                label="Broker fee"
                description="Fee as a percentage of construction debt"
                baseAmount={constructionDebtAmount}
                percentage={brokerFeePct}
                onChange={setBrokerFeePct}
                amount={Math.round((brokerFeePct / 100) * constructionDebtAmount)}
              />

              {/* Total Financing Costs */}
              {(() => {
                // Calculate interest cost as (interestPct / 100 / 12) * projectLength * constructionDebtAmount
                const interestCost = Math.round((interestPct / 100 / 12) * projectLength * constructionDebtAmount);
                // Calculate broker fee as (brokerFeePct / 100) * constructionDebtAmount
                const brokerFee = Math.round((brokerFeePct / 100) * constructionDebtAmount);
                // Total is the sum
                const totalFinancingCosts = interestCost + brokerFee;
                const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                const gba = proforma.gba || 0;
                return (
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Total per Unit</div>
                        <div className="text-sm font-semibold">
                          ${totalUnits > 0 ? Number(totalFinancingCosts / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Total per SF</div>
                        <div className="text-sm font-semibold">
                          ${gba > 0 ? Number(totalFinancingCosts / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">Total Financing Costs</div>
                      <div className="text-lg font-bold">
                        ${totalFinancingCosts.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 