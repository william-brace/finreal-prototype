import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { formatCurrency, parseCurrency, roundToTwoDecimals } from '@/lib/utils';

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

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = '0.00',
  className = '',
  disabled = false,
  min,
  max,
  step = 0.01,
  id,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    setDisplayValue(value.toString());
    inputRef.current?.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsedValue = parseCurrency(displayValue);
    const roundedValue = roundToTwoDecimals(parsedValue);
    
    // Apply min/max constraints
    let finalValue = roundedValue;
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;
    
    onChange(finalValue);
    setDisplayValue(formatCurrency(finalValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input for better UX
    if (inputValue === '') {
      setDisplayValue('');
      return;
    }
    
    // Only allow valid numeric input (including decimal point)
    if (/^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      setDisplayValue(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      inputMode="decimal"
    />
  );
}; 