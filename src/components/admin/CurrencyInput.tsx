import React, { useState, useEffect } from 'react';
import { Input } from './FormField';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange: (e: { target: { value: string } }) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, ...props }) => {
  const [displayValue, setDisplayValue] = useState('IDR 0');

  useEffect(() => {
    // Sync external value changes if it exists, otherwise default to IDR 0
    if (value !== undefined) {
      setDisplayValue(value || 'IDR 0');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Strip all non-digit characters
    const digits = rawVal.replace(/\D/g, '');
    
    let formatted = 'IDR 0';
    if (digits) {
      // Parse to integer and format with Indonesian locale (uses dot for thousands)
      const num = parseInt(digits, 10);
      formatted = `IDR ${num.toLocaleString('id-ID')}`;
    }
    
    setDisplayValue(formatted);
    // Mimic the event object so we don't break existing onChange handlers
    onChange({ target: { value: formatted } });
  };

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
    />
  );
};
