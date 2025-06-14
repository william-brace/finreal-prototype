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
import { Proforma } from "@/lib/session-storage"
import { CostRow } from "@/components/proforma/CostRow"
import { PercentageRow } from "@/components/proforma/PercentageRow"
import { AdditionalCostRow } from "@/components/proforma/AdditionalCostRow"
import { useSourcesUses } from "@/hooks/useSourcesUses"

interface SourcesUsesTabProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function SourcesUsesTab({ proforma, onProformaChange }: SourcesUsesTabProps) {
  const {
    // State
    newAdditionalCost,
    setNewAdditionalCost,
    newHardCost,
    setNewHardCost,
    newSoftCost,
    setNewSoftCost,
    isLandCostDialogOpen,
    setIsLandCostDialogOpen,
    isHardCostDialogOpen,
    setIsHardCostDialogOpen,
    isSoftCostDialogOpen,
    setIsSoftCostDialogOpen,
    isAdditionalCostDialogOpen,
    setIsAdditionalCostDialogOpen,
    editingCostName,
    setEditingCostName,
    editingCostType,
    setEditingCostType,
    hardCosts,
    setHardCosts,
    softCosts,
    setSoftCosts,
    constructionCost,
    setConstructionCost,
    hardCostContingencyPct,
    setHardCostContingencyPct,
    softDev,
    setSoftDev,
    softConsultants,
    setSoftConsultants,
    adminMarketing,
    setAdminMarketing,
    softCostContingencyPct,
    setSoftCostContingencyPct,
    equityPct,
    setEquityPct,
    debtPct,
    setDebtPct,
    interestPct,
    setInterestPct,
    brokerFeePct,
    setBrokerFeePct,

    // Handlers
    handleAddCost,
    handleDeleteAdditionalCost,

    // Calculated values
    landCosts,
    hardCostsTotal,
    softCostsTotal,
    totalProjectCost,
    equityAmount,
    debtAmount,
    constructionDebtAmount,
    projectLength,
    interestCostAmount,
    brokerFeeAmount,
    landCost,
    setLandCost,
    closingCostPercentage,
    setClosingCostPercentage,
    additionalLandCosts,
  } = useSourcesUses({ proforma, onProformaChange });

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
                  value={landCost}
                  onChange={setLandCost}
                />
                {/* Pre-populated Closing Costs */}
                <PercentageRow
                  label="Closing Costs"
                  description="Based on land cost percentage"
                  baseAmount={landCost}
                  percentage={closingCostPercentage}
                  onChange={setClosingCostPercentage}
                />
                {/* Additional Land Costs */}
                {additionalLandCosts.map((cost) => (
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
                    ${landCosts.toLocaleString()}
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
                        const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                        return totalUnits > 0 ? Number(hardCostsTotal / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0 ? Number(hardCostsTotal / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Hard Costs</div>
                  <div className="text-lg font-bold">
                    ${hardCostsTotal.toLocaleString()}
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
                        const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0);
                        return totalUnits > 0 ? Number(softCostsTotal / totalUnits).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      ${(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0 ? Number(softCostsTotal / gba).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Soft Costs</div>
                  <div className="text-lg font-bold">
                    ${softCostsTotal.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Project Cost */}
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">Total Project Cost</div>
                <div className="text-xl font-bold">
                  ${totalProjectCost.toLocaleString()}
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