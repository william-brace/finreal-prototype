import { NumberInput } from "@/components/ui/NumberInput";
import { formatCurrencyWithSymbol } from "@/lib/utils";
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


  // Use the override amount if provided, otherwise use the default calculation
  const displayAmount = typeof amount === 'number' ? amount : Math.round(baseAmount * (percentage || 0) / 100);

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <label className="text-sm font-medium">{label}</label>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">{formatCurrencyWithSymbol(displayAmount)}</div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <NumberInput
              value={parseFloat(draft) || 0}
              onChange={(value) => {
                setDraft(value.toString());
                onChange(value);
              }}
              placeholder="0.0"
              allowDecimals={true}
              showCommas={false}
              min={0}
              max={100}
              className="h-8 w-24 pr-6"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>
    </div>
  );
} 