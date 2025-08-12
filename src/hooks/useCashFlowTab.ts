"use client";

import { getProforma, Proforma, saveProforma } from "@/lib/session-storage";
import { useMemo, useState } from "react";

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

export function useCashFlowTab(proforma: Proforma) {
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
        const timing = proforma.cashFlowSchedule?.units?.[unitType.id];
        initialState.units[unitType.id] = {
          amount: totalValue,
          start: timing?.start ?? 1,
          length: timing?.length ?? 1,
        };
      });
    }

    // Initialize other income from proforma
    if (proforma.otherIncome) {
      proforma.otherIncome.forEach((income) => {
        const timing = proforma.cashFlowSchedule?.otherIncome?.[income.id];
        initialState.otherIncome[income.id] = {
          amount: income.numberOfUnits * income.valuePerUnit,
          start: timing?.start ?? 1,
          length: timing?.length ?? 1,
        };
      });
    }

    // Initialize land costs dynamically
    if (proforma.uses.landCosts.baseCost > 0) {
      const timing = proforma.cashFlowSchedule?.landCosts?.["baseCost"];
      initialState.landCosts["baseCost"] = {
        amount: proforma.uses.landCosts.baseCost,
        start: timing?.start ?? 1,
        length: timing?.length ?? 1,
      };
    }
    if (proforma.uses.landCosts.closingCost > 0) {
      const timing = proforma.cashFlowSchedule?.landCosts?.["closingCost"];
      initialState.landCosts["closingCost"] = {
        amount: proforma.uses.landCosts.closingCost,
        start: timing?.start ?? 1,
        length: timing?.length ?? 1,
      };
    }
    proforma.uses.landCosts.additionalCosts?.forEach((cost, index) => {
      if (cost.amount > 0) {
        const key = `additional_${index}`;
        const timing = proforma.cashFlowSchedule?.landCosts?.[key];
        initialState.landCosts[key] = {
          amount: cost.amount,
          start: timing?.start ?? 1,
          length: timing?.length ?? 1,
        };
      }
    });

    // Initialize hard costs dynamically
    if (proforma.uses.hardCosts.baseCost > 0) {
      const timing = proforma.cashFlowSchedule?.hardCosts?.["baseCost"];
      initialState.hardCosts["baseCost"] = {
        amount: proforma.uses.hardCosts.baseCost,
        start: timing?.start ?? 3,
        length: timing?.length ?? 18,
      };
    }
    proforma.uses.hardCosts.additionalCosts?.forEach((cost, index) => {
      if (cost.amount > 0) {
        const key = `additional_${index}`;
        const timing = proforma.cashFlowSchedule?.hardCosts?.[key];
        initialState.hardCosts[key] = {
          amount: cost.amount,
          start: timing?.start ?? 3,
          length: timing?.length ?? 18,
        };
      }
    });

    // Initialize soft costs dynamically
    if (proforma.uses.softCosts.development > 0) {
      const timing = proforma.cashFlowSchedule?.softCosts?.["development"];
      initialState.softCosts["development"] = {
        amount: proforma.uses.softCosts.development,
        start: timing?.start ?? 2,
        length: timing?.length ?? 12,
      };
    }
    if (proforma.uses.softCosts.consultants > 0) {
      const timing = proforma.cashFlowSchedule?.softCosts?.["consultants"];
      initialState.softCosts["consultants"] = {
        amount: proforma.uses.softCosts.consultants,
        start: timing?.start ?? 1,
        length: timing?.length ?? 6,
      };
    }
    if (proforma.uses.softCosts.adminMarketing > 0) {
      const timing = proforma.cashFlowSchedule?.softCosts?.["adminMarketing"];
      initialState.softCosts["adminMarketing"] = {
        amount: proforma.uses.softCosts.adminMarketing,
        start: timing?.start ?? 1,
        length: timing?.length ?? 24,
      };
    }
    proforma.uses.softCosts.additionalCosts?.forEach((cost, index) => {
      if (cost.amount > 0) {
        const key = `additional_${index}`;
        const timing = proforma.cashFlowSchedule?.softCosts?.[key];
        initialState.softCosts[key] = {
          amount: cost.amount,
          start: timing?.start ?? 2,
          length: timing?.length ?? 12,
        };
      }
    });

    return initialState;
  });

  // Helper to build a persistable schedule from current state
  const buildScheduleFromState = (state: CashFlowState) => {
    const pickTiming = (obj: Record<string, CashFlowItemState>) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [
          k,
          { start: v.start, length: v.length },
        ])
      );
    return {
      units: pickTiming(state.units),
      otherIncome: pickTiming(state.otherIncome),
      landCosts: pickTiming(state.landCosts),
      hardCosts: pickTiming(state.hardCosts),
      softCosts: pickTiming(state.softCosts),
    } as Proforma["cashFlowSchedule"];
  };

  // Helper function to update cash flow item and persist timing
  const updateCashFlowItem = (
    section: keyof CashFlowState,
    itemId: string,
    field: keyof CashFlowItemState,
    value: number
  ) => {
    setCashFlowState((prev) => {
      const next: CashFlowState = {
        ...prev,
        [section]: {
          ...prev[section],
          [itemId]: {
            ...prev[section][itemId],
            [field]: value,
          },
        },
      };

      // Persist timing to session storage via proforma
      const nextSchedule = buildScheduleFromState(next);
      const latest = getProforma(proforma.projectId, proforma.id) || proforma;
      saveProforma(proforma.projectId, {
        ...latest,
        cashFlowSchedule: nextSchedule,
      });

      return next;
    });
  };
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
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Helper functions to calculate totals for each month
  const calculateUnitsTotal = (month: number) => {
    let total = 0;
    Object.values(cashFlowState.units).forEach((item) => {
      total += getMonthlyValue(item, month);
    });
    return total;
  };

  const calculateOtherIncomeTotal = (month: number) => {
    let total = 0;
    Object.values(cashFlowState.otherIncome).forEach((item) => {
      total += getMonthlyValue(item, month);
    });
    return total;
  };

  const calculateLandCostsTotal = (month: number) => {
    let total = 0;
    Object.values(cashFlowState.landCosts).forEach((item) => {
      total += getMonthlyValue(item, month);
    });
    return total;
  };

  const calculateHardCostsTotal = (month: number) => {
    let total = 0;
    Object.values(cashFlowState.hardCosts).forEach((item) => {
      total += getMonthlyValue(item, month);
    });
    return total;
  };

  const calculateSoftCostsTotal = (month: number) => {
    let total = 0;
    Object.values(cashFlowState.softCosts).forEach((item) => {
      total += getMonthlyValue(item, month);
    });
    return total;
  };

  const calculateRevenueTotal = (month: number) => {
    return calculateUnitsTotal(month) + calculateOtherIncomeTotal(month);
  };

  const calculateExpensesTotal = (month: number) => {
    return (
      calculateLandCostsTotal(month) +
      calculateHardCostsTotal(month) +
      calculateSoftCostsTotal(month)
    );
  };

  // Interest calculation helpers
  const monthlyInterestRate =
    (proforma.sources?.financingCosts?.interestPct || 0) / 100 / 12;
  const debtPct = proforma.sources?.debtPct || 0;
  const equityPct = proforma.sources?.equityPct || 0;
  const payoutType = proforma.sources?.payoutType || "rolledUp";
  const loanTerm = proforma.sources?.loanTerms || proforma.projectLength || 0;
  const debtAmountRaw = Math.round(
    (debtPct / 100) * (proforma.totalExpenses || 0)
  );
  const availableEquity = Math.round(
    (equityPct / 100) * (proforma.totalExpenses || 0)
  );

  // Financing simulation: dynamic principal repayment and interest accrual
  const financingSim = useMemo(() => {
    const months = 120;
    const equityByMonth: number[] = new Array(months).fill(0);
    const debtDrawByMonth: number[] = new Array(months).fill(0);
    const interestPaymentByMonth: number[] = new Array(months).fill(0);
    const principalRepaymentByMonth: number[] = new Array(months).fill(0);
    const outstandingByMonth: number[] = new Array(months).fill(0);

    let outstandingPrincipal = 0;
    let equityRemaining = Math.max(0, availableEquity);
    let accruedInterestOutstanding = 0; // for rolled-up interest

    for (let idx = 0; idx < months; idx++) {
      const monthNum = idx + 1;
      const revenue = calculateRevenueTotal(monthNum);
      const expensesExInterest = calculateExpensesTotal(monthNum);

      // 1) Use operating inflow to repay principal first
      const principalRepay = Math.min(revenue, outstandingPrincipal);
      principalRepaymentByMonth[idx] = principalRepay;
      outstandingPrincipal -= principalRepay;
      let operatingCashRemaining = revenue - principalRepay;

      // 2) Fund expenses (exclude interest here)
      const equityForExpenses = Math.min(expensesExInterest, equityRemaining);
      equityByMonth[idx] += equityForExpenses;
      equityRemaining -= equityForExpenses;
      const expensesLeft = expensesExInterest - equityForExpenses;

      const debtDrawForExpenses = Math.max(0, expensesLeft);
      debtDrawByMonth[idx] += debtDrawForExpenses;

      // 3) Accrue interest based on outstanding principal and half-month on new draws
      // Force basis to outstanding principal regardless of interestOnBasis preference
      const baseForInterest = outstandingPrincipal + 0.5 * debtDrawForExpenses;
      const interestAccrual =
        monthlyInterestRate > 0 ? baseForInterest * monthlyInterestRate : 0;

      if (payoutType === "serviced") {
        // Pay interest this month with priority: operating cash -> equity -> debt
        let remainingInterest = interestAccrual;

        // a) Use remaining operating cash after principal
        if (operatingCashRemaining > 0 && remainingInterest > 0) {
          const used = Math.min(remainingInterest, operatingCashRemaining);
          interestPaymentByMonth[idx] += used;
          operatingCashRemaining -= used;
          remainingInterest -= used;
        }

        // b) Use remaining equity
        if (equityRemaining > 0 && remainingInterest > 0) {
          const equityForInterest = Math.min(
            remainingInterest,
            equityRemaining
          );
          equityByMonth[idx] += equityForInterest;
          equityRemaining -= equityForInterest;
          interestPaymentByMonth[idx] += equityForInterest;
          remainingInterest -= equityForInterest;
        }

        // c) Finance the rest with additional debt accounting for half-month interest on the draw
        if (remainingInterest > 0) {
          if (monthlyInterestRate > 0) {
            const additionalDebt =
              remainingInterest / (1 - 0.5 * monthlyInterestRate);
            debtDrawByMonth[idx] += additionalDebt;
            // The amount of interest paid via debt is the additionalDebt drawn
            interestPaymentByMonth[idx] += additionalDebt;
          } else {
            // Zero rate edge-case: draw exactly remaining interest
            debtDrawByMonth[idx] += remainingInterest;
            interestPaymentByMonth[idx] += remainingInterest;
          }
        }

        // Interest is fully paid each month under serviced structure
      } else {
        // Rolled-up: accrue interest; use remaining operating cash to reduce it after principal
        let totalInterestDue = accruedInterestOutstanding + interestAccrual;
        if (totalInterestDue > 0 && operatingCashRemaining > 0) {
          const pay = Math.min(operatingCashRemaining, totalInterestDue);
          interestPaymentByMonth[idx] = pay;
          totalInterestDue -= pay;
          operatingCashRemaining -= pay;
        }
        accruedInterestOutstanding = totalInterestDue; // carry forward
      }

      // 4) Update outstanding principal after this month's draws
      outstandingPrincipal += debtDrawByMonth[idx];
      // Optional: cap by debtAmountRaw; if exceeded, truncate draws
      if (debtAmountRaw > 0 && outstandingPrincipal > debtAmountRaw) {
        const overflow = outstandingPrincipal - debtAmountRaw;
        debtDrawByMonth[idx] = Math.max(0, debtDrawByMonth[idx] - overflow);
        outstandingPrincipal = debtAmountRaw;
      }

      outstandingByMonth[idx] = outstandingPrincipal;
    }

    return {
      equityByMonth,
      debtDrawByMonth,
      interestPaymentByMonth,
      principalRepaymentByMonth,
      outstandingByMonth,
    } as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    monthlyInterestRate,
    availableEquity,
    debtAmountRaw,
    payoutType,
    // Dependencies that influence monthly revenue/expenses schedule
    cashFlowState.landCosts,
    cashFlowState.hardCosts,
    cashFlowState.softCosts,
    cashFlowState.units,
    cashFlowState.otherIncome,
  ]);

  // Helper functions to calculate financing draws (from simulation)
  const calculateEquityContribution = (month: number) => {
    if (month < 1 || month > 120) return 0;
    return financingSim.equityByMonth[month - 1] || 0;
  };

  const calculateDebtDraw = (month: number) => {
    if (month < 1 || month > 120) return 0;
    return financingSim.debtDrawByMonth[month - 1] || 0;
  };

  // Precomputed interest payments from simulation
  const interestPaymentsByMonth = financingSim.interestPaymentByMonth;

  const calculateInterestPayment = (month: number) => {
    if (month < 1 || month > 120) return 0;
    return interestPaymentsByMonth[month - 1] || 0;
  };

  const sumInterestPayments = useMemo(
    () => interestPaymentsByMonth.reduce((s, v) => s + v, 0),
    [interestPaymentsByMonth]
  );

  // Principal repayment utilities
  const calculatePrincipalRepayment = (month: number) => {
    if (month < 1 || month > 120) return 0;
    return financingSim.principalRepaymentByMonth[month - 1] || 0;
  };

  const sumPrincipalRepayments = useMemo(
    () => financingSim.principalRepaymentByMonth.reduce((s, v) => s + v, 0),
    [financingSim.principalRepaymentByMonth]
  );

  // Extend expenses and net cash flow to include interest payments and principal repayments
  const calculateTotalExpensesIncludingInterest = (month: number) => {
    return (
      calculateExpensesTotal(month) +
      calculateInterestPayment(month) +
      calculatePrincipalRepayment(month)
    );
  };

  const calculateCompleteNetCashFlow = (month: number) => {
    return (
      calculateRevenueTotal(month) +
      calculateDebtDraw(month) -
      calculateTotalExpensesIncludingInterest(month)
    );
  };

  // Calculate loan start month for display purposes (first month with a draw)
  const loanStartMonth = useMemo(() => {
    for (let month = 1; month <= 120; month++) {
      if ((financingSim.debtDrawByMonth[month - 1] || 0) > 0) {
        return month;
      }
    }
    // fallback if no draws
    return 1;
  }, [financingSim.debtDrawByMonth]);

  // --- IRR & EMx calculations (monthly then annualized) ---
  const unleveredCashFlows = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const month = i + 1;
      return calculateRevenueTotal(month) - calculateExpensesTotal(month);
    });
  }, [cashFlowState, calculateRevenueTotal, calculateExpensesTotal]);

  const leveredCashFlows = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const month = i + 1;
      return calculateCompleteNetCashFlow(month);
    });
  }, [cashFlowState, calculateCompleteNetCashFlow]);

  const computeIRRNewtonRaphson = (
    cashFlows: number[],
    initialGuessMonthlyRate = 0.01
  ) => {
    // If all non-negative or all non-positive, IRR is undefined
    const hasPositive = cashFlows.some((v) => v > 0);
    const hasNegative = cashFlows.some((v) => v < 0);
    if (!hasPositive || !hasNegative) return null;

    // Use periods starting at t = 1 to avoid divide-by-zero at t=0 with no CF0
    const f = (r: number) => {
      let npv = 0;
      for (let t = 1; t <= cashFlows.length; t++) {
        npv += cashFlows[t - 1] / Math.pow(1 + r, t);
      }
      return npv;
    };
    const fPrime = (r: number) => {
      let d = 0;
      for (let t = 1; t <= cashFlows.length; t++) {
        d += (-t * cashFlows[t - 1]) / Math.pow(1 + r, t + 1);
      }
      return d;
    };

    let r = initialGuessMonthlyRate;
    const maxIter = 100;
    const tol = 1e-7;

    for (let i = 0; i < maxIter; i++) {
      // Clamp to > -1 to avoid invalid bases
      if (r <= -0.999999) r = -0.999999;
      const value = f(r);
      const deriv = fPrime(r);
      if (Math.abs(deriv) < 1e-12) break;
      const next = r - value / deriv;
      if (isNaN(next) || !isFinite(next)) break;
      if (Math.abs(next - r) < tol) {
        return next;
      }
      r = next;
    }

    return null; // did not converge
  };

  const computeEMx = (cashFlows: number[]) => {
    const positives = cashFlows.filter((v) => v > 0).reduce((s, v) => s + v, 0);
    const negatives = cashFlows.filter((v) => v < 0).reduce((s, v) => s + v, 0);
    if (negatives === 0) return null;
    return positives / Math.abs(negatives);
  };

  const unleveredIrrMonthly = useMemo(() => {
    console.log("unleveredCashFlows", unleveredCashFlows);
    return computeIRRNewtonRaphson(unleveredCashFlows);
  }, [unleveredCashFlows]);

  const leveredIrrMonthly = useMemo(() => {
    console.log("leveredCashFlows", leveredCashFlows);
    return computeIRRNewtonRaphson(leveredCashFlows);
  }, [leveredCashFlows]);

  const unleveredIrrAnnual = useMemo(() => {
    if (unleveredIrrMonthly == null) return null;
    return Math.pow(1 + unleveredIrrMonthly, 12) - 1;
  }, [unleveredIrrMonthly]);

  const leveredIrrAnnual = useMemo(() => {
    if (leveredIrrMonthly == null) return null;
    return Math.pow(1 + leveredIrrMonthly, 12) - 1;
  }, [leveredIrrMonthly]);

  const unleveredEMx = useMemo(
    () => computeEMx(unleveredCashFlows),
    [unleveredCashFlows]
  );
  const leveredEMx = useMemo(
    () => computeEMx(leveredCashFlows),
    [leveredCashFlows]
  );

  return {
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
    calculateExpensesTotal,
    monthlyInterestRate,
    debtPct,
    equityPct,
    loanTerm,
    payoutType,
    sumInterestPayments,
    calculateInterestPayment,
    calculateTotalExpensesIncludingInterest,
    loanStartMonth,
    calculateEquityContribution,
    calculateDebtDraw,
    calculateCompleteNetCashFlow,
    // New metrics
    unleveredIrrAnnual,
    leveredIrrAnnual,
    unleveredEMx,
    leveredEMx,
    // Debt service
    calculatePrincipalRepayment,
    sumPrincipalRepayments,
  } as const;
}
