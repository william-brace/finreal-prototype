"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Proforma } from "@/lib/session-storage";
import { useEffect, useRef, useState } from "react";
import { CashFlowInputRow } from "../CashFlowInputRow";
import styles from "./CashFlowTab.module.css";

// interface CashFlowData {
//   month: string;
//   landCost: number;
//   constructionCost: number;
//   softCosts: number;
//   totalCashOut: number;
//   revenue: number;
//   netCashFlow: number;
//   cumulativeCashFlow: number;
// }

interface CashFlowItemState {
  amount: number;
  start: number;
  length: number;
}

interface CashFlowState {
  units: Record<string, CashFlowItemState>;
  otherIncome: Record<string, CashFlowItemState>;
  landCosts: Record<string, CashFlowItemState>;
  hardCosts: Record<string, CashFlowItemState>;
  softCosts: Record<string, CashFlowItemState>;
}

interface CashFlowTabProps {
  proforma: Proforma;
}

export function CashFlowTab({ proforma }: CashFlowTabProps) {
  const fixedColumnRef = useRef<HTMLDivElement>(null);
  const scrollableColumnRef = useRef<HTMLDivElement>(null);

  // Initialize cash flow state based on proforma data
  const [cashFlowState, setCashFlowState] = useState<CashFlowState>(() => {
    const initialState: CashFlowState = {
      units: {},
      otherIncome: {},
      landCosts: {},
      hardCosts: {},
      softCosts: {},
    };

    // Initialize units from proforma
    if (proforma.unitMix) {
      proforma.unitMix.forEach((unitType) => {
        const totalValue = unitType.units.reduce(
          (sum, unit) => sum + unit.area * unit.value,
          0
        );
        initialState.units[unitType.id] = {
          amount: totalValue,
          start: 1,
          length: 1,
        };
      });
    }

    // Initialize other income from proforma
    if (proforma.otherIncome) {
      proforma.otherIncome.forEach((income) => {
        initialState.otherIncome[income.id] = {
          amount: income.numberOfUnits * income.valuePerUnit,
          start: 1,
          length: 1,
        };
      });
    }

    // Initialize land costs dynamically
    if (proforma.uses.landCosts.baseCost > 0) {
      initialState.landCosts["baseCost"] = {
        amount: proforma.uses.landCosts.baseCost,
        start: 1,
        length: 1,
      };
    }
    if (proforma.uses.landCosts.closingCost > 0) {
      initialState.landCosts["closingCost"] = {
        amount: proforma.uses.landCosts.closingCost,
        start: 1,
        length: 1,
      };
    }
    proforma.uses.landCosts.additionalCosts?.forEach((cost, index) => {
      if (cost.amount > 0) {
        initialState.landCosts[`additional_${index}`] = {
          amount: cost.amount,
          start: 1,
          length: 1,
        };
      }
    });

    // Initialize hard costs dynamically
    if (proforma.uses.hardCosts.baseCost > 0) {
      initialState.hardCosts["baseCost"] = {
        amount: proforma.uses.hardCosts.baseCost,
        start: 1,
        length: 1,
      };
    }
    proforma.uses.hardCosts.additionalCosts?.forEach((cost, index) => {
      if (cost.amount > 0) {
        initialState.hardCosts[`additional_${index}`] = {
          amount: cost.amount,
          start: 3,
          length: 18,
        };
      }
    });

    // Initialize soft costs dynamically
    if (proforma.uses.softCosts.development > 0) {
      initialState.softCosts["development"] = {
        amount: proforma.uses.softCosts.development,
        start: 2,
        length: 12,
      };
    }
    if (proforma.uses.softCosts.consultants > 0) {
      initialState.softCosts["consultants"] = {
        amount: proforma.uses.softCosts.consultants,
        start: 1,
        length: 6,
      };
    }
    if (proforma.uses.softCosts.adminMarketing > 0) {
      initialState.softCosts["adminMarketing"] = {
        amount: proforma.uses.softCosts.adminMarketing,
        start: 1,
        length: 24,
      };
    }
    proforma.uses.softCosts.additionalCosts?.forEach((cost, index) => {
      if (cost.amount > 0) {
        initialState.softCosts[`additional_${index}`] = {
          amount: cost.amount,
          start: 2,
          length: 12,
        };
      }
    });

    return initialState;
  });

  // Helper function to update cash flow item
  const updateCashFlowItem = (
    section: keyof CashFlowState,
    itemId: string,
    field: keyof CashFlowItemState,
    value: number
  ) => {
    setCashFlowState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [itemId]: {
          ...prev[section][itemId],
          [field]: value,
        },
      },
    }));
  };

  // Synchronize vertical scrolling between both columns
  useEffect(() => {
    const fixedColumn = fixedColumnRef.current;
    const scrollableColumn = scrollableColumnRef.current;

    if (!fixedColumn || !scrollableColumn) return;

    let isScrolling = false;

    const syncScrollFromFixed = () => {
      if (isScrolling) return;
      isScrolling = true;
      scrollableColumn.scrollTop = fixedColumn.scrollTop;
      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    const syncScrollFromScrollable = () => {
      if (isScrolling) return;
      isScrolling = true;
      fixedColumn.scrollTop = scrollableColumn.scrollTop;
      requestAnimationFrame(() => {
        isScrolling = false;
      });
    };

    fixedColumn.addEventListener("scroll", syncScrollFromFixed);
    scrollableColumn.addEventListener("scroll", syncScrollFromScrollable);

    return () => {
      fixedColumn.removeEventListener("scroll", syncScrollFromFixed);
      scrollableColumn.removeEventListener("scroll", syncScrollFromScrollable);
    };
  }, []);

  // // Generate cash flow data for 120 months based on current state
  // const cashFlowData = useMemo(() => {
  //   const months = 120;
  //   const projectLength = proforma.projectLength || 24;
  //   const data: CashFlowData[] = [];

  //   for (let month = 1; month <= months; month++) {
  //     let revenue = 0;
  //     let landCost = 0;
  //     let constructionCost = 0;
  //     let softCosts = 0;

  //     // Calculate revenue from units and other income based on state
  //     Object.values(cashFlowState.units).forEach((unitItem) => {
  //       if (
  //         month >= unitItem.start &&
  //         month < unitItem.start + unitItem.length
  //       ) {
  //         revenue += unitItem.amount / unitItem.length;
  //       }
  //     });

  //     Object.values(cashFlowState.otherIncome).forEach((incomeItem) => {
  //       if (
  //         month >= incomeItem.start &&
  //         month < incomeItem.start + incomeItem.length
  //       ) {
  //         revenue += incomeItem.amount / incomeItem.length;
  //       }
  //     });

  //     // Calculate costs based on state
  //     Object.values(cashFlowState.landCosts).forEach((landItem) => {
  //       if (
  //         month >= landItem.start &&
  //         month < landItem.start + landItem.length
  //       ) {
  //         landCost += landItem.amount / landItem.length;
  //       }
  //     });

  //     Object.values(cashFlowState.hardCosts).forEach((hardItem) => {
  //       if (
  //         month >= hardItem.start &&
  //         month < hardItem.start + hardItem.length
  //       ) {
  //         constructionCost += hardItem.amount / hardItem.length;
  //       }
  //     });

  //     Object.values(cashFlowState.softCosts).forEach((softItem) => {
  //       if (
  //         month >= softItem.start &&
  //         month < softItem.start + softItem.length
  //       ) {
  //         softCosts += softItem.amount / softItem.length;
  //       }
  //     });

  //     const totalCashOut = landCost + constructionCost + softCosts;
  //     const netCashFlow = revenue - totalCashOut;

  //     // Calculate cumulative cash flow
  //     const prevCumulative: number =
  //       data.length > 0 ? data[data.length - 1].cumulativeCashFlow : 0;
  //     const cumulativeCashFlow: number = prevCumulative + netCashFlow;

  //     data.push({
  //       month: `Month ${month}`,
  //       landCost: landCost,
  //       constructionCost: constructionCost,
  //       softCosts: softCosts,
  //       totalCashOut: totalCashOut,
  //       revenue: revenue,
  //       netCashFlow: netCashFlow,
  //       cumulativeCashFlow: cumulativeCashFlow,
  //     });
  //   }

  //   return data;
  // }, [proforma, cashFlowState]);

  // Helper functions to get display names for cost items
  const getLandCostDisplayName = (key: string, index?: number) => {
    switch (key) {
      case "baseCost":
        return "Land Purchase";
      case "closingCost":
        return "Closing Costs";
      default:
        if (key.startsWith("additional_") && index !== undefined) {
          return (
            proforma.uses.landCosts.additionalCosts?.[index]?.name ||
            `Additional Cost ${index + 1}`
          );
        }
        return key;
    }
  };

  const getHardCostDisplayName = (key: string, index?: number) => {
    switch (key) {
      case "baseCost":
        return "Construction";
      default:
        if (key.startsWith("additional_") && index !== undefined) {
          return (
            proforma.uses.hardCosts.additionalCosts?.[index]?.name ||
            `Additional Cost ${index + 1}`
          );
        }
        return key;
    }
  };

  const getSoftCostDisplayName = (key: string, index?: number) => {
    switch (key) {
      case "development":
        return "Development";
      case "consultants":
        return "Consultants";
      case "adminMarketing":
        return "Admin & Marketing";
      default:
        if (key.startsWith("additional_") && index !== undefined) {
          return (
            proforma.uses.softCosts.additionalCosts?.[index]?.name ||
            `Additional Cost ${index + 1}`
          );
        }
        return key;
    }
  };

  // const formatCurrency = (value: number) => {
  //   return value ? `$${value.toLocaleString()}` : "$0";
  // };

  // const formatNetCashFlow = (value: number) => {
  //   return `${value >= 0 ? "+" : ""}$${value.toLocaleString()}`;
  // };

  const getCashFlowClass = (value: number) => {
    return `${styles.cashFlowCell} ${
      value >= 0 ? styles.positive : styles.negative
    }`;
  };

  // const getCumulativeClass = (value: number) => {
  //   return `${styles.cumulativeCell} ${
  //     value >= 0 ? styles.positive : styles.negative
  //   }`;
  // };

  const getRevenueClass = (value: number) => {
    return `${styles.revenueCell} ${value > 0 ? styles.positive : ""}`;
  };

  // Helper function to calculate monthly value for a specific cash flow item
  const getMonthlyValue = (item: CashFlowItemState, month: number) => {
    if (month >= item.start && month < item.start + item.length) {
      return item.amount / item.length;
    }
    return 0;
  };

  // Helper function to format monthly cash flow values
  const formatMonthlyCashFlow = (value: number) => {
    if (value === 0) return "";
    return `$${Math.round(value).toLocaleString()}`;
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
                  </>
                )}
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
                  </>
                )}
              </tbody>
            </table>
          </div>
            
        </div>
      </CardContent>
    </Card>
  );
}
