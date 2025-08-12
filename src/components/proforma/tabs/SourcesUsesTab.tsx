"use client";

import { AdditionalCostRow } from "@/components/proforma/AdditionalCostRow";
import { CostRow } from "@/components/proforma/CostRow";
import { PercentageRow } from "@/components/proforma/PercentageRow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/NumberInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSourcesUses } from "@/hooks/useSourcesUses";
import { formatCurrencyWithSymbol } from "@/lib/utils";
import { Proforma } from "@/lib/session-storage";

interface SourcesUsesTabProps {
  proforma: Proforma;
  onProformaChange: (proforma: Proforma) => void;
}

export function SourcesUsesTab({
  proforma,
  onProformaChange,
}: SourcesUsesTabProps) {
  const {
    // State
    newAdditionalCost,
    setNewAdditionalCost,
    isLandCostDialogOpen,
    setIsLandCostDialogOpen,
    isHardCostDialogOpen,
    setIsHardCostDialogOpen,
    isSoftCostDialogOpen,
    setIsSoftCostDialogOpen,
    isAdditionalCostDialogOpen,
    setIsAdditionalCostDialogOpen,
    setEditingCostName,
    editingCostType,
    setEditingCostType,
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
    interestOnBasis,
    setInterestOnBasis,
    payoutType,
    setPayoutType,
    loanTerms,
    setLoanTerms,

    // Handlers
    handleAddCost,
    handleDeleteAdditionalCost,

    // Calculated values
    landCosts,
    hardCostsTotal,
    softCostsTotal,
    totalProjectCost,
    totalProjectCostInclFinancing,
    debtAmountRaw,

    // Land Costs specific values
    landCost,
    setLandCost,
    closingCostPercentage,
    setClosingCostPercentage,
    additionalLandCosts,
    additionalHardCosts,
    additionalSoftCosts,
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
                {proforma.gba?.toLocaleString() || "0"} SF
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">Total Units</div>
              <div className="text-lg font-semibold">
                {proforma.unitMix
                  .reduce((sum, unitType) => sum + unitType.units.length, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          {/* USES SECTION */}
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">Uses</h2>
              <p className="text-muted-foreground">
                Project costs and expenses breakdown
              </p>
            </div>

            {/* Land Costs Section */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Land Costs</h3>
                  <p className="text-sm text-muted-foreground">
                    Costs associated with land acquisition and related expenses
                  </p>
                </div>
                <Dialog
                  open={isLandCostDialogOpen}
                  onOpenChange={setIsLandCostDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsLandCostDialogOpen(true)}
                    >
                      Add Land Cost
                    </Button>
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
                          onChange={(e) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Survey Costs"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="land-cost-amount">Amount ($)</label>
                        <NumberInput
                          id="land-cost-amount"
                          value={parseFloat(newAdditionalCost.amount) || 0}
                          onChange={(value) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              amount: value.toString(),
                            }))
                          }
                          placeholder="Enter amount"
                          allowDecimals={true}
                          showCommas={true}
                          prefix="$"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleAddCost("land")}>
                        Add Cost
                      </Button>
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
                    onDelete={() =>
                      handleDeleteAdditionalCost("land", cost.name)
                    }
                    onEdit={() => {
                      setNewAdditionalCost({
                        name: cost.name,
                        amount: cost.amount.toString(),
                      });
                      setEditingCostName(cost.name);
                      setEditingCostType("land");
                      setIsAdditionalCostDialogOpen(true);
                    }}
                  />
                ))}

                <Dialog
                  open={isAdditionalCostDialogOpen}
                  onOpenChange={(open) => {
                    setIsAdditionalCostDialogOpen(open);
                    if (!open) {
                      setEditingCostName(null);
                      setEditingCostType(null);
                      setNewAdditionalCost({ name: "", amount: "" });
                    }
                  }}
                >
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
                          onChange={(e) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Survey Costs"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="additional-cost-amount">
                          Amount ($)
                        </label>
                        <NumberInput
                          id="additional-cost-amount"
                          value={parseFloat(newAdditionalCost.amount) || 0}
                          onChange={(value) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              amount: value.toString(),
                            }))
                          }
                          placeholder="Enter amount"
                          allowDecimals={true}
                          showCommas={true}
                          prefix="$"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          if (editingCostType) {
                            handleAddCost(editingCostType);
                          } else if (isHardCostDialogOpen) {
                            handleAddCost("hard");
                          } else if (isSoftCostDialogOpen) {
                            handleAddCost("soft");
                          } else {
                            handleAddCost("land");
                          }
                        }}
                      >
                        Save Changes
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Total Land Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
                {/* Per Unit and Per SF Calculations */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      Total Cost per Unit
                    </div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const totalCost =
                          landCosts + hardCostsTotal + softCostsTotal;
                        const totalUnits = proforma.unitMix.reduce(
                          (sum, unitType) => sum + unitType.units.length,
                          0
                        );
                        return totalUnits > 0
                          ? formatCurrencyWithSymbol(
                              Number(totalCost / totalUnits)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const totalCost =
                          landCosts + hardCostsTotal + softCostsTotal;
                        const gba = proforma.gba || 0;
                        return gba > 0
                          ? formatCurrencyWithSymbol(Number(totalCost / gba))
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Land Costs</div>
                  <div className="text-lg font-bold">
                    {formatCurrencyWithSymbol(landCosts)}
                  </div>
                </div>
              </div>
            </div>

            {/* Hard Costs Section */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Hard Costs</h3>
                  <p className="text-sm text-muted-foreground">
                    Costs associated with construction and related expenses
                  </p>
                </div>
                <Dialog
                  open={isHardCostDialogOpen}
                  onOpenChange={setIsHardCostDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsHardCostDialogOpen(true)}
                    >
                      Add Hard Cost
                    </Button>
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
                          value={newAdditionalCost.name}
                          onChange={(e) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Site Work"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="hard-cost-amount">Amount ($)</label>
                        <NumberInput
                          id="hard-cost-amount"
                          value={parseFloat(newAdditionalCost.amount) || 0}
                          onChange={(value) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              amount: value.toString(),
                            }))
                          }
                          placeholder="Enter amount"
                          allowDecimals={true}
                          showCommas={true}
                          prefix="$"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          if (
                            !newAdditionalCost.name ||
                            !newAdditionalCost.amount
                          )
                            return;
                          handleAddCost("hard");
                        }}
                      >
                        Add Cost
                      </Button>
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
                {additionalHardCosts.map((cost) => (
                  <AdditionalCostRow
                    key={cost.name}
                    name={cost.name}
                    amount={cost.amount}
                    onDelete={() =>
                      handleDeleteAdditionalCost("hard", cost.name)
                    }
                    onEdit={() => {
                      setNewAdditionalCost({
                        name: cost.name,
                        amount: cost.amount.toString(),
                      });
                      setEditingCostName(cost.name);
                      setEditingCostType("hard");
                      setIsAdditionalCostDialogOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Totals for Hard Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      Total Cost per Unit
                    </div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const totalUnits = proforma.unitMix.reduce(
                          (sum, unitType) => sum + unitType.units.length,
                          0
                        );
                        return totalUnits > 0
                          ? formatCurrencyWithSymbol(
                              Number(hardCostsTotal / totalUnits)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0
                          ? formatCurrencyWithSymbol(
                              Number(hardCostsTotal / gba)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Hard Costs</div>
                  <div className="text-lg font-bold">
                    {formatCurrencyWithSymbol(hardCostsTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Soft Costs Section */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Soft Costs</h3>
                  <p className="text-sm text-muted-foreground">
                    Costs associated with development, consultants, admin, and
                    marketing
                  </p>
                </div>
                <Dialog
                  open={isSoftCostDialogOpen}
                  onOpenChange={setIsSoftCostDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSoftCostDialogOpen(true)}
                    >
                      Add Soft Cost
                    </Button>
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
                          value={newAdditionalCost.name}
                          onChange={(e) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Legal Fees"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="soft-cost-amount">Amount ($)</label>
                        <NumberInput
                          id="soft-cost-amount"
                          value={parseFloat(newAdditionalCost.amount) || 0}
                          onChange={(value) =>
                            setNewAdditionalCost((prev) => ({
                              ...prev,
                              amount: value.toString(),
                            }))
                          }
                          placeholder="Enter amount"
                          allowDecimals={true}
                          showCommas={true}
                          prefix="$"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => {
                          if (
                            !newAdditionalCost.name ||
                            !newAdditionalCost.amount
                          )
                            return;
                          handleAddCost("soft");
                        }}
                      >
                        Add Cost
                      </Button>
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
                {additionalSoftCosts.map((cost) => (
                  <AdditionalCostRow
                    key={cost.name}
                    name={cost.name}
                    amount={cost.amount}
                    onDelete={() =>
                      handleDeleteAdditionalCost("soft", cost.name)
                    }
                    onEdit={() => {
                      setNewAdditionalCost({
                        name: cost.name,
                        amount: cost.amount.toString(),
                      });
                      setEditingCostName(cost.name);
                      setEditingCostType("soft");
                      setIsAdditionalCostDialogOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Totals for Soft Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                      Total Cost per Unit
                    </div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const totalUnits = proforma.unitMix.reduce(
                          (sum, unitType) => sum + unitType.units.length,
                          0
                        );
                        return totalUnits > 0
                          ? formatCurrencyWithSymbol(
                              Number(softCostsTotal / totalUnits)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Cost per SF</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0
                          ? formatCurrencyWithSymbol(
                              Number(softCostsTotal / gba)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Soft Costs</div>
                  <div className="text-lg font-bold">
                    {formatCurrencyWithSymbol(softCostsTotal)}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Project Cost */}
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">Total Project Cost</div>
                <div className="text-xl font-bold">
                  {formatCurrencyWithSymbol(totalProjectCost)}
                </div>
              </div>
            </div>
          </div>

          {/* SOURCES SECTION */}
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">Sources</h2>
              <p className="text-muted-foreground">
                How the project is financed
              </p>
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
              {/* Debt */}
              <PercentageRow
                label="Debt"
                description="Loan or debt financing"
                baseAmount={totalProjectCost}
                percentage={debtPct}
                onChange={(pct) => {
                  setDebtPct(pct);
                  setEquityPct(100 - pct);
                }}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Interest On</label>
                  <Select
                    value={interestOnBasis}
                    onValueChange={(val) =>
                      setInterestOnBasis(val as "drawnBalance" | "entireLoan")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select basis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drawnBalance">
                        Drawn Balance
                      </SelectItem>
                      <SelectItem value="entireLoan">Entire Loan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Payout</label>
                  <Select
                    value={payoutType}
                    onValueChange={(val) =>
                      setPayoutType(val as "serviced" | "rolledUp")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serviced">Serviced</SelectItem>
                      <SelectItem value="rolledUp">Rolled up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label
                    htmlFor="loan-term-months"
                    className="text-sm font-medium"
                  >
                    Term (months)
                  </label>
                  <NumberInput
                    id="loan-term-months"
                    value={loanTerms || 0}
                    onChange={(value) => setLoanTerms(Number(value) || 0)}
                    placeholder="Enter months"
                    allowDecimals={false}
                    showCommas={false}
                  />
                </div>
              </div>

              {/* Total Sources */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total per Unit</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const totalUnits = proforma.unitMix.reduce(
                          (sum, unitType) => sum + unitType.units.length,
                          0
                        );
                        return totalUnits > 0
                          ? formatCurrencyWithSymbol(
                              Number(totalProjectCost / totalUnits)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total per SF</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0
                          ? formatCurrencyWithSymbol(
                              Number(totalProjectCost / gba)
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">Total Sources</div>
                  <div className="text-lg font-bold">
                    {formatCurrencyWithSymbol(totalProjectCost)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FINANCING COSTS SECTION */}
          <div className="space-y-8">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-primary mb-2">
                Financing Costs
              </h2>
              <p className="text-muted-foreground">
                Costs associated with financing the project
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
              {/* Financing Options */}

              {/* Interest Cost */}
              <PercentageRow
                label="Interest cost"
                description="Annual interest rate applied to debt"
                baseAmount={debtAmountRaw}
                percentage={interestPct}
                onChange={setInterestPct}
                amount={proforma.sources.financingCosts.interestCost}
              />
              {/* Canadian Prime Rate Note */}
              <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                💡 Default rate reflects current Canadian Prime Rate (4.95%)
              </div>
              {/* Broker Fee */}
              <PercentageRow
                label="Broker fee"
                description="Fee as a percentage of debt"
                baseAmount={debtAmountRaw}
                percentage={brokerFeePct}
                onChange={setBrokerFeePct}
                amount={proforma.sources.financingCosts.brokerFee}
              />

              {/* Total Financing Costs */}
              <div className="mt-6 pt-4 border-t border-border/50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total per Unit</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const totalUnits = proforma.unitMix.reduce(
                          (sum, unitType) => sum + unitType.units.length,
                          0
                        );
                        return totalUnits > 0
                          ? formatCurrencyWithSymbol(
                              Number(
                                proforma.sources.financingCosts
                                  .totalFinancingCost / totalUnits
                              )
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total per SF</div>
                    <div className="text-sm font-semibold">
                      {(() => {
                        const gba = proforma.gba || 0;
                        return gba > 0
                          ? formatCurrencyWithSymbol(
                              Number(
                                proforma.sources.financingCosts
                                  .totalFinancingCost / gba
                              )
                            )
                          : formatCurrencyWithSymbol(0);
                      })()}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold">
                    Total Financing Costs
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrencyWithSymbol(
                      proforma.sources?.financingCosts?.totalFinancingCost || 0
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Project Cost Incl. Financing */}
          <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-xl font-bold">
                  Total Project Cost Incl. Financing
                </div>
                <div className="text-xl font-bold">
                  {formatCurrencyWithSymbol(totalProjectCostInclFinancing)}
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <div className="text-muted-foreground">Base Project Cost</div>
                  <div>{formatCurrencyWithSymbol(totalProjectCost)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-muted-foreground">Financing Costs</div>
                  <div>
                    {formatCurrencyWithSymbol(
                      proforma.sources?.financingCosts?.totalFinancingCost || 0
                    )}
                  </div>
                </div>
              </div>

              {/* Per Unit and Per SF Calculations */}
              <div className="space-y-2 pt-2 border-t border-primary/20">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Total Cost per Unit</div>
                  <div className="text-sm font-semibold">
                    {(() => {
                      const totalUnits = proforma.unitMix.reduce(
                        (sum, unitType) => sum + unitType.units.length,
                        0
                      );
                      return totalUnits > 0
                        ? formatCurrencyWithSymbol(
                            Number(totalProjectCostInclFinancing / totalUnits)
                          )
                        : formatCurrencyWithSymbol(0);
                    })()}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Total Cost per SF</div>
                  <div className="text-sm font-semibold">
                    {(() => {
                      const gba = proforma.gba || 0;
                      return gba > 0
                        ? formatCurrencyWithSymbol(
                            Number(totalProjectCostInclFinancing / gba)
                          )
                        : formatCurrencyWithSymbol(0);
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
