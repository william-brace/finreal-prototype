import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Proforma } from "@/lib/session-storage";
import React from "react";

interface Props {
  proforma: Proforma;
}

export function ResultsTab({ proforma }: Props) {
  const { totalProjectCost, netProfit, roi, costPerUnit } = proforma.results;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Financial analysis and metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Total Project Cost</label>
            <Input value={`$${totalProjectCost.toLocaleString()}`} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Net Profit</label>
            <Input value={`$${netProfit.toLocaleString()}`} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">ROI</label>
            <Input value={`${roi}%`} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Cost per Unit</label>
            <Input value={`$${costPerUnit.toLocaleString()}`} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 