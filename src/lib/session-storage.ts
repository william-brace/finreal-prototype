import { Project } from "./mock-data"

// Re-export Project type
export type { Project }

// Types
export interface Proforma {
    id: string
    name: string
    projectId: string
    lastUpdated: string
    totalCost: number
    netProfit: number
    roi: number
    gba: number
    stories: number
    projectLength: number
    absorptionPeriod: number
    unitMix: UnitType[]
    otherIncome: OtherIncome[]
    totalRevenue: number
    totalExpenses: number
    sources: {
        equityPct: number
        debtPct: number
        financingCosts: {
            interestPct: number
            brokerFeePct: number
        }
    }
    uses: {
        landCosts: {
            baseCost: number
            closingCost: number
            additionalCosts: Array<{ name: string; amount: number }>
        }
        hardCosts: {
            baseCost: number
            contingencyPct: number
            additionalCosts: Array<{ name: string; amount: number }>
        }
        softCosts: {
            development: number
            consultants: number
            adminMarketing: number
            contingencyPct: number
            additionalCosts: Array<{ name: string; amount: number }>
        }
    }
    results: {
        totalProjectCost: number
        netProfit: number
        roi: number
        costPerUnit: number
    }
    metrics: {
        grossProfit: number
        roi: number
        annualizedRoi: number
        leveredEmx: number
    }
}

export interface Unit {
    id: string
    name: string
    area: number
    value: number
}

export interface UnitType {
    id: string
    name: string
    description: string
    units: Unit[]
}

export interface OtherIncome {
    id: string
    name: string
    description: string
    value: number
    unitType: string
    numberOfUnits: number
    valuePerUnit: number
    customUnitType?: string
}

// Session Storage Keys
const PROJECTS_KEY = 'finreal_projects'
const PROFORMAS_KEY = 'finreal_proformas'
const ACTIVE_TAB_KEY = 'finreal_active_tab'

// Project Operations
export function getProjects(): Project[] {
    if (typeof window === 'undefined') return []
    const projects = sessionStorage.getItem(PROJECTS_KEY)
    return projects ? JSON.parse(projects) : []
}

export function getProject(id: string): Project | null {
    const projects = getProjects()
    return projects.find(p => p.id === id) || null
}

export function saveProject(project: Project): void {
    const projects = getProjects()
    const index = projects.findIndex(p => p.id === project.id)

    if (index >= 0) {
        projects[index] = project
    } else {
        projects.push(project)
    }

    sessionStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function deleteProject(id: string): void {
    const projects = getProjects()
    const filteredProjects = projects.filter(p => p.id !== id)
    sessionStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects))
}

// Proforma Operations
export function getProformas(projectId: string): Proforma[] {
    if (typeof window === 'undefined') return []
    const proformas = sessionStorage.getItem(`${PROFORMAS_KEY}_${projectId}`)
    return proformas ? JSON.parse(proformas) : []
}

export function getProforma(projectId: string, proformaId: string): Proforma | null {
    const proformas = getProformas(projectId)
    return proformas.find(p => p.id === proformaId) || null
}

export function calculateTotalRevenue(proforma: Proforma): number {
    const unitMixRevenue = proforma.unitMix.reduce((total, unitType) => {
        return total + unitType.units.reduce((unitTypeTotal, unit) => {
            return unitTypeTotal + (unit.area * unit.value);
        }, 0);
    }, 0);

    const otherIncomeRevenue = proforma.otherIncome.reduce((total, income) => {
        return total + (income.numberOfUnits * income.valuePerUnit);
    }, 0);

    return unitMixRevenue + otherIncomeRevenue;
}

export function calculateProformaMetrics(proforma: Proforma): Proforma {
    const totalProfit = proforma.totalRevenue - proforma.totalExpenses;
    const leveredEmx = proforma.totalExpenses > 0 
        ? proforma.totalRevenue / proforma.totalExpenses 
        : 0;
    const grossProfit = totalProfit;
    const roiFormula = (proforma.sources.equityPct && proforma.totalExpenses)
        ? grossProfit / ((proforma.sources.equityPct / 100) * proforma.totalExpenses)
        : 0;
    const annualizedRoi = (roiFormula && proforma.projectLength)
        ? roiFormula / (proforma.projectLength / 12)
        : 0;

    return {
        ...proforma,
        metrics: {
            grossProfit,
            leveredEmx,
            roi: roiFormula * 100,
            annualizedRoi: annualizedRoi * 100,
        },
    };
}

export function saveProforma(projectId: string, proforma: Proforma): void {
    const proformas = getProformas(projectId)
    const index = proformas.findIndex(p => p.id === proforma.id)

    // Always recalculate metrics and totalExpenses before saving
    const updatedProforma = calculateProformaMetrics({
        ...proforma,
        totalRevenue: calculateTotalRevenue(proforma)
    });

    if (index >= 0) {
        proformas[index] = updatedProforma
    } else {
        proformas.push(updatedProforma)
    }

    sessionStorage.setItem(`${PROFORMAS_KEY}_${projectId}`, JSON.stringify(proformas))
}

export function deleteProforma(projectId: string, proformaId: string): void {
    const proformas = getProformas(projectId)
    const filteredProformas = proformas.filter(p => p.id !== proformaId)
    sessionStorage.setItem(`${PROFORMAS_KEY}_${projectId}`, JSON.stringify(filteredProformas))
}

// Tab Operations
export function getActiveTab(projectId: string, proformaId: string): string {
    if (typeof window === 'undefined') return 'general'
    const key = `${ACTIVE_TAB_KEY}_${projectId}_${proformaId}`
    return sessionStorage.getItem(key) || 'general'
}

export function setActiveTab(projectId: string, proformaId: string, tab: string): void {
    const key = `${ACTIVE_TAB_KEY}_${projectId}_${proformaId}`
    sessionStorage.setItem(key, tab)
}

export function createNewProforma(projectId: string, projectLandCost: number): Proforma {
  return {
    id: Date.now().toString(),
    name: "New Proforma",
    projectId,
    lastUpdated: new Date().toISOString().split('T')[0],
    totalCost: 0,
    netProfit: 0,
    roi: 0,
    gba: 0,
    stories: 0,
    projectLength: 0,
    absorptionPeriod: 0,
    unitMix: [],
    otherIncome: [],
    totalRevenue: 0,
    totalExpenses: 0,
    sources: {
      equityPct: 30,
      debtPct: 70,
      financingCosts: {
        interestPct: 5.5,
        brokerFeePct: 0
      }
    },
    uses: {
      landCosts: {
        baseCost: projectLandCost,
        closingCost: 0,
        additionalCosts: []
      },
      hardCosts: {
        baseCost: 0,
        contingencyPct: 10,
        additionalCosts: []
      },
      softCosts: {
        development: 0,
        consultants: 0,
        adminMarketing: 0,
        contingencyPct: 5,
        additionalCosts: []
      }
    },
    results: {
      totalProjectCost: 0,
      netProfit: 0,
      roi: 0,
      costPerUnit: 0
    },
    metrics: {
      grossProfit: 0,
      roi: 0,
      annualizedRoi: 0,
      leveredEmx: 0
    }
  }
} 