"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Proforma, saveProforma, getProforma } from "@/lib/session-storage";

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
    return `$${Math.round(value).toLocaleString()}`;
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
  const interestOnBasis = proforma.sources?.interestOnBasis || "drawnBalance";
  const payoutType = proforma.sources?.payoutType || "rolledUp";
  const loanTerm = proforma.sources?.loanTerms || proforma.projectLength || 0;
  const constructionDebtAmount = Math.round(
    (debtPct / 100) * (proforma.totalExpenses || 0)
  );

  // Precompute interest payments for 120 months based on draw schedule from monthly expenses
  const interestPaymentsByMonth = useMemo(() => {
    const months = 120;
    const payments = new Array<number>(months).fill(0);
    if (monthlyInterestRate <= 0 || debtPct <= 0 || loanTerm <= 0)
      return payments;

    // Find when expenses (and thus loan draws) first start
    let loanStartMonth = months + 1; // default to beyond our range
    for (let month = 1; month <= months; month++) {
      if (calculateExpensesTotal(month) > 0) {
        loanStartMonth = month;
        break;
      }
    }

    // If no expenses found, no loan needed
    if (loanStartMonth > months) return payments;

    // Loan runs for loanTerm months starting from loanStartMonth
    const loanEndMonth = loanStartMonth + loanTerm - 1;

    let outstandingPrincipal = 0; // principal drawn, excludes accrued interest
    const accruedByMonth: number[] = new Array(months).fill(0);

    for (let idx = 0; idx < months; idx++) {
      const monthNum = idx + 1;
      const monthlyExpensesBeforeInterest = calculateExpensesTotal(monthNum);
      const isLoanActive =
        monthNum >= loanStartMonth && monthNum <= loanEndMonth;
      const monthlyDraw = isLoanActive
        ? (debtPct / 100) * monthlyExpensesBeforeInterest
        : 0;

      // Basis for interest this month
      const basis = isLoanActive
        ? interestOnBasis === "entireLoan"
          ? constructionDebtAmount
          : outstandingPrincipal + monthlyDraw / 2 // average draw during month
        : 0;

      const accrual = basis * monthlyInterestRate;
      accruedByMonth[idx] = accrual;

      if (payoutType === "serviced") {
        payments[idx] = isLoanActive ? accrual : 0;
      } else {
        payments[idx] = 0; // rolled-up: paid at end
      }

      // Update outstanding principal after this month's draws
      outstandingPrincipal += monthlyDraw;
    }

    if (payoutType === "rolledUp") {
      const totalAccrued = accruedByMonth
        .slice(loanStartMonth - 1, Math.min(loanEndMonth, months))
        .reduce((s, v) => s + v, 0);
      const payIndex = Math.min(loanEndMonth, months) - 1;
      if (payIndex >= 0) payments[payIndex] = totalAccrued;
    }

    return payments;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    monthlyInterestRate,
    debtPct,
    interestOnBasis,
    payoutType,
    loanTerm,
    // Dependencies that influence monthly expenses schedule
    cashFlowState.landCosts,
    cashFlowState.hardCosts,
    cashFlowState.softCosts,
  ]);

  const calculateInterestPayment = (month: number) => {
    if (month < 1 || month > 120) return 0;
    return interestPaymentsByMonth[month - 1] || 0;
  };

  const sumInterestPayments = useMemo(
    () => interestPaymentsByMonth.reduce((s, v) => s + v, 0),
    [interestPaymentsByMonth]
  );

  // Extend expenses and net cash flow to include interest payments
  const calculateTotalExpensesIncludingInterest = (month: number) => {
    return calculateExpensesTotal(month) + calculateInterestPayment(month);
  };

  const calculateNetCashFlowIncludingInterest = (month: number) => {
    return (
      calculateRevenueTotal(month) -
      calculateTotalExpensesIncludingInterest(month)
    );
  };

  // Calculate loan start month for display purposes
  const loanStartMonth = useMemo(() => {
    if (loanTerm <= 0) return 1;
    for (let month = 1; month <= 120; month++) {
      if (calculateExpensesTotal(month) > 0) {
        return month;
      }
    }
    return 1;
  }, [
    loanTerm,
    calculateExpensesTotal,
    cashFlowState.landCosts,
    cashFlowState.hardCosts,
    cashFlowState.softCosts,
  ]);

  return {
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
    calculateExpensesTotal,
    monthlyInterestRate,
    debtPct,
    loanTerm,
    payoutType,
    sumInterestPayments,
    calculateInterestPayment,
    calculateTotalExpensesIncludingInterest,
    calculateNetCashFlowIncludingInterest,
    loanStartMonth,
  } as const;
}
