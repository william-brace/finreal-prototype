"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Proforma } from "@/lib/session-storage";
import { CashFlowInputRow } from "../CashFlowInputRow";
import styles from "./CashFlowTab.module.css";
import { useCashFlowTab } from "@/hooks/useCashFlowTab";

interface CashFlowTabProps {
  proforma: Proforma;
}

export function CashFlowTab({ proforma }: CashFlowTabProps) {
  const {
    fixedColumnRef,
    scrollableColumnRef,
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
    calculateNetCashFlowIncludingInterest,
    loanStartMonth,
    calculateEquityContribution,
    calculateDebtDraw,
    calculateTotalFinancingInflows,
    calculateCompleteNetCashFlow,
  } = useCashFlowTab(proforma);

  const getCashFlowClass = (value: number) => {
    return `${styles.cashFlowCell} ${
      value >= 0 ? styles.positive : styles.negative
    }`;
  };

  const getRevenueClass = (value: number) => {
    return `${styles.revenueCell} ${value > 0 ? styles.positive : ""}`;
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
        <div className={styles.container}>
          {/* Fixed left column */}
          <div ref={fixedColumnRef} className={styles.fixedColumn}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.headerCell} colSpan={4}>
                    Revenue
                  </th>
                </tr>
                <tr>
                  <th className={styles.headerCell}>Item</th>
                  <th className={styles.headerCell}>Amount</th>
                  <th className={styles.headerCell}>Start</th>
                  <th className={styles.headerCell}>Length</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.dataCell} colSpan={4}>
                    Units
                  </td>
                </tr>
                {/* Dynamic Unit Rows */}
                {proforma.unitMix?.map((unitType) => (
                  <CashFlowInputRow
                    key={unitType.id}
                    label={unitType.name}
                    amount={cashFlowState.units[unitType.id]?.amount || 0}
                    start={cashFlowState.units[unitType.id]?.start || 1}
                    length={cashFlowState.units[unitType.id]?.length || 1}
                    disabled={true}
                    onStartChange={(value) =>
                      updateCashFlowItem("units", unitType.id, "start", value)
                    }
                    onLengthChange={(value) =>
                      updateCashFlowItem("units", unitType.id, "length", value)
                    }
                  />
                ))}

                {/* Units Total Row */}
                {proforma.unitMix && proforma.unitMix.length > 0 && (
                  <tr>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      Units Total
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      $
                      {Object.values(cashFlowState.units)
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toLocaleString()}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      -
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      -
                    </td>
                  </tr>
                )}

                {/* Other Income Section Header */}
                <tr>
                  <td className={styles.dataCell} colSpan={4}>
                    Other Income
                  </td>
                </tr>

                {/* Dynamic Other Income Rows */}
                {proforma.otherIncome?.map((income) => (
                  <CashFlowInputRow
                    key={income.id}
                    label={income.name}
                    amount={cashFlowState.otherIncome[income.id]?.amount || 0}
                    start={cashFlowState.otherIncome[income.id]?.start || 1}
                    length={cashFlowState.otherIncome[income.id]?.length || 1}
                    disabled={true}
                    onStartChange={(value) =>
                      updateCashFlowItem(
                        "otherIncome",
                        income.id,
                        "start",
                        value
                      )
                    }
                    onLengthChange={(value) =>
                      updateCashFlowItem(
                        "otherIncome",
                        income.id,
                        "length",
                        value
                      )
                    }
                  />
                ))}

                {/* Other Income Total Row */}
                {proforma.otherIncome && proforma.otherIncome.length > 0 && (
                  <tr>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      Other Income Total
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      $
                      {Object.values(cashFlowState.otherIncome)
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toLocaleString()}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      -
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      -
                    </td>
                  </tr>
                )}

                {/* Revenue Total Row */}
                {((proforma.unitMix && proforma.unitMix.length > 0) ||
                  (proforma.otherIncome &&
                    proforma.otherIncome.length > 0)) && (
                  <tr>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      Total Revenue
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      $
                      {(
                        Object.values(cashFlowState.units).reduce(
                          (sum, item) => sum + item.amount,
                          0
                        ) +
                        Object.values(cashFlowState.otherIncome).reduce(
                          (sum, item) => sum + item.amount,
                          0
                        )
                      ).toLocaleString()}
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      -
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      -
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Financing Header */}
              <thead>
                <tr>
                  <th className={styles.headerCell} colSpan={4}>
                    Financing
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Equity Contribution Row */}
                {proforma.sources?.equityPct > 0 && (
                  <tr>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      Equity Contribution
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      $
                      {Array.from({ length: 120 }, (_, month) =>
                        calculateEquityContribution(month + 1)
                      )
                        .reduce((sum, val) => sum + val, 0)
                        .toLocaleString()}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      -
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      -
                    </td>
                  </tr>
                )}

                {/* Debt Draw Row */}
                {loanTerm > 0 && debtPct > 0 && (
                  <tr>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      Debt Draw
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      $
                      {Array.from({ length: 120 }, (_, month) =>
                        calculateDebtDraw(month + 1)
                      )
                        .reduce((sum, val) => sum + val, 0)
                        .toLocaleString()}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      {loanStartMonth}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.revenue}`}
                    >
                      {loanTerm}
                    </td>
                  </tr>
                )}

                {/* Total Financing Row */}
                {(proforma.sources?.equityPct > 0 ||
                  (loanTerm > 0 && debtPct > 0)) && (
                  <tr>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      Total Financing
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      $
                      {Array.from({ length: 120 }, (_, month) =>
                        calculateTotalFinancingInflows(month + 1)
                      )
                        .reduce((sum, val) => sum + val, 0)
                        .toLocaleString()}
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      -
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      -
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Expenses Header */}
              <thead>
                <tr>
                  <th className={styles.headerCell} colSpan={4}>
                    Expenses
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cashFlowState.landCosts).length > 0 && (
                  <>
                    {/* Land Costs Section Header */}
                    <tr>
                      <td className={styles.dataCell} colSpan={4}>
                        Land Costs
                      </td>
                    </tr>

                    {/* Dynamic Land Cost Rows */}
                    {Object.entries(cashFlowState.landCosts).map(
                      ([key, landCost]) => {
                        const index = key.startsWith("additional_")
                          ? parseInt(key.split("_")[1])
                          : undefined;
                        return (
                          <CashFlowInputRow
                            key={key}
                            label={getLandCostDisplayName(key, index)}
                            amount={landCost.amount || 0}
                            start={landCost.start || 1}
                            length={landCost.length || 1}
                            disabled={true}
                            onStartChange={(value) =>
                              updateCashFlowItem(
                                "landCosts",
                                key,
                                "start",
                                value
                              )
                            }
                            onLengthChange={(value) =>
                              updateCashFlowItem(
                                "landCosts",
                                key,
                                "length",
                                value
                              )
                            }
                          />
                        );
                      }
                    )}

                    {/* Land Costs Total Row */}
                    <tr>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        Land Costs Total
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        $
                        {Object.values(cashFlowState.landCosts)
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString()}
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        -
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        -
                      </td>
                    </tr>
                  </>
                )}

                {Object.keys(cashFlowState.hardCosts).length > 0 && (
                  <>
                    {/* Hard Costs Section Header */}
                    <tr>
                      <td className={styles.dataCell} colSpan={4}>
                        Hard Costs
                      </td>
                    </tr>

                    {/* Dynamic Hard Cost Rows */}
                    {Object.entries(cashFlowState.hardCosts).map(
                      ([key, hardCost]) => {
                        const index = key.startsWith("additional_")
                          ? parseInt(key.split("_")[1])
                          : undefined;
                        return (
                          <CashFlowInputRow
                            key={key}
                            label={getHardCostDisplayName(key, index)}
                            amount={hardCost.amount || 0}
                            start={hardCost.start || 1}
                            length={hardCost.length || 1}
                            disabled={true}
                            onStartChange={(value) =>
                              updateCashFlowItem(
                                "hardCosts",
                                key,
                                "start",
                                value
                              )
                            }
                            onLengthChange={(value) =>
                              updateCashFlowItem(
                                "hardCosts",
                                key,
                                "length",
                                value
                              )
                            }
                          />
                        );
                      }
                    )}

                    {/* Hard Costs Total Row */}
                    <tr>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        Hard Costs Total
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        $
                        {Object.values(cashFlowState.hardCosts)
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString()}
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        -
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        -
                      </td>
                    </tr>
                  </>
                )}

                {Object.keys(cashFlowState.softCosts).length > 0 && (
                  <>
                    {/* Soft Costs Section Header */}
                    <tr>
                      <td className={styles.dataCell} colSpan={4}>
                        Soft Costs
                      </td>
                    </tr>

                    {/* Dynamic Soft Cost Rows */}
                    {Object.entries(cashFlowState.softCosts).map(
                      ([key, softCost]) => {
                        const index = key.startsWith("additional_")
                          ? parseInt(key.split("_")[1])
                          : undefined;
                        return (
                          <CashFlowInputRow
                            key={key}
                            label={getSoftCostDisplayName(key, index)}
                            amount={softCost.amount || 0}
                            start={softCost.start || 2}
                            length={softCost.length || 12}
                            disabled={true}
                            onStartChange={(value) =>
                              updateCashFlowItem(
                                "softCosts",
                                key,
                                "start",
                                value
                              )
                            }
                            onLengthChange={(value) =>
                              updateCashFlowItem(
                                "softCosts",
                                key,
                                "length",
                                value
                              )
                            }
                          />
                        );
                      }
                    )}

                    {/* Soft Costs Total Row */}
                    <tr>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        Soft Costs Total
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        $
                        {Object.values(cashFlowState.softCosts)
                          .reduce((sum, item) => sum + item.amount, 0)
                          .toLocaleString()}
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        -
                      </td>
                      <td
                        className={`${styles.sectionTotalCell} ${styles.expense}`}
                      >
                        -
                      </td>
                    </tr>
                  </>
                )}

                {/* Interest (Financing) Row in Fixed Column */}
                {loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0 && (
                  <tr>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.expense}`}
                    >
                      Interest
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.expense}`}
                    >
                      ${Math.round(sumInterestPayments).toLocaleString()}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.expense}`}
                    >
                      {payoutType === "serviced"
                        ? loanStartMonth
                        : loanStartMonth + loanTerm - 1}
                    </td>
                    <td
                      className={`${styles.sectionTotalCell} ${styles.expense}`}
                    >
                      {payoutType === "serviced" ? loanTerm : 1}
                    </td>
                  </tr>
                )}

                {/* Total Expenses Row (including Interest) */}
                {(Object.keys(cashFlowState.landCosts).length > 0 ||
                  Object.keys(cashFlowState.hardCosts).length > 0 ||
                  Object.keys(cashFlowState.softCosts).length > 0 ||
                  (loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0)) && (
                  <tr>
                    <td className={`${styles.totalCell} ${styles.expense}`}>
                      Total Expenses
                    </td>
                    <td className={`${styles.totalCell} ${styles.expense}`}>
                      $
                      {(
                        Object.values(cashFlowState.landCosts).reduce(
                          (sum, item) => sum + item.amount,
                          0
                        ) +
                        Object.values(cashFlowState.hardCosts).reduce(
                          (sum, item) => sum + item.amount,
                          0
                        ) +
                        Object.values(cashFlowState.softCosts).reduce(
                          (sum, item) => sum + item.amount,
                          0
                        ) +
                        Math.round(sumInterestPayments)
                      ).toLocaleString()}
                    </td>
                    <td className={`${styles.totalCell} ${styles.expense}`}>
                      -
                    </td>
                    <td className={`${styles.totalCell} ${styles.expense}`}>
                      -
                    </td>
                  </tr>
                )}
              </tbody>

              {/* Cash Flow Summary Header */}
              <thead>
                <tr>
                  <th className={styles.headerCell} colSpan={4}>
                    Cash Flow Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Summary Total Revenue Row */}
                <tr>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>
                    Total Revenue
                  </td>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>
                    $
                    {(
                      Object.values(cashFlowState.units).reduce(
                        (sum, item) => sum + item.amount,
                        0
                      ) +
                      Object.values(cashFlowState.otherIncome).reduce(
                        (sum, item) => sum + item.amount,
                        0
                      )
                    ).toLocaleString()}
                  </td>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>-</td>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>-</td>
                </tr>

                {/* Summary Total Expenses Row (including Interest) */}
                <tr>
                  <td className={`${styles.totalCell} ${styles.expense}`}>
                    Total Expenses
                  </td>
                  <td className={`${styles.totalCell} ${styles.expense}`}>
                    $
                    {(
                      Object.values(cashFlowState.landCosts).reduce(
                        (sum, item) => sum + item.amount,
                        0
                      ) +
                      Object.values(cashFlowState.hardCosts).reduce(
                        (sum, item) => sum + item.amount,
                        0
                      ) +
                      Object.values(cashFlowState.softCosts).reduce(
                        (sum, item) => sum + item.amount,
                        0
                      ) +
                      Math.round(sumInterestPayments)
                    ).toLocaleString()}
                  </td>
                  <td className={`${styles.totalCell} ${styles.expense}`}>-</td>
                  <td className={`${styles.totalCell} ${styles.expense}`}>-</td>
                </tr>

                {/* Total Financing Row */}
                {(proforma.sources?.equityPct > 0 ||
                  (loanTerm > 0 && debtPct > 0)) && (
                  <tr>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      Total Financing
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      $
                      {Array.from({ length: 120 }, (_, month) =>
                        calculateTotalFinancingInflows(month + 1)
                      )
                        .reduce((sum, val) => sum + val, 0)
                        .toLocaleString()}
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      -
                    </td>
                    <td className={`${styles.totalCell} ${styles.revenue}`}>
                      -
                    </td>
                  </tr>
                )}

                {/* Net Cash Flow Row (Revenue + Financing - Expenses) */}
                <tr>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>
                    Net Cash Flow
                  </td>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>
                    $0
                  </td>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>-</td>
                  <td className={`${styles.totalCell} ${styles.revenue}`}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Scrollable right columns */}
          <div ref={scrollableColumnRef} className={styles.scrollableColumn}>
            <table className={styles.scrollableTable}>
              <thead>
                <tr>
                  {/* Generate Month headers for 120 months */}
                  {Array.from({ length: 120 }, (_, index) => (
                    <th
                      key={index + 1}
                      className={`${styles.headerCell} ${styles.headerCellWide}`}
                    >
                      Month {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Revenue Section Header */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => (
                    <td key={month + 1} className={styles.monthCell}></td>
                  ))}
                </tr>
                {/* Units Section Header */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => (
                    <td key={month + 1} className={styles.monthCell}></td>
                  ))}
                </tr>
                {/* Dynamic Unit Rows - Monthly Values */}
                {proforma.unitMix?.map((unitType) => (
                  <tr key={unitType.id}>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const item = cashFlowState.units[unitType.id];
                      const value = item
                        ? getMonthlyValue(item, monthNumber)
                        : 0;
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.monthCell} ${getRevenueClass(
                            value
                          )}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Units Total Row - Monthly Values */}
                {proforma.unitMix && proforma.unitMix.length > 0 && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateUnitsTotal(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.sectionTotalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}
                {/* Other Income Section Header */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => (
                    <td key={month + 1} className={styles.monthCell}></td>
                  ))}
                </tr>
                {/* Dynamic Other Income Rows - Monthly Values */}
                {proforma.otherIncome?.map((income) => (
                  <tr key={income.id}>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const item = cashFlowState.otherIncome[income.id];
                      const value = item
                        ? getMonthlyValue(item, monthNumber)
                        : 0;
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.monthCell} ${getRevenueClass(
                            value
                          )}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Other Income Total Row - Monthly Values */}
                {proforma.otherIncome && proforma.otherIncome.length > 0 && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateOtherIncomeTotal(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.sectionTotalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Revenue Total Row - Monthly Values */}
                {((proforma.unitMix && proforma.unitMix.length > 0) ||
                  (proforma.otherIncome &&
                    proforma.otherIncome.length > 0)) && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateRevenueTotal(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.totalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Financing Section Header */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => (
                    <td key={month + 1} className={styles.monthCell}></td>
                  ))}
                </tr>

                {/* Equity Contribution Monthly Row */}
                {proforma.sources?.equityPct > 0 && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateEquityContribution(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.sectionTotalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Debt Draw Monthly Row */}
                {loanTerm > 0 && debtPct > 0 && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateDebtDraw(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.sectionTotalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Total Financing Monthly Row */}
                {(proforma.sources?.equityPct > 0 ||
                  (loanTerm > 0 && debtPct > 0)) && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateTotalFinancingInflows(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.totalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Expenses Section - only show if there are any costs */}
                {(Object.keys(cashFlowState.landCosts).length > 0 ||
                  Object.keys(cashFlowState.hardCosts).length > 0 ||
                  Object.keys(cashFlowState.softCosts).length > 0) && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => (
                      <td key={month + 1} className={styles.monthCell}></td>
                    ))}
                  </tr>
                )}
                {/* Land Costs Section */}
                {Object.keys(cashFlowState.landCosts).length > 0 && (
                  <>
                    {/* Land Costs Section Header */}
                    <tr>
                      {Array.from({ length: 120 }, (_, month) => (
                        <td key={month + 1} className={styles.monthCell}></td>
                      ))}
                    </tr>

                    {/* Dynamic Land Cost Rows - Monthly Values */}
                    {Object.entries(cashFlowState.landCosts).map(
                      ([key, landCost]) => (
                        <tr key={key}>
                          {Array.from({ length: 120 }, (_, month) => {
                            const monthNumber = month + 1;
                            const value = getMonthlyValue(
                              landCost,
                              monthNumber
                            );
                            return (
                              <td
                                key={monthNumber}
                                className={`${
                                  styles.monthCell
                                } ${getCashFlowClass(-value)}`}
                              >
                                {formatMonthlyCashFlow(value)}
                              </td>
                            );
                          })}
                        </tr>
                      )
                    )}

                    {/* Land Costs Total Row - Monthly Values */}
                    <tr>
                      {Array.from({ length: 120 }, (_, month) => {
                        const monthNumber = month + 1;
                        const value = calculateLandCostsTotal(monthNumber);
                        return (
                          <td
                            key={monthNumber}
                            className={`${styles.sectionTotalCell} ${styles.expense}`}
                          >
                            {formatMonthlyCashFlow(value)}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}
                {/* Hard Costs Section */}
                {Object.keys(cashFlowState.hardCosts).length > 0 && (
                  <>
                    {/* Hard Costs Section Header */}
                    <tr>
                      {Array.from({ length: 120 }, (_, month) => (
                        <td key={month + 1} className={styles.monthCell}></td>
                      ))}
                    </tr>

                    {/* Dynamic Hard Cost Rows - Monthly Values */}
                    {Object.entries(cashFlowState.hardCosts).map(
                      ([key, hardCost]) => (
                        <tr key={key}>
                          {Array.from({ length: 120 }, (_, month) => {
                            const monthNumber = month + 1;
                            const value = getMonthlyValue(
                              hardCost,
                              monthNumber
                            );
                            return (
                              <td
                                key={monthNumber}
                                className={`${
                                  styles.monthCell
                                } ${getCashFlowClass(-value)}`}
                              >
                                {formatMonthlyCashFlow(value)}
                              </td>
                            );
                          })}
                        </tr>
                      )
                    )}

                    {/* Hard Costs Total Row - Monthly Values */}
                    <tr>
                      {Array.from({ length: 120 }, (_, month) => {
                        const monthNumber = month + 1;
                        const value = calculateHardCostsTotal(monthNumber);
                        return (
                          <td
                            key={monthNumber}
                            className={`${styles.sectionTotalCell} ${styles.expense}`}
                          >
                            {formatMonthlyCashFlow(value)}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}
                {/* Soft Costs Section */}
                {Object.keys(cashFlowState.softCosts).length > 0 && (
                  <>
                    {/* Soft Costs Section Header */}
                    <tr>
                      {Array.from({ length: 120 }, (_, month) => (
                        <td key={month + 1} className={styles.monthCell}></td>
                      ))}
                    </tr>

                    {/* Dynamic Soft Cost Rows - Monthly Values */}
                    {Object.entries(cashFlowState.softCosts).map(
                      ([key, softCost]) => (
                        <tr key={key}>
                          {Array.from({ length: 120 }, (_, month) => {
                            const monthNumber = month + 1;
                            const value = getMonthlyValue(
                              softCost,
                              monthNumber
                            );
                            return (
                              <td
                                key={monthNumber}
                                className={`${
                                  styles.monthCell
                                } ${getCashFlowClass(-value)}`}
                              >
                                {formatMonthlyCashFlow(value)}
                              </td>
                            );
                          })}
                        </tr>
                      )
                    )}

                    {/* Soft Costs Total Row - Monthly Values */}
                    <tr>
                      {Array.from({ length: 120 }, (_, month) => {
                        const monthNumber = month + 1;
                        const value = calculateSoftCostsTotal(monthNumber);
                        return (
                          <td
                            key={monthNumber}
                            className={`${styles.sectionTotalCell} ${styles.expense}`}
                          >
                            {formatMonthlyCashFlow(value)}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}

                {/* Interest (Financing) Monthly Row */}
                {loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0 && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateInterestPayment(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.sectionTotalCell} ${styles.expense}`}
                        >
                          {value
                            ? `$${Math.round(value).toLocaleString()}`
                            : ""}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Total Expenses Row - Monthly Values (including Interest) */}
                {(Object.keys(cashFlowState.landCosts).length > 0 ||
                  Object.keys(cashFlowState.hardCosts).length > 0 ||
                  Object.keys(cashFlowState.softCosts).length > 0 ||
                  (loanTerm > 0 && monthlyInterestRate > 0 && debtPct > 0)) && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value =
                        calculateTotalExpensesIncludingInterest(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.totalCell} ${styles.expense}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Cash Flow Summary Section Header */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => (
                    <td key={month + 1} className={styles.monthCell}></td>
                  ))}
                </tr>

                {/* Summary Total Revenue Row - Monthly Values */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => {
                    const monthNumber = month + 1;
                    const value = calculateRevenueTotal(monthNumber);
                    return (
                      <td
                        key={monthNumber}
                        className={`${styles.totalCell} ${styles.revenue}`}
                      >
                        {formatMonthlyCashFlow(value)}
                      </td>
                    );
                  })}
                </tr>

                {/* Summary Total Expenses Row - Monthly Values (including Interest) */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => {
                    const monthNumber = month + 1;
                    const value =
                      calculateTotalExpensesIncludingInterest(monthNumber);
                    return (
                      <td
                        key={monthNumber}
                        className={`${styles.totalCell} ${styles.expense}`}
                      >
                        {formatMonthlyCashFlow(value)}
                      </td>
                    );
                  })}
                </tr>

                {/* Total Financing Monthly Row */}
                {(proforma.sources?.equityPct > 0 ||
                  (loanTerm > 0 && debtPct > 0)) && (
                  <tr>
                    {Array.from({ length: 120 }, (_, month) => {
                      const monthNumber = month + 1;
                      const value = calculateTotalFinancingInflows(monthNumber);
                      return (
                        <td
                          key={monthNumber}
                          className={`${styles.totalCell} ${styles.revenue}`}
                        >
                          {formatMonthlyCashFlow(value)}
                        </td>
                      );
                    })}
                  </tr>
                )}

                {/* Net Cash Flow Row - Monthly Values (Revenue + Financing - Expenses) */}
                <tr>
                  {Array.from({ length: 120 }, (_, month) => {
                    const monthNumber = month + 1;
                    const value = calculateCompleteNetCashFlow(monthNumber);
                    return (
                      <td
                        key={monthNumber}
                        className={`${styles.totalCell} ${
                          value >= 0 ? styles.revenue : styles.expense
                        }`}
                      >
                        {formatMonthlyCashFlow(value)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          {"\u00A0"}
        </div>
      </CardContent>
    </Card>
  );
}
