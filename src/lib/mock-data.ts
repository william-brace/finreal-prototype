// Singleton class for mock data store
class MockDataStore {
    private static instance: MockDataStore
    private projectsMap: Map<string, Project>

    private constructor() {
        this.projectsMap = new Map<string, Project>()
        // Initialize with default project
        const defaultProject: Project = {
            id: "1",
            name: "Downtown Condo Development",
            location: "Toronto, ON",
            address: "123 Main St",
            proformaType: "Residential",
            stories: 30,
            gba: 250000,
            landCost: 15000000,
            projectLength: 36,
            absorptionPeriod: 12,
            notes: "Prime downtown location with excellent transit access.",
            proformas: [
                {
                    id: "1",
                    name: "Base Case",
                    lastUpdated: "2024-03-15",
                    totalCost: 75000000,
                    netProfit: 25000000,
                    roi: 33.3,
                },
                {
                    id: "2",
                    name: "Optimistic",
                    lastUpdated: "2024-03-10",
                    totalCost: 70000000,
                    netProfit: 30000000,
                    roi: 42.9,
                },
                {
                    id: "3",
                    name: "Conservative",
                    lastUpdated: "2024-03-05",
                    totalCost: 80000000,
                    netProfit: 20000000,
                    roi: 25.0,
                },
            ],
        }
        this.projectsMap.set(defaultProject.id, defaultProject)
    }

    public static getInstance(): MockDataStore {
        if (!MockDataStore.instance) {
            MockDataStore.instance = new MockDataStore()
        }
        return MockDataStore.instance
    }

    public getProject(id: string): Project | undefined {
        console.log("Getting project with ID:", id)
        console.log("Current projects:", Array.from(this.projectsMap.values()))
        const project = this.projectsMap.get(id)
        console.log("Found project:", project)
        return project
    }

    public getProjects(): Project[] {
        return Array.from(this.projectsMap.values())
    }

    public createProject(project: Omit<Project, "id" | "proformas">): Project {
        console.log("Creating project with data:", project)
        const newProject: Project = {
            ...project,
            id: Math.random().toString(36).substring(2, 9),
            proformas: [],
        }
        console.log("New project created:", newProject)
        this.projectsMap.set(newProject.id, newProject)
        console.log("Updated projects map:", Array.from(this.projectsMap.values()))
        return newProject
    }

    public updateProject(id: string, project: Partial<Project>): Project | undefined {
        const existingProject = this.projectsMap.get(id)
        if (!existingProject) return undefined

        const updatedProject = { ...existingProject, ...project }
        this.projectsMap.set(id, updatedProject)
        return updatedProject
    }

    public deleteProject(id: string): boolean {
        return this.projectsMap.delete(id)
    }
}

// Types
export type Project = {
    id: string
    name: string
    location: string
    address: string
    proformaType: string
    stories: number
    gba: number
    landCost: number
    projectLength: number
    absorptionPeriod: number
    notes?: string
    proformas: Proforma[]
}

export type Proforma = {
    id: string
    name: string
    lastUpdated: string
    totalCost: number
    netProfit: number
    roi: number
}

// API functions
export async function getProject(id: string): Promise<Project | undefined> {
    return MockDataStore.getInstance().getProject(id)
}

export async function getProjects(): Promise<Project[]> {
    return MockDataStore.getInstance().getProjects()
}

export async function createProject(project: Omit<Project, "id" | "proformas">): Promise<Project> {
    return MockDataStore.getInstance().createProject(project)
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project | undefined> {
    return MockDataStore.getInstance().updateProject(id, project)
}

export async function deleteProject(id: string): Promise<boolean> {
    return MockDataStore.getInstance().deleteProject(id)
} 