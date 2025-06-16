import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Proforma, calculateProformaMetrics } from "@/lib/session-storage"
import { useEffect, useState } from "react"

interface SummaryCardProps {
  proforma: Proforma
}

interface UnitSummary {
  totalUnits: number
  averagePricePerSqFt: number
  totalValue: number
}

function calculateUnitSummary(proforma: Proforma): UnitSummary {
  // Calculate total units
  const totalUnits = proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.length, 0)
  console.log('Total Units:', totalUnits)

  // Calculate total area
  const totalArea = proforma.unitMix.reduce((sum, unitType) => 
    sum + unitType.units.reduce((sum, unit) => sum + unit.area, 0), 0)
  console.log('Total Area:', totalArea)

  // Calculate total value
  const totalValue = proforma.unitMix.reduce((sum, unitType) => 
    sum + unitType.units.reduce((unitSum, unit) => unitSum + (unit.area * unit.value), 0), 0)
  console.log('Total Value:', totalValue)

  // Calculate average price per sq ft
  const averagePricePerSqFt = totalValue / Math.max(1, totalArea)
  console.log('Average Price per Sq Ft:', averagePricePerSqFt)

  return {
    totalUnits,
    averagePricePerSqFt,
    totalValue
  }
}

export function SummaryCard({ proforma }: SummaryCardProps) {
  const [metrics, setMetrics] = useState(proforma.metrics)

  useEffect(() => {
    // Recalculate metrics whenever proforma changes
    const updatedMetrics = calculateProformaMetrics(proforma).metrics;
    setMetrics(updatedMetrics);
  }, [proforma]);

  const unitSummary = calculateUnitSummary(proforma)

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Key metrics and totals</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="space-y-4 border-b pb-4 mb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total Profit</span>
              <span className="font-semibold">${metrics.grossProfit?.toLocaleString() || "0"}</span>
            </div>
            <div className="flex justify-between">
              <span>ROI</span>
              <span className="font-semibold">{metrics.roi?.toFixed(1) || "0.0"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Annualized ROI</span>
              <span className="font-semibold">{metrics.annualizedRoi?.toFixed(1) || "0.0"}%</span>
            </div>
            <div className="flex justify-between">
              <span>Levered EMx</span>
              <span className="font-semibold">{metrics.leveredEmx?.toFixed(1) || "0.0"}x</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="mb-4 border-b pb-4">
          <div className="font-bold mb-2">Revenue</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Gross Sales Revenue</span>
            <span className="font-semibold">${proforma.totalRevenue?.toLocaleString() || "0"}</span>
          </div>
          {/* <div className="flex justify-between text-sm mb-1">
            <span>Other Income</span>
            <span className="font-semibold">${proforma.otherIncome.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
          </div> */}
          <div className="flex justify-between text-sm mb-1">
            <span>Total Expenses</span>
            <span className="font-semibold border-b-2 border-black">${proforma.totalExpenses?.toLocaleString() || "0"}</span>
          </div>
          <div className="flex justify-between text-base font-bold mt-2">
            <span>Gross Profit</span>
            <span className="font-bold">${metrics.grossProfit?.toLocaleString() || "0"}</span>
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
            <span>{unitSummary.totalUnits}</span>
            <span>${unitSummary.averagePricePerSqFt.toFixed(0)}</span>
            <span>${unitSummary.totalValue.toLocaleString()}</span>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div>
          <div className="font-bold mb-2">Expenses Breakdown</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Land Cost</span>
            <span>${(proforma.uses.landCosts.baseCost + proforma.uses.landCosts.closingCost + 
              proforma.uses.landCosts.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Hard Costs</span>
            <span>${(proforma.uses.hardCosts.baseCost + 
              (proforma.uses.hardCosts.baseCost * proforma.uses.hardCosts.contingencyPct / 100) +
              proforma.uses.hardCosts.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Soft Costs</span>
            <span>${(proforma.uses.softCosts.development + 
              proforma.uses.softCosts.consultants + 
              proforma.uses.softCosts.adminMarketing +
              ((proforma.uses.softCosts.development + proforma.uses.softCosts.consultants + proforma.uses.softCosts.adminMarketing) * 
                proforma.uses.softCosts.contingencyPct / 100) +
              proforma.uses.softCosts.additionalCosts.reduce((sum, cost) => sum + cost.amount, 0)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold mt-2">
            <span>Total Expenses</span>
            <span className="border-b-2 border-black">${proforma.totalExpenses?.toLocaleString() ? proforma.totalExpenses.toLocaleString() : 0}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 