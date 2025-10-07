"use client";

import { Checkbox } from "./checkbox";
import { forwardRef } from "react";

interface FormCheckboxProps {
  id: string;
  label: string;
  className?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ id, label, className, ...props }, ref) => {
    return (
      <div className={`flex items-center space-x-2 ${className || ""}`}>
        <Checkbox id={id} ref={ref} {...props} />
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
