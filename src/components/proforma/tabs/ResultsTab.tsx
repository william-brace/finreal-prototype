import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Proforma, getProforma } from "@/lib/session-storage";
import React, { useEffect, useState } from "react";

interface Props {
  proforma: Proforma;
}

export function ResultsTab({ proforma }: Props) {
  const [latestProforma, setLatestProforma] = useState<Proforma>(proforma);

  useEffect(() => {
    const updatedProforma = getProforma(proforma.projectId, proforma.id);
    if (updatedProforma) {
      setLatestProforma(updatedProforma);
    }
  }, [proforma.projectId, proforma.id]);

  const { grossProfit, leveredEmx, roi, annualizedRoi } = latestProforma.metrics;
  console.log(latestProforma.metrics);
  const { totalExpenses } = latestProforma;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Financial analysis and metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Total Profit</label>
            <Input value={grossProfit !== undefined ? `$${grossProfit.toLocaleString()}` : "-"} readOnly />
          </div>
   
          <div>
            <label className="text-sm font-medium">ROI</label>
            <Input value={roi !== undefined ? `${roi.toFixed(2)}%` : "-"} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Annualized ROI</label>
            <Input value={annualizedRoi !== undefined ? `${annualizedRoi.toFixed(2)}%` : "-"} readOnly />
          </div>
          <div>
            <label className="text-sm font-medium">Levered Emx</label>
            <Input value={leveredEmx !== undefined ? leveredEmx.toFixed(2) : "-"} readOnly />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 