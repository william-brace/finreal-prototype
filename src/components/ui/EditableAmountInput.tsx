import React, { useState, useRef, useEffect } from 'react';

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
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      onChange(num);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={min}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') setEditing(false);
        }}
        className={`h-8 w-24 px-2 border rounded ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      className={`cursor-pointer p-2 rounded bg-background border border-input hover:bg-accent hover:text-accent-foreground transition-colors  text-right ${className}`}
      onClick={() => setEditing(true)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') setEditing(true); }}
      role="button"
      aria-label="Edit amount"
    >
      {currency ? `$${value.toLocaleString()}` : value.toLocaleString()}
    </div>
  );
};

export default EditableAmountInput; 