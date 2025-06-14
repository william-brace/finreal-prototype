import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Proforma } from "@/lib/session-storage"
import { useEffect, useState } from "react"

interface SummaryCardProps {
  proforma: Proforma
}

export function SummaryCard({ proforma }: SummaryCardProps) {
  const [metrics, setMetrics] = useState(proforma.metrics)

  useEffect(() => {
    // Recalculate metrics whenever proforma changes
    setMetrics(proforma.metrics)
  }, [proforma])

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
            <div className="flex justify-between"><span>ROI</span><span className="font-semibold">{metrics.roi.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>Annualized ROI</span><span className="font-semibold">{metrics.annualizedRoi.toFixed(1)}%</span></div>
            <div className="flex justify-between"><span>Levered IRR</span><span className="font-semibold">20%</span></div>
            <div className="flex justify-between"><span>Levered EMx</span><span className="font-semibold">{metrics.leveredEmx.toFixed(1)}x</span></div>
          </div>
        </div>

        {/* Revenue */}
        <div className="mb-4 border-b pb-4">
          <div className="font-bold mb-2">Revenue</div>
          <div className="flex justify-between text-sm mb-1">
            <span>Gross Sales Revenue</span>
            <span className="font-semibold">${proforma.totalRevenue?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Other Income</span>
            <span className="font-semibold">${proforma.otherIncome.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Total Expenses</span>
            <span className="font-semibold border-b-2 border-black">${proforma.totalExpenses?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-base font-bold mt-2">
            <span>Gross Profit</span>
            <span className="font-bold">${metrics.grossProfit.toLocaleString()}</span>
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
            <span>${proforma.unitMix.reduce((sum, unitType) => sum + unitType.units.reduce((unitSum, unit) => unitSum + (unit.area * unit.value), 0), 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Expenses Breakdown */}
        <div>
          <div className="font-bold mb-2">Expenses Breakdown</div>
          <div className="flex justify-between text-sm mb-1"><span>Land Cost</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('land'))?.amount || 0).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Hard Costs</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('hard'))?.amount || 0).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Soft Costs</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('soft'))?.amount || 0).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Contingency</span><span>${(proforma.uses.additionalCosts?.find(c => c.name.toLowerCase().includes('contingency'))?.amount || 0).toLocaleString()}</span></div>
          <div className="flex justify-between text-sm font-semibold mt-2"><span>Total Expenses</span><span className="border-b-2 border-black">${proforma.totalExpenses?.toLocaleString()}</span></div>
        </div>
      </CardContent>
    </Card>
  )
} 