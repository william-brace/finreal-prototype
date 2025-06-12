import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";

interface AdditionalCostRowProps {
  name: string;
  amount: number;
  onDelete: () => void;
  onEdit: () => void;
}

export function AdditionalCostRow({ name, amount, onDelete, onEdit }: AdditionalCostRowProps) {
  return (
    <div 
      className="flex items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
      onClick={onEdit}
    >
      <div className="flex-1">
        <label className="text-sm font-medium">{name}</label>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold">${amount.toLocaleString()}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete cost</span>
        </Button>
      </div>
    </div>
  );
} 