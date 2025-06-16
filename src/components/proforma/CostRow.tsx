import { EditableAmountInput } from "@/components/ui/EditableAmountInput";
import React from "react";

interface CostRowProps {
  /**
   * Label displayed on the left-hand side.
   */
  label: string;
  /**
   * Optional helper description.
   */
  description?: string;
  /**
   * Current numeric value of the row (currency or plain number).
   */
  value: number;
  /**
   * Callback invoked when the user changes / commits a new value.
   */
  onChange?: (val: number) => void;
  /**
   * Whether the value should be formatted as currency when read-only.
   * Defaults to true.
   */
  currency?: boolean;
  /**
   * If false, the row renders the value as read-only text instead of an <Input>
   */
  editable?: boolean;
  /**
   * Tailwind className forwarded to the <Input>. Useful for width tweaking.
   */
  inputClassName?: string;
}

/**
 * CostRow consolidates the repetitive markup used throughout the Proforma
 * editor (label + optional description + numeric input / read-only display).
 */
export function CostRow({
  label,
  description,
  value,
  onChange,
  currency = true,
  editable = true,
  inputClassName = "",
}: CostRowProps) {
  const formatted = currency ? `$${value.toLocaleString()}` : value.toLocaleString();

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex-1">
        <label className="text-sm font-medium">{label}</label>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      <div className="text-right">
        {editable && onChange ? (
          <EditableAmountInput
            value={value}
            onChange={onChange}
            currency={currency}
            className={inputClassName}
          />
        ) : (
          <span>{formatted}</span>
        )}
      </div>
    </div>
  );
} 