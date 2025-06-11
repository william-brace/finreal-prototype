import { Input } from "@/components/ui/input";
import React, { useState } from "react";

interface Props {
  label: string;
  description?: string;
  baseAmount: number; // amount the percentage applies to
  percentage: number; // current pct value
  onChange: (pct: number) => void;
}

/**
 * Renders a row with: label/description • computed $amount • editable % input
 */
export function PercentageRow({ label, description, baseAmount, percentage, onChange }: Props) {
  // local draft so typing 3.5 etc feels responsive
  const [draft, setDraft] = useState(String(percentage));

  const commit = () => {
    const pct = parseFloat(draft);
    onChange(Number.isFinite(pct) ? pct : 0);
  };

  const amount = Math.round(baseAmount * (percentage || 0) / 100);

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <label className="text-sm font-medium">{label}</label>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">${amount.toLocaleString()}</div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.1"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="h-8 w-24"
          />
          <span className="text-sm">%</span>
        </div>
      </div>
    </div>
  );
} 