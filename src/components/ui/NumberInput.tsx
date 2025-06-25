import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { formatCurrency, parseCurrency, roundToTwoDecimals } from '@/lib/utils';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  allowDecimals?: boolean;
  showCommas?: boolean;
  prefix?: string;
  suffix?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  disabled = false,
  min,
  max,
  id,
  allowDecimals = true,
  showCommas = true,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Format number for display
  const formatNumber = (num: number): string => {
    if (!showCommas) {
      return allowDecimals ? num.toFixed(2) : Math.round(num).toString();
    }
    
    if (allowDecimals) {
      return formatCurrency(num);
    } else {
      return Math.round(num).toLocaleString();
    }
  };

  // Parse input value back to number
  const parseNumber = (inputValue: string): number => {
    if (showCommas) {
      return parseCurrency(inputValue);
    } else {
      const cleanValue = inputValue.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleanValue);
      return isNaN(parsed) ? 0 : parsed;
    }
  };

  // Update display value when prop value changes
  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused, allowDecimals, showCommas]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show raw number when focused for easier editing
    setDisplayValue(value.toString());
    inputRef.current?.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsedValue = parseNumber(displayValue);
    const finalValue = allowDecimals ? roundToTwoDecimals(parsedValue) : Math.round(parsedValue);
    
    // Apply min/max constraints
    let constrainedValue = finalValue;
    if (min !== undefined && constrainedValue < min) constrainedValue = min;
    if (max !== undefined && constrainedValue > max) constrainedValue = max;
    
    onChange(constrainedValue);
    setDisplayValue(formatNumber(constrainedValue));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input for better UX
    if (inputValue === '') {
      setDisplayValue('');
      return;
    }
    
    // Validate input based on configuration
    let isValid = false;
    if (showCommas) {
      // Allow commas, decimal points, and numbers
      isValid = /^[0-9,]*\.?[0-9]*$/.test(inputValue);
    } else if (allowDecimals) {
      // Allow decimal points and numbers
      isValid = /^[0-9]*\.?[0-9]*$/.test(inputValue);
    } else {
      // Only allow integers
      isValid = /^[0-9]*$/.test(inputValue);
    }
    
    if (isValid) {
      setDisplayValue(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const getDisplayValue = () => {
    if (isFocused) {
      return displayValue;
    }
    return `${prefix}${displayValue}${suffix}`;
  };

  return (
    <Input
      ref={inputRef}
      id={id}
      type="text"
      value={getDisplayValue()}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      inputMode={allowDecimals ? "decimal" : "numeric"}
    />
  );
}; 