"use client";

import { CashFlowTab } from "@/components/proforma/tabs/CashFlowTab";
import { GeneralTab } from "@/components/proforma/tabs/GeneralTab";
import { OtherIncomeTab } from "@/components/proforma/tabs/OtherIncomeTab";
import { ResultsTab } from "@/components/proforma/tabs/ResultsTab";
import { SourcesUsesTab } from "@/components/proforma/tabs/SourcesUsesTab";
import { SummaryCard } from "@/components/proforma/tabs/SummaryCard";
import { UnitMixTab } from "@/components/proforma/tabs/UnitMixTab";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportProformaPDF } from "@/lib/pdf/exportProformaPDF";
import {
  Proforma,
  Project,
  getActiveTab,
  getProforma,
  getProject,
  saveProforma,
  setActiveTab,
} from "@/lib/session-storage";
import Link from "next/link";
import { use, useEffect, useState, useRef } from "react";

export default function ProformaEditorPage({
  params,
}: {
  params: Promise<{ id: string; proformaId: string }>;
}) {
  const { id, proformaId } = use(params);
  const [proforma, setProforma] = useState<Proforma | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [proformaName, setProformaName] = useState("");
  const [activeTab, setActiveTabState] = useState("general");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [proformaTypeValue, setProformaTypeValue] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = () => {
      try {
        const proformaData = getProforma(id, proformaId);
        const projectData = getProject(id);
        if (proformaData) {
          setProforma(proformaData);
          setProformaName(proformaData.name);
          setProformaTypeValue(proformaData.proformaType || "");
          setActiveTabState(getActiveTab(id, proformaId));
        }
        if (projectData) {
          setProject(projectData);
          // Set the land cost from the project if it doesn't exist in the proforma
          if (
            proformaData &&
            projectData.landCost &&
            proformaData.uses.landCosts.baseCost === 0
          ) {
            const updatedProforma = {
              ...proformaData,
              uses: {
                ...proformaData.uses,
                landCosts: {
                  ...proformaData.uses.landCosts,
                  baseCost: projectData.landCost,
                },
              },
            };
            setProforma(updatedProforma);
            saveProforma(id, updatedProforma);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, proformaId]);

  const handleInputChange = (field: string, value: string | number) => {
    if (!proforma) return;
    const updatedProforma: Proforma = {
      ...proforma,
      [field]: value,
    };
    setProforma((prev) => {
      if (!prev) return prev;
      return updatedProforma;
    });
    saveProforma(id, updatedProforma);
  };

  const handleNameEdit = () => {
    setIsEditingName(true);
    setEditingName(proformaName);
  };

  const handleNameSave = () => {
    if (!proforma) return;

    const trimmedName = editingName.trim();
    const finalName = trimmedName || "Untitled Proforma";

    setProformaName(finalName);
    setIsEditingName(false);

    const updatedProforma: Proforma = {
      ...proforma,
      name: finalName,
    };
    setProforma(updatedProforma);
    saveProforma(id, updatedProforma);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditingName(proformaName);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSave();
    } else if (e.key === "Escape") {
      handleNameCancel();
    }
  };

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleExportPDF = () => {
    if (!proforma) return;
    exportProformaPDF(proforma, project);
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  if (!proforma) {
    return <div className="container mx-auto py-8">Proforma not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 max-w-2xl">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="text-3xl font-bold bg-transparent border-b-2 border-primary focus:outline-none focus:border-primary px-2 py-1 rounded"
            />
          ) : (
            <h1
              className="text-3xl font-bold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
              onClick={handleNameEdit}
            >
              {proformaName || "Untitled Proforma"}
            </h1>
          )}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleExportPDF}>
            Export to PDF
          </Button>
          <Link href={`/projects/${id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          setActiveTabState(value);
          setActiveTab(id, proformaId, value);
          // Refresh proforma from session storage so timing changes persist across tab switches
          const latest = getProforma(id, proformaId);
          if (latest) setProforma(latest);
        }}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-7 mb-2">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
          <TabsTrigger value="other-income">Other Income</TabsTrigger>
          <TabsTrigger value="sources-uses">Sources & Uses</TabsTrigger>
          <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className={
              activeTab === "cash-flow" ? "lg:col-span-3" : "lg:col-span-2"
            }
          >
            <TabsContent value="general">
              <GeneralTab
                gbaValue={proforma.gba?.toString() ?? ""}
                setGbaValue={(value) => handleInputChange("gba", value)}
                storiesValue={proforma.stories?.toString() ?? ""}
                setStoriesValue={(value) => handleInputChange("stories", value)}
                projectLengthValue={proforma.projectLength?.toString() ?? ""}
                setProjectLengthValue={(value) =>
                  handleInputChange("projectLength", value)
                }
                absorptionPeriodValue={
                  proforma.absorptionPeriod?.toString() ?? ""
                }
                setAbsorptionPeriodValue={(value) =>
                  handleInputChange("absorptionPeriod", value)
                }
                proformaTypeValue={proformaTypeValue}
                setProformaTypeValue={(value) => {
                  setProformaTypeValue(value);
                  handleInputChange("proformaType", value);
                }}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="unit-mix">
              <UnitMixTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="other-income">
              <OtherIncomeTab
                proforma={proforma}
                onProformaChange={setProforma}
              />
            </TabsContent>

            <TabsContent value="sources-uses">
              <SourcesUsesTab
                proforma={proforma}
                onProformaChange={setProforma}
              />
            </TabsContent>

            <TabsContent value="cash-flow">
              <CashFlowTab proforma={proforma} />
            </TabsContent>

            <TabsContent value="results">
              <ResultsTab proforma={proforma} />
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Info</CardTitle>
                  <CardDescription>
                    Assumptions and input sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Auto-filled Values</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>
                          Development Charges - Based on Toronto, ON rates
                        </li>
                        <li>Permit Fees - Based on Toronto, ON rates</li>
                        <li>Legal Costs - Based on market averages</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Manual Inputs</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Unit Mix - User defined</li>
                        <li>Debt Ratio - User defined</li>
                        <li>Interest Rate - User defined</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Last Updated</h3>
                      <p className="text-sm text-muted-foreground">
                        March 15, 2024
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {activeTab !== "cash-flow" && (
            <div className="lg:col-span-1">
              <SummaryCard proforma={proforma} />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
