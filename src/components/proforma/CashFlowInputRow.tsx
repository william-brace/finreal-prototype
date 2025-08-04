import React from "react";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NumberInput } from "@/components/ui/NumberInput";
import styles from "./tabs/CashFlowTab.module.css";

interface CashFlowInputRowProps {
  label: string;
  amount: number;
  start: number;
  length: number;
  disabled?: boolean;
  onStartChange: (value: number) => void;
  onLengthChange: (value: number) => void;
}

export function CashFlowInputRow({
  label,
  amount,
  start,
  length,
  disabled = false,
  onStartChange,
  onLengthChange,
}: CashFlowInputRowProps) {
  return (
    <tr>
      <td className={styles.monthCell}>{label}</td>
      <td className={styles.monthCell}>
        <CurrencyInput value={amount} disabled={disabled} onChange={() => {}} />
      </td>
      <td className={styles.inputCell}>
        <NumberInput
          value={start}
          onChange={onStartChange}
          allowDecimals={false}
        />
      </td>
      <td className={styles.inputCell}>
        <NumberInput
          value={length}
          onChange={onLengthChange}
          allowDecimals={false}
        />
      </td>
    </tr>
  );
}
