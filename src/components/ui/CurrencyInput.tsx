import React from 'react';
import { NumberInput } from './NumberInput';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = (props) => {
  return (
    <NumberInput
      {...props}
      allowDecimals={true}
      showCommas={true}
      prefix="$"
      placeholder="0.00"
    />
  );
}; 