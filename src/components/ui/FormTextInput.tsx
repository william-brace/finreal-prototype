"use client";

import { forwardRef } from "react";
import { Input } from "./input";
import { FieldError } from "react-hook-form";

interface FormTextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export const FormTextInput = forwardRef<HTMLInputElement, FormTextInputProps>(
  ({ label, error, id, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <Input id={id} ref={ref} className={className} {...props} />
        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>
    );
  }
);

FormTextInput.displayName = "FormTextInput";
