"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCashFlowTab } from "@/hooks/useCashFlowTab";
import { Proforma } from "@/lib/session-storage";
import styles from "./CashFlowTab.module.css";

interface CashFlowTabProps {
  proforma: Proforma;
}

export function CashFlowTab({ proforma }: CashFlowTabProps) {
  const {
    cashFlowState,
    updateCashFlowItem,
    getLandCostDisplayName,
    getHardCostDisplayName,
    getSoftCostDisplayName,
    getMonthlyValue,
    formatMonthlyCashFlow,
    calculateUnitsTotal,
    calculateOtherIncomeTotal,
    calculateLandCostsTotal,
    calculateHardCostsTotal,
    calculateSoftCostsTotal,
    calculateRevenueTotal,
    monthlyInterestRate,
    debtPct,
    loanTerm,
    payoutType,
    sumInterestPayments,
    calculateInterestPayment,
    calculateTotalExpensesIncludingInterest,
    loanStartMonth,
    calculateEquityContribution,
    calculateDebtDraw,
    calculateCompleteNetCashFlow,
    leveredIrrAnnual,
    leveredEMx,
    unleveredIrrAnnual,
    unleveredEMx,
    calculatePrincipalRepayment,
    sumPrincipalRepayments,
  } = useCashFlowTab(proforma);

  // Local refs and scroll sync for the div-based grid

  const formatPct = (v: number | null | undefined) =>
    v == null ? "–" : `${(v * 100).toFixed(2)}%`;
  const formatMult = (v: number | null | undefined) =>
    v == null ? "–" : `${v.toFixed(2)}x`;

  const irrClass = (v: number | null | undefined) =>
    v == null
      ? styles.metricNeutral
      : v >= 0
      ? styles.metricPositive
      : styles.metricNegative;
  const emxClass = irrClass;

  const getCashFlowClass = (value: number) => {
    return `${styles.cashFlowCell} ${
      value >= 0 ? styles.positive : styles.negative
    }`;
  };

  const getRevenueClass = (value: number) => {
    return `${styles.revenueCell} ${value > 0 ? styles.positive : ""}`;
  };

  // Helpers for timing inputs: allow 0 for start, require >=1 for length
  const clampTiming = (field: "start" | "length", value: number) => {
    const min = field === "length" ? 1 : 0;
    const max = 120;
    return Math.max(min, Math.min(max, value));
  };

  const commitTiming = (
    section: "units" | "otherIncome" | "landCosts" | "hardCosts" | "softCosts",
    itemId: string,
    field: "start" | "length",
    inputEl: HTMLInputElement
  ) => {
    const raw = inputEl.value.trim();
    const emptyFallback = field === "length" ? 1 : 0;
    let parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) parsed = emptyFallback;
    const clamped = clampTiming(field, parsed);
    if (clamped !== parsed) inputEl.value = String(clamped);
    updateCashFlowItem(section, itemId, field, clamped);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
        <CardDescription>
          Monthly cash flow projections throughout the project timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Levered IRR (annual)</div>
            <div
              className={`${styles.metricValue} ${irrClass(leveredIrrAnnual)}`}
            >
              {formatPct(leveredIrrAnnual)}
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Levered EMx</div>
            <div className={`${styles.metricValue} ${emxClass(leveredEMx)}`}>
              {formatMult(leveredEMx)}
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Unlevered IRR (annual)</div>
            <div
              className={`${styles.metricValue} ${irrClass(
                unleveredIrrAnnual
              )}`}
            >
              {formatPct(unleveredIrrAnnual)}
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Unlevered EMx</div>
            <div className={`${styles.metricValue} ${emxClass(unleveredEMx)}`}>
              {formatMult(unleveredEMx)}
            </div>
          </div>
        </div>

        {/* Cashflow grid */}
        <div className={styles.container}>
          {/* Fixed left column */}
          <div className={styles.fixedColumn}>
            {/* Revenue header */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.leftHeaderCell} ${styles.spanAll}`}>
                Revenue
              </div>
            </div>
            {/* Sub header */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={styles.leftHeaderCell}>Item</div>
              <div className={styles.leftHeaderCell}>Amount</div>
              <div className={styles.leftHeaderCell}>Start</div>
              <div className={styles.leftHeaderCell}>Length</div>
            </div>
            {/* Units section title */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.sectionHeader} ${styles.spanAll}`}>
                Units
              </div>
            </div>
            {/* Dynamic unit rows */}
            {proforma.unitMix?.map((unitType) => (
              <div
                key={unitType.id}
                className={`${styles.leftRow} ${styles.rowHeight}`}
              >
                <div className={`${styles.leftDataCell}`}>{unitType.name}</div>
                <div className={`${styles.leftAmountCell}`}>
                  $
                  {(
                    cashFlowState.units[unitType.id]?.amount || 0
                  ).toLocaleString()}
                </div>
                <div className={styles.inputWrap}>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    max={120}
                    step={1}
                    className={styles.inputField}
                    defaultValue={cashFlowState.units[unitType.id]?.start ?? 1}
                    onBlur={(e) =>
                      commitTiming(
                        "units",
                        unitType.id,
                        "start",
                        e.currentTarget
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitTiming(
                          "units",
                          unitType.id,
                          "start",
                          e.currentTarget as HTMLInputElement
                        );
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                  />
                </div>
                <div className={styles.inputWrap}>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={120}
                    step={1}
                    className={styles.inputField}
                    defaultValue={cashFlowState.units[unitType.id]?.length ?? 1}
                    onBlur={(e) =>
                      commitTiming(
                        "units",
                        unitType.id,
                        "length",
                        e.currentTarget
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitTiming(
                          "units",
                          unitType.id,
                          "length",
                          e.currentTarget as HTMLInputElement
                        );
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            {/* Units total */}
            {proforma.unitMix && proforma.unitMix.length > 0 && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.sectionTotalCell}`}>Units Total</div>
                <div className={`${styles.sectionTotalCell}`}>
                  $
                  {Object.values(cashFlowState.units)
                    .reduce((s, v) => s + v.amount, 0)
                    .toLocaleString()}
                </div>
                <div className={`${styles.sectionTotalCell}`}>-</div>
                <div className={`${styles.sectionTotalCell}`}>-</div>
              </div>
            )}

            {/* Other Income header */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.sectionHeader} ${styles.spanAll}`}>
                Other Income
              </div>
            </div>
            {proforma.otherIncome?.map((income) => (
              <div
                key={income.id}
                className={`${styles.leftRow} ${styles.rowHeight}`}
              >
                <div className={styles.leftDataCell}>{income.name}</div>
                <div className={styles.leftAmountCell}>
                  $
                  {(
                    cashFlowState.otherIncome[income.id]?.amount || 0
                  ).toLocaleString()}
                </div>
                <div className={styles.inputWrap}>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={0}
                    max={120}
                    step={1}
                    className={styles.inputField}
                    defaultValue={
                      cashFlowState.otherIncome[income.id]?.start ?? 1
                    }
                    onBlur={(e) =>
                      commitTiming(
                        "otherIncome",
                        income.id,
                        "start",
                        e.currentTarget
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitTiming(
                          "otherIncome",
                          income.id,
                          "start",
                          e.currentTarget as HTMLInputElement
                        );
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                  />
                </div>
                <div className={styles.inputWrap}>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min={1}
                    max={120}
                    step={1}
                    className={styles.inputField}
                    defaultValue={
                      cashFlowState.otherIncome[income.id]?.length ?? 1
                    }
                    onBlur={(e) =>
                      commitTiming(
                        "otherIncome",
                        income.id,
                        "length",
                        e.currentTarget
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        commitTiming(
                          "otherIncome",
                          income.id,
                          "length",
                          e.currentTarget as HTMLInputElement
                        );
                        (e.currentTarget as HTMLInputElement).blur();
                      }
                    }}
                  />
                </div>
              </div>
            ))}
            {proforma.otherIncome && proforma.otherIncome.length > 0 && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.sectionTotalCell}`}>
                  Other Income Total
                </div>
                <div className={`${styles.sectionTotalCell}`}>
                  $
                  {Object.values(cashFlowState.otherIncome)
                    .reduce((s, v) => s + v.amount, 0)
                    .toLocaleString()}
                </div>
                <div className={`${styles.sectionTotalCell}`}>-</div>
                <div className={`${styles.sectionTotalCell}`}>-</div>
              </div>
            )}
            {/* Revenue total */}
            {((proforma.unitMix && proforma.unitMix.length > 0) ||
              (proforma.otherIncome && proforma.otherIncome.length > 0)) && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.totalCell}`}>Total Revenue</div>
                <div className={`${styles.totalCell}`}>
                  $
                  {(
                    Object.values(cashFlowState.units).reduce(
                      (s, v) => s + v.amount,
                      0
                    ) +
                    Object.values(cashFlowState.otherIncome).reduce(
                      (s, v) => s + v.amount,
                      0
                    )
                  ).toLocaleString()}
                </div>
                <div className={`${styles.totalCell}`}>-</div>
                <div className={`${styles.totalCell}`}>-</div>
              </div>
            )}

            {/* Financing header */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.leftHeaderCell} ${styles.spanAll}`}>
                Financing
              </div>
            </div>
            {/* Equity contribution row */}
            {proforma.sources?.equityPct > 0 && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.sectionTotalCell}`}>
                  Equity Contribution
                </div>
                <div className={`${styles.sectionTotalCell}`}>
                  $
                  {Array.from({ length: 120 }, (_, m) =>
                    calculateEquityContribution(m + 1)
                  )
                    .reduce((s, v) => s + v, 0)
                    .toLocaleString()}
                </div>
                <div className={`${styles.sectionTotalCell}`}>-</div>
                <div className={`${styles.sectionTotalCell}`}>-</div>
              </div>
            )}
            {/* Debt draw row */}
            {loanTerm > 0 && debtPct > 0 && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.sectionTotalCell}`}>Debt Draw</div>
                <div className={`${styles.sectionTotalCell}`}>
                  $
                  {Array.from({ length: 120 }, (_, m) =>
                    calculateDebtDraw(m + 1)
                  )
                    .reduce((s, v) => s + v, 0)
                    .toLocaleString()}
                </div>
                <div className={`${styles.sectionTotalCell}`}>
                  {loanStartMonth}
                </div>
                <div className={`${styles.sectionTotalCell}`}>{loanTerm}</div>
              </div>
            )}
            {/* Removed Total Financing summary since equity is not an inflow */}

            {/* Expenses header */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.leftHeaderCell} ${styles.spanAll}`}>
                Expenses
              </div>
            </div>
            {/* Land costs */}
            {Object.keys(cashFlowState.landCosts).length > 0 && (
              <>
                <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                  <div className={`${styles.sectionHeader} ${styles.spanAll}`}>
                    Land Costs
                  </div>
                </div>
                {Object.entries(cashFlowState.landCosts).map(
                  ([key, landCost]) => {
                    const index = key.startsWith("additional_")
                      ? parseInt(key.split("_")[1])
                      : undefined;
                    return (
                      <div
                        key={key}
                        className={`${styles.leftRow} ${styles.rowHeight}`}
                      >
                        <div className={styles.leftDataCell}>
                          {getLandCostDisplayName(key, index)}
                        </div>
                        <div className={styles.leftAmountCell}>
                          ${(landCost.amount || 0).toLocaleString()}
                        </div>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={120}
                            step={1}
                            className={styles.inputField}
                            defaultValue={landCost.start ?? 1}
                            onBlur={(e) =>
                              commitTiming(
                                "landCosts",
                                key,
                                "start",
                                e.currentTarget
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitTiming(
                                  "landCosts",
                                  key,
                                  "start",
                                  e.currentTarget as HTMLInputElement
                                );
                                (e.currentTarget as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={1}
                            max={120}
                            step={1}
                            className={styles.inputField}
                            defaultValue={landCost.length ?? 1}
                            onBlur={(e) =>
                              commitTiming(
                                "landCosts",
                                key,
                                "length",
                                e.currentTarget
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitTiming(
                                  "landCosts",
                                  key,
                                  "length",
                                  e.currentTarget as HTMLInputElement
                                );
                                (e.currentTarget as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
                <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                  <div className={`${styles.sectionTotalCell}`}>
                    Land Costs Total
                  </div>
                  <div className={`${styles.sectionTotalCell}`}>
                    $
                    {Object.values(cashFlowState.landCosts)
                      .reduce((s, v) => s + v.amount, 0)
                      .toLocaleString()}
                  </div>
                  <div className={`${styles.sectionTotalCell}`}>-</div>
                  <div className={`${styles.sectionTotalCell}`}>-</div>
                </div>
              </>
            )}
            {/* Hard costs */}
            {Object.keys(cashFlowState.hardCosts).length > 0 && (
              <>
                <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                  <div className={`${styles.sectionHeader} ${styles.spanAll}`}>
                    Hard Costs
                  </div>
                </div>
                {Object.entries(cashFlowState.hardCosts).map(
                  ([key, hardCost]) => {
                    const index = key.startsWith("additional_")
                      ? parseInt(key.split("_")[1])
                      : undefined;
                    return (
                      <div
                        key={key}
                        className={`${styles.leftRow} ${styles.rowHeight}`}
                      >
                        <div className={styles.leftDataCell}>
                          {getHardCostDisplayName(key, index)}
                        </div>
                        <div className={styles.leftAmountCell}>
                          ${(hardCost.amount || 0).toLocaleString()}
                        </div>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={120}
                            step={1}
                            className={styles.inputField}
                            defaultValue={hardCost.start ?? 1}
                            onBlur={(e) =>
                              commitTiming(
                                "hardCosts",
                                key,
                                "start",
                                e.currentTarget
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitTiming(
                                  "hardCosts",
                                  key,
                                  "start",
                                  e.currentTarget as HTMLInputElement
                                );
                                (e.currentTarget as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={1}
                            max={120}
                            step={1}
                            className={styles.inputField}
                            defaultValue={hardCost.length ?? 1}
                            onBlur={(e) =>
                              commitTiming(
                                "hardCosts",
                                key,
                                "length",
                                e.currentTarget
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitTiming(
                                  "hardCosts",
                                  key,
                                  "length",
                                  e.currentTarget as HTMLInputElement
                                );
                                (e.currentTarget as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
                <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                  <div className={`${styles.sectionTotalCell}`}>
                    Hard Costs Total
                  </div>
                  <div className={`${styles.sectionTotalCell}`}>
                    $
                    {Object.values(cashFlowState.hardCosts)
                      .reduce((s, v) => s + v.amount, 0)
                      .toLocaleString()}
                  </div>
                  <div className={`${styles.sectionTotalCell}`}>-</div>
                  <div className={`${styles.sectionTotalCell}`}>-</div>
                </div>
              </>
            )}
            {/* Soft costs */}
            {Object.keys(cashFlowState.softCosts).length > 0 && (
              <>
                <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                  <div className={`${styles.sectionHeader} ${styles.spanAll}`}>
                    Soft Costs
                  </div>
                </div>
                {Object.entries(cashFlowState.softCosts).map(
                  ([key, softCost]) => {
                    const index = key.startsWith("additional_")
                      ? parseInt(key.split("_")[1])
                      : undefined;
                    return (
                      <div
                        key={key}
                        className={`${styles.leftRow} ${styles.rowHeight}`}
                      >
                        <div className={styles.leftDataCell}>
                          {getSoftCostDisplayName(key, index)}
                        </div>
                        <div className={styles.leftAmountCell}>
                          ${(softCost.amount || 0).toLocaleString()}
                        </div>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={0}
                            max={120}
                            step={1}
                            className={styles.inputField}
                            defaultValue={softCost.start ?? 2}
                            onBlur={(e) =>
                              commitTiming(
                                "softCosts",
                                key,
                                "start",
                                e.currentTarget
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitTiming(
                                  "softCosts",
                                  key,
                                  "start",
                                  e.currentTarget as HTMLInputElement
                                );
                                (e.currentTarget as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min={1}
                            max={120}
                            step={1}
                            className={styles.inputField}
                            defaultValue={softCost.length ?? 12}
                            onBlur={(e) =>
                              commitTiming(
                                "softCosts",
                                key,
                                "length",
                                e.currentTarget
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitTiming(
                                  "softCosts",
                                  key,
                                  "length",
                                  e.currentTarget as HTMLInputElement
                                );
                                (e.currentTarget as HTMLInputElement).blur();
                              }
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
                <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                  <div className={`${styles.sectionTotalCell}`}>
                    Soft Costs Total
                  </div>
                  <div className={`${styles.sectionTotalCell}`}>
                    $
                    {Object.values(cashFlowState.softCosts)
                      .reduce((s, v) => s + v.amount, 0)
                      .toLocaleString()}
                  </div>
                  <div className={`${styles.sectionTotalCell}`}>-</div>
                  <div className={`${styles.sectionTotalCell}`}>-</div>
                </div>
              </>
            )}

            {/* Interest row */}
            {loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0 && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.sectionTotalCell}`}>Interest</div>
                <div className={`${styles.sectionTotalCell}`}>
                  ${Math.round(sumInterestPayments).toLocaleString()}
                </div>
                <div className={`${styles.sectionTotalCell}`}>
                  {payoutType === "serviced"
                    ? loanStartMonth
                    : loanStartMonth + loanTerm - 1}
                </div>
                <div className={`${styles.sectionTotalCell}`}>
                  {payoutType === "serviced" ? loanTerm : 1}
                </div>
              </div>
            )}

            {/* Principal Repayment row */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.sectionTotalCell}`}>
                Principal Repayment
              </div>
              <div className={`${styles.sectionTotalCell}`}>
                ${Math.round(sumPrincipalRepayments).toLocaleString()}
              </div>
              <div className={`${styles.sectionTotalCell}`}>-</div>
              <div className={`${styles.sectionTotalCell}`}>-</div>
            </div>

            {/* Total expenses */}
            {(Object.keys(cashFlowState.landCosts).length > 0 ||
              Object.keys(cashFlowState.hardCosts).length > 0 ||
              Object.keys(cashFlowState.softCosts).length > 0 ||
              (loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0)) && (
              <div className={`${styles.leftRow} ${styles.rowHeight}`}>
                <div className={`${styles.totalCell} ${styles.expense}`}>
                  Total Expenses
                </div>
                <div className={`${styles.totalCell} ${styles.expense}`}>
                  $
                  {(
                    Object.values(cashFlowState.landCosts).reduce(
                      (s, v) => s + v.amount,
                      0
                    ) +
                    Object.values(cashFlowState.hardCosts).reduce(
                      (s, v) => s + v.amount,
                      0
                    ) +
                    Object.values(cashFlowState.softCosts).reduce(
                      (s, v) => s + v.amount,
                      0
                    ) +
                    Math.round(sumInterestPayments) +
                    Math.round(sumPrincipalRepayments)
                  ).toLocaleString()}
                </div>
                <div className={`${styles.totalCell} ${styles.expense}`}>-</div>
                <div className={`${styles.totalCell} ${styles.expense}`}>-</div>
              </div>
            )}

            {/* Summary header */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.leftHeaderCell} ${styles.spanAll}`}>
                Cash Flow Summary
              </div>
            </div>
            {/* Summary totals */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.totalCell} ${styles.revenue}`}>
                Total Revenue
              </div>
              <div className={`${styles.totalCell} ${styles.revenue}`}>
                $
                {(
                  Object.values(cashFlowState.units).reduce(
                    (s, v) => s + v.amount,
                    0
                  ) +
                  Object.values(cashFlowState.otherIncome).reduce(
                    (s, v) => s + v.amount,
                    0
                  )
                ).toLocaleString()}
              </div>
              <div className={`${styles.totalCell} ${styles.revenue}`}>-</div>
              <div className={`${styles.totalCell} ${styles.revenue}`}>-</div>
            </div>
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.totalCell} ${styles.expense}`}>
                Total Expenses
              </div>
              <div className={`${styles.totalCell} ${styles.expense}`}>
                $
                {(
                  Object.values(cashFlowState.landCosts).reduce(
                    (s, v) => s + v.amount,
                    0
                  ) +
                  Object.values(cashFlowState.hardCosts).reduce(
                    (s, v) => s + v.amount,
                    0
                  ) +
                  Object.values(cashFlowState.softCosts).reduce(
                    (s, v) => s + v.amount,
                    0
                  ) +
                  Math.round(sumInterestPayments) +
                  Math.round(sumPrincipalRepayments)
                ).toLocaleString()}
              </div>
              <div className={`${styles.totalCell} ${styles.expense}`}>-</div>
              <div className={`${styles.totalCell} ${styles.expense}`}>-</div>
            </div>
            {/* Removed Total Financing from summary */}
            <div className={`${styles.leftRow} ${styles.rowHeight}`}>
              <div className={`${styles.totalCell} ${styles.revenue}`}>
                Net Cash Flow
              </div>
              <div className={`${styles.totalCell} ${styles.revenue}`}>$0</div>
              <div className={`${styles.totalCell} ${styles.revenue}`}>-</div>
              <div className={`${styles.totalCell} ${styles.revenue}`}>-</div>
            </div>
          </div>

          {/* Right content, scrolls with container */}
          <div className={styles.rightColumn}>
            {/* Blank separator aligning with Revenue header row */}
            <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, idx) => (
                <div key={idx} className={styles.separatorCell}></div>
              ))}
            </div>

            {/* Month headers (aligns with left subheader) */}
            <div className={`${styles.rightRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, idx) => (
                <div key={idx} className={styles.monthHeaderCell}>
                  Month {idx + 1}
                </div>
              ))}
            </div>

            {/* Units section header spacing */}
            <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, idx) => (
                <div key={idx} className={styles.separatorCell}></div>
              ))}
            </div>
            {/* Dynamic Unit monthly rows */}
            {proforma.unitMix?.map((unitType) => (
              <div
                key={unitType.id}
                className={`${styles.rightRow} ${styles.rowHeight}`}
              >
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const item = cashFlowState.units[unitType.id];
                  const value = item ? getMonthlyValue(item, monthNumber) : 0;
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.monthCell} ${getRevenueClass(
                        value
                      )}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Units total row */}
            {proforma.unitMix && proforma.unitMix.length > 0 && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value = calculateUnitsTotal(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Spacer before Other Income list header */}
            <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, idx) => (
                <div key={idx} className={styles.separatorCell}></div>
              ))}
            </div>
            {/* Other Income monthly rows */}
            {proforma.otherIncome?.map((income) => (
              <div
                key={income.id}
                className={`${styles.rightRow} ${styles.rowHeight}`}
              >
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const item = cashFlowState.otherIncome[income.id];
                  const value = item ? getMonthlyValue(item, monthNumber) : 0;
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.monthCell} ${getRevenueClass(
                        value
                      )}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            ))}
            {/* Other Income total */}
            {proforma.otherIncome && proforma.otherIncome.length > 0 && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value = calculateOtherIncomeTotal(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Revenue total */}
            {((proforma.unitMix && proforma.unitMix.length > 0) ||
              (proforma.otherIncome && proforma.otherIncome.length > 0)) && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value = calculateRevenueTotal(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.totalCell} ${styles.revenue}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Financing spacer rows to align with left labels */}
            <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, idx) => (
                <div key={idx} className={styles.separatorCell}></div>
              ))}
            </div>
            {proforma.sources?.equityPct > 0 && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value = calculateEquityContribution(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            )}
            {loanTerm > 0 && debtPct > 0 && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value = calculateDebtDraw(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            )}
            {/* Removed Total Financing monthly series */}

            {/* Expenses spacers */}
            {(Object.keys(cashFlowState.landCosts).length > 0 ||
              Object.keys(cashFlowState.hardCosts).length > 0 ||
              Object.keys(cashFlowState.softCosts).length > 0) && (
              <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, idx) => (
                  <div key={idx} className={styles.separatorCell}></div>
                ))}
              </div>
            )}

            {/* Land costs monthly rows */}
            {Object.keys(cashFlowState.landCosts).length > 0 && (
              <>
                <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
                  {Array.from({ length: 120 }, (_, idx) => (
                    <div key={idx} className={styles.separatorCell}></div>
                  ))}
                </div>
                {Object.entries(cashFlowState.landCosts).map(
                  ([key, landCost]) => (
                    <div
                      key={key}
                      className={`${styles.rightRow} ${styles.rowHeight}`}
                    >
                      {Array.from({ length: 120 }, (_, m) => {
                        const monthNumber = m + 1;
                        const value = getMonthlyValue(landCost, monthNumber);
                        return (
                          <div
                            key={monthNumber}
                            className={`${styles.monthCell} ${getCashFlowClass(
                              -value
                            )}`}
                          >
                            {formatMonthlyCashFlow(value)}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
                <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                  {Array.from({ length: 120 }, (_, m) => {
                    const monthNumber = m + 1;
                    const value = calculateLandCostsTotal(monthNumber);
                    return (
                      <div
                        key={monthNumber}
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        {formatMonthlyCashFlow(value)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Hard costs monthly rows */}
            {Object.keys(cashFlowState.hardCosts).length > 0 && (
              <>
                <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
                  {Array.from({ length: 120 }, (_, idx) => (
                    <div key={idx} className={styles.separatorCell}></div>
                  ))}
                </div>
                {Object.entries(cashFlowState.hardCosts).map(
                  ([key, hardCost]) => (
                    <div
                      key={key}
                      className={`${styles.rightRow} ${styles.rowHeight}`}
                    >
                      {Array.from({ length: 120 }, (_, m) => {
                        const monthNumber = m + 1;
                        const value = getMonthlyValue(hardCost, monthNumber);
                        return (
                          <div
                            key={monthNumber}
                            className={`${styles.monthCell} ${getCashFlowClass(
                              -value
                            )}`}
                          >
                            {formatMonthlyCashFlow(value)}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
                <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                  {Array.from({ length: 120 }, (_, m) => {
                    const monthNumber = m + 1;
                    const value = calculateHardCostsTotal(monthNumber);
                    return (
                      <div
                        key={monthNumber}
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        {formatMonthlyCashFlow(value)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Soft costs monthly rows */}
            {Object.keys(cashFlowState.softCosts).length > 0 && (
              <>
                <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
                  {Array.from({ length: 120 }, (_, idx) => (
                    <div key={idx} className={styles.separatorCell}></div>
                  ))}
                </div>
                {Object.entries(cashFlowState.softCosts).map(
                  ([key, softCost]) => (
                    <div
                      key={key}
                      className={`${styles.rightRow} ${styles.rowHeight}`}
                    >
                      {Array.from({ length: 120 }, (_, m) => {
                        const monthNumber = m + 1;
                        const value = getMonthlyValue(softCost, monthNumber);
                        return (
                          <div
                            key={monthNumber}
                            className={`${styles.monthCell} ${getCashFlowClass(
                              -value
                            )}`}
                          >
                            {formatMonthlyCashFlow(value)}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
                <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                  {Array.from({ length: 120 }, (_, m) => {
                    const monthNumber = m + 1;
                    const value = calculateSoftCostsTotal(monthNumber);
                    return (
                      <div
                        key={monthNumber}
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        {formatMonthlyCashFlow(value)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Interest monthly */}
            {loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0 && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value = calculateInterestPayment(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.sectionTotalCell} ${styles.expense}`}
                    >
                      {value ? `$${Math.round(value).toLocaleString()}` : ""}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Principal Repayment monthly */}
            <div className={`${styles.rightRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, m) => {
                const monthNumber = m + 1;
                const value = calculatePrincipalRepayment(monthNumber);
                return (
                  <div
                    key={monthNumber}
                    className={`${styles.sectionTotalCell} ${styles.expense}`}
                  >
                    {value ? `$${Math.round(value).toLocaleString()}` : ""}
                  </div>
                );
              })}
            </div>

            {/* Total expenses monthly (including interest) */}
            {(Object.keys(cashFlowState.landCosts).length > 0 ||
              Object.keys(cashFlowState.hardCosts).length > 0 ||
              Object.keys(cashFlowState.softCosts).length > 0 ||
              (loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0)) && (
              <div className={`${styles.rightRow} ${styles.rowHeight}`}>
                {Array.from({ length: 120 }, (_, m) => {
                  const monthNumber = m + 1;
                  const value =
                    calculateTotalExpensesIncludingInterest(monthNumber);
                  return (
                    <div
                      key={monthNumber}
                      className={`${styles.totalCell} ${styles.expense}`}
                    >
                      {formatMonthlyCashFlow(value)}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Summary spacer */}
            <div className={`${styles.separatorRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, idx) => (
                <div key={idx} className={styles.separatorCell}></div>
              ))}
            </div>
            {/* Summary totals monthly */}
            <div className={`${styles.rightRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, m) => {
                const monthNumber = m + 1;
                const value = calculateRevenueTotal(monthNumber);
                return (
                  <div
                    key={monthNumber}
                    className={`${styles.totalCell} ${styles.revenue}`}
                  >
                    {formatMonthlyCashFlow(value)}
                  </div>
                );
              })}
            </div>
            <div className={`${styles.rightRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, m) => {
                const monthNumber = m + 1;
                const value =
                  calculateTotalExpensesIncludingInterest(monthNumber);
                return (
                  <div
                    key={monthNumber}
                    className={`${styles.totalCell} ${styles.expense}`}
                  >
                    {formatMonthlyCashFlow(value)}
                  </div>
                );
              })}
            </div>
            {/* Removed Total Financing from summary */}
            <div className={`${styles.rightRow} ${styles.rowHeight}`}>
              {Array.from({ length: 120 }, (_, m) => {
                const monthNumber = m + 1;
                const value = calculateCompleteNetCashFlow(monthNumber);
                return (
                  <div
                    key={monthNumber}
                    className={`${styles.totalCell} ${
                      value >= 0 ? styles.revenue : styles.expense
                    }`}
                  >
                    {formatMonthlyCashFlow(value)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
