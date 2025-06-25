import { formatCurrency, formatCurrencyWithSymbol } from '@/lib/utils';
import React, { useState } from 'react';
import { NumberInput } from './NumberInput';

interface EditableAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  currency?: boolean;
  min?: number;
}

export const EditableAmountInput: React.FC<EditableAmountInputProps> = ({
  value,
  onChange,
  className = '',
  placeholder = '',
  currency = true,
  min,
}) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <NumberInput
        value={value}
        onChange={(newValue) => {
          onChange(newValue);
          setEditing(false);
        }}
        placeholder={placeholder}
        className={`h-8 w-24 ${className}`}
        allowDecimals={currency}
        showCommas={currency}
        prefix={currency ? "$" : ""}
        min={min}
      />
    );
  }

  return (
    <div
      className={`cursor-pointer p-2 rounded bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors text-right ${className}`}
      onClick={() => setEditing(true)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') setEditing(true); }}
      role="button"
      aria-label="Edit amount"
    >
      {currency ? formatCurrencyWithSymbol(value) : formatCurrency(value)}
    </div>
  );
};

export default EditableAmountInput; 