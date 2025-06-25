import React, { useState, useRef, useEffect } from 'react';
import { formatCurrencyWithSymbol, formatCurrency, parseCurrency, roundToTwoDecimals } from '@/lib/utils';

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
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) {
      setInputValue(value.toString());
    }
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    if (currency) {
      const parsedValue = parseCurrency(inputValue);
      const roundedValue = roundToTwoDecimals(parsedValue);
      onChange(roundedValue);
    } else {
      const num = parseFloat(inputValue);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        min={min}
        value={inputValue}
        onChange={e => {
          const val = e.target.value;
          if (currency) {
            // Allow only valid currency input
            if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
              setInputValue(val);
            }
          } else {
            setInputValue(val);
          }
        }}
        onBlur={handleSave}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setEditing(false);
        }}
        className={`h-8 w-24 px-2 border rounded ${className}`}
        placeholder={placeholder}
        inputMode="decimal"
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