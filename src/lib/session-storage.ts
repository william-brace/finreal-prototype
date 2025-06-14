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
    sources: {
        constructionDebt: number
        equity: number
        interestRate: number
        equityPct: number
        debtPct: number
        interestPct: number
        brokerFeePct: number
        totalProjectCost: number
    }
    uses: {
        legalCosts: number
        quantitySurveyorCosts: number
        realtorFee: number
        hardCostContingency: number
        softCostContingency: number
        additionalCosts: Array<{ name: string; amount: number }>
        constructionCost: number
        hardCostContingencyPct: number
        softDev: number
        softConsultants: number
        adminMarketing: number
        softCostContingencyPct: number
        hardCosts: Array<{ name: string; amount: number }>
        softCosts: Array<{ name: string; amount: number }>
    }
    results: {
        totalProjectCost: number
        netProfit: number
        roi: number
        costPerUnit: number
    }
    metrics: {
        grossRevenue: number
        totalExpenses: number
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

export function saveProforma(projectId: string, proforma: Proforma): void {
    const proformas = getProformas(projectId)
    const index = proformas.findIndex(p => p.id === proforma.id)

    if (index >= 0) {
        proformas[index] = proforma
    } else {
        proformas.push(proforma)
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