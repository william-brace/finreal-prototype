// Singleton class for mock data store
class MockDataStore {
  private static instance: MockDataStore;
  private projectsMap: Map<string, Project>;

  private constructor() {
    this.projectsMap = new Map<string, Project>();
    // Initialize with default project
    const defaultProject: Project = {
      id: "1",
      name: "Downtown Condo Development",
      location: "Toronto, ON",
      address: "123 Main St",
      landCost: 15000000,
      notes: "Prime downtown location with excellent transit access.",
      proformas: [
        {
          id: "1",
          name: "Base Case",
          lastUpdated: "2024-03-15",
          totalCost: 75000000,
          netProfit: 25000000,
          roi: 33.3,
          gba: 250000,
          stories: 30,
          projectLength: 36,
          absorptionPeriod: 12,
          unitMix: [
            {
              type: "1 Bedroom",
              sqft: 750,
              pricePerSqft: 1000,
              quantity: 50,
              totalValue: 37500000,
            },
            {
              type: "2 Bedroom",
              sqft: 1100,
              pricePerSqft: 900,
              quantity: 30,
              totalValue: 29700000,
            },
            {
              type: "3 Bedroom",
              sqft: 1500,
              pricePerSqft: 800,
              quantity: 20,
              totalValue: 24000000,
            },
          ],
          sources: {
            debt: 70,
            equity: 30,
            interestRate: 5.5,
          },
          uses: {
            legalCosts: 5000,
            quantitySurveyorCosts: 8000,
            realtorFee: 2.5,
            hardCostContingency: 10,
            softCostContingency: 5,
            additionalCosts: [
              { name: "Permit Fees", amount: 250000 },
              { name: "Development Charges", amount: 1500000 },
            ],
          },
          results: {
            totalProjectCost: 75000000,
            netProfit: 25000000,
            roi: 33.3,
            costPerUnit: 750000,
          },
        },
        {
          id: "2",
          name: "Optimistic",
          lastUpdated: "2024-03-10",
          totalCost: 70000000,
          netProfit: 30000000,
          roi: 42.9,
          gba: 250000,
          stories: 30,
          projectLength: 36,
          absorptionPeriod: 12,
          unitMix: [
            {
              type: "1 Bedroom",
              sqft: 750,
              pricePerSqft: 1000,
              quantity: 50,
              totalValue: 37500000,
            },
            {
              type: "2 Bedroom",
              sqft: 1100,
              pricePerSqft: 900,
              quantity: 30,
              totalValue: 29700000,
            },
            {
              type: "3 Bedroom",
              sqft: 1500,
              pricePerSqft: 800,
              quantity: 20,
              totalValue: 24000000,
            },
          ],
          sources: {
            debt: 70,
            equity: 30,
            interestRate: 5.5,
          },
          uses: {
            legalCosts: 5000,
            quantitySurveyorCosts: 8000,
            realtorFee: 2.5,
            hardCostContingency: 10,
            softCostContingency: 5,
            additionalCosts: [
              { name: "Permit Fees", amount: 250000 },
              { name: "Development Charges", amount: 1500000 },
            ],
          },
          results: {
            totalProjectCost: 70000000,
            netProfit: 30000000,
            roi: 42.9,
            costPerUnit: 700000,
          },
        },
        {
          id: "3",
          name: "Conservative",
          lastUpdated: "2024-03-05",
          totalCost: 80000000,
          netProfit: 20000000,
          roi: 25.0,
          gba: 250000,
          stories: 30,
          projectLength: 36,
          absorptionPeriod: 12,
          unitMix: [
            {
              type: "1 Bedroom",
              sqft: 750,
              pricePerSqft: 1000,
              quantity: 50,
              totalValue: 37500000,
            },
            {
              type: "2 Bedroom",
              sqft: 1100,
              pricePerSqft: 900,
              quantity: 30,
              totalValue: 29700000,
            },
            {
              type: "3 Bedroom",
              sqft: 1500,
              pricePerSqft: 800,
              quantity: 20,
              totalValue: 24000000,
            },
          ],
          sources: {
            debt: 70,
            equity: 30,
            interestRate: 5.5,
          },
          uses: {
            legalCosts: 5000,
            quantitySurveyorCosts: 8000,
            realtorFee: 2.5,
            hardCostContingency: 10,
            softCostContingency: 5,
            additionalCosts: [
              { name: "Permit Fees", amount: 250000 },
              { name: "Development Charges", amount: 1500000 },
            ],
          },
          results: {
            totalProjectCost: 80000000,
            netProfit: 20000000,
            roi: 25.0,
            costPerUnit: 800000,
          },
        },
      ],
    };
    this.projectsMap.set(defaultProject.id, defaultProject);
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }

  public getProject(id: string): Project | undefined {
    console.log("Getting project with ID:", id);
    console.log("Current projects:", Array.from(this.projectsMap.values()));
    const project = this.projectsMap.get(id);
    console.log("Found project:", project);
    return project;
  }

  public getProjects(): Project[] {
    return Array.from(this.projectsMap.values());
  }

  public createProject(project: Omit<Project, "id" | "proformas">): Project {
    console.log("Creating project with data:", project);
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substring(2, 9),
      proformas: [],
    };
    console.log("New project created:", newProject);
    this.projectsMap.set(newProject.id, newProject);
    console.log("Updated projects map:", Array.from(this.projectsMap.values()));
    return newProject;
  }

  public updateProject(
    id: string,
    project: Partial<Project>
  ): Project | undefined {
    const existingProject = this.projectsMap.get(id);
    if (!existingProject) return undefined;

    const updatedProject = { ...existingProject, ...project };
    this.projectsMap.set(id, updatedProject);
    return updatedProject;
  }

  public deleteProject(id: string): boolean {
    return this.projectsMap.delete(id);
  }
}

// Types
export type Project = {
  id: string;
  name: string;
  location: string;
  address: string;
  landCost: number;
  notes?: string;
  proformas: Proforma[];
};

export type Proforma = {
  id: string;
  name: string;
  lastUpdated: string;
  totalCost: number;
  netProfit: number;
  roi: number;
  gba: number;
  stories: number;
  projectLength: number;
  absorptionPeriod: number;
  unitMix: {
    type: string;
    sqft: number;
    pricePerSqft: number;
    quantity: number;
    totalValue: number;
  }[];
  sources: {
    debt: number;
    equity: number;
    interestRate: number;
  };
  uses: {
    legalCosts: number;
    quantitySurveyorCosts: number;
    realtorFee: number;
    hardCostContingency: number;
    softCostContingency: number;
    additionalCosts: {
      name: string;
      amount: number;
    }[];
  };
  results: {
    totalProjectCost: number;
    netProfit: number;
    roi: number;
    costPerUnit: number;
  };
};

// API functions
export async function getProject(id: string): Promise<Project | undefined> {
  return MockDataStore.getInstance().getProject(id);
}

export async function getProjects(): Promise<Project[]> {
  return MockDataStore.getInstance().getProjects();
}

export async function createProject(
  project: Omit<Project, "id" | "proformas">
): Promise<Project> {
  return MockDataStore.getInstance().createProject(project);
}

export async function updateProject(
  id: string,
  project: Partial<Project>
): Promise<Project | undefined> {
  return MockDataStore.getInstance().updateProject(id, project);
}

export async function deleteProject(id: string): Promise<boolean> {
  return MockDataStore.getInstance().deleteProject(id);
}
