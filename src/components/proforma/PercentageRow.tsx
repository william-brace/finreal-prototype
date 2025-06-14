import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";

interface Props {
  label: string;
  description?: string;
  baseAmount: number; // amount the percentage applies to
  percentage: number; // current pct value
  onChange: (pct: number) => void;
  amount?: number; // optional override for displayed $ amount
}

/**
 * Renders a row with: label/description • computed $amount • editable % input
 */
export function PercentageRow({ label, description, baseAmount, percentage, onChange, amount }: Props) {
  // local draft so typing 3.5 etc feels responsive
  const [draft, setDraft] = useState(String(percentage));

  // Update draft when percentage prop changes
  useEffect(() => {
    setDraft(String(percentage));
  }, [percentage]);

  const commit = () => {
    const pct = parseFloat(draft);
    onChange(Number.isFinite(pct) ? pct : 0);
  };

  // Use the override amount if provided, otherwise use the default calculation
  const displayAmount = typeof amount === 'number' ? amount : Math.round(baseAmount * (percentage || 0) / 100);

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <label className="text-sm font-medium">{label}</label>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">${displayAmount.toLocaleString()}</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              className="h-8 w-16 pr-6 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </div>
  );
} 