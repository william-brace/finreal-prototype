'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import { getProforma, saveProforma, Proforma, getProject, Project, getActiveTab, setActiveTab } from "@/lib/session-storage"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { GeneralTab } from "@/components/proforma/tabs/GeneralTab"
import { ResultsTab } from "@/components/proforma/tabs/ResultsTab"
import { UnitMixTab } from "@/components/proforma/tabs/UnitMixTab"
import { OtherIncomeTab } from "@/components/proforma/tabs/OtherIncomeTab"
import { SourcesUsesTab } from "@/components/proforma/tabs/SourcesUsesTab"
import { SummaryCard } from "@/components/proforma/tabs/SummaryCard"
import { useRouter } from "next/navigation"


export default function ProformaEditorPage({
  params,
}: {
  params: Promise<{ id: string; proformaId: string }>
}) {
  const { id, proformaId } = use(params)
  const router = useRouter()
  const [proforma, setProforma] = useState<Proforma | null>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [proformaName, setProformaName] = useState('')
  const [activeTab, setActiveTabState] = useState('general')

  useEffect(() => {
    const fetchData = () => {
      try {
        const proformaData = getProforma(id, proformaId)
        const projectData = getProject(id)
        if (proformaData) {
          setProforma(proformaData)
          setProformaName(proformaData.name)
          setActiveTabState(getActiveTab(id, proformaId))
        }
        if (projectData) {
          setProject(projectData)
          // Set the land cost from the project if it doesn't exist in the proforma
          if (proformaData && projectData.landCost && proformaData.uses.landCosts.baseCost === 0) {
            const updatedProforma = {
              ...proformaData,
              uses: {
                ...proformaData.uses,
                landCosts: {
                  ...proformaData.uses.landCosts,
                  baseCost: projectData.landCost
                }
              }
            }
            setProforma(updatedProforma)
            saveProforma(id, updatedProforma)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, proformaId])

  const handleInputChange = (field: string, value: string | number) => {
    if (!proforma) return
    const updatedProforma: Proforma = {
      ...proforma,
      [field]: value
    }
    setProforma(prev => {
      if (!prev) return prev;
      return updatedProforma;
    })
    saveProforma(id, updatedProforma)
  }


  const handleExportPDF = () => {
    if (!proforma) return
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    let y = 40

    // Header Section
    doc.setFontSize(18)
    doc.text(proforma.name || '[Property Name]', 40, y)
    doc.setFontSize(10)
    y += 20
    doc.text(project?.proformaType ? `${project.proformaType} Proforma` : '[Proforma Type]', 40, y)
    doc.text(`Date (${new Date().toLocaleDateString()})`, 40, y + 15)
    // Logo placeholder
    doc.setFillColor('230')
    doc.rect(420, 20, 120, 50, 'F')
    doc.setTextColor(100)
    doc.text('[USER LOGO]', 480, 50, { align: 'center' })
    y += 40
    // Property image placeholder
    doc.setFillColor('240')
    doc.rect(40, y, 500, 100, 'F')
    doc.setTextColor(120)
    doc.setFontSize(12)
    doc.text('[INSERT IMAGE OF PROPERTY]', 290, y + 55, { align: 'center' })
    y += 120
    doc.setTextColor(0)
    doc.setFontSize(10)
    // Property Description, GBA, Project Length
    doc.text('[Property Description]', 40, y)
    doc.text('GBA: ' + (typeof proforma.gba === 'number' ? proforma.gba.toLocaleString() : ''), 420, Number(y))
    y += 15
    doc.text('Project Length (months): ' + (typeof proforma.projectLength === 'number' ? proforma.projectLength.toString() : ''), 420, Number(y))
    y += 20
    // Proforma Summary Title
    doc.setFontSize(14)
    doc.text('Proforma Summary', 40, y)
    y += 10
    doc.setLineWidth(0.5)
    doc.line(40, y, 555, y)
    y += 18
    // Revenue Table Title (smaller, bold, closer)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenue', 40, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    // Revenue Table (combined Units and Other Income)
    type TableCell = string | { content: string; colSpan?: number; styles?: { fontStyle?: 'bold'; halign?: 'left' | 'right' } };
    const revenueTableBody: TableCell[][] = [];
    // Units subheader
    revenueTableBody.push([
      { content: 'Units', colSpan: 6, styles: { fontStyle: 'bold' as const, halign: 'left' as const } }
    ]);
    // Unit mix rows
    proforma.unitMix.forEach((unitType, idx) => {
      revenueTableBody.push([
        unitType.name,
        String(unitType.units.length),
        unitType.units.length ? (unitType.units.reduce((sum, u) => sum + u.area, 0) / unitType.units.length).toFixed(2) : '0.00',
        unitType.units.length > 0 ? (unitType.units.reduce((sum, u) => sum + u.value, 0) / unitType.units.length).toFixed(2) : '0.00',
        unitType.units.length > 0 ? (unitType.units.reduce((sum, u) => sum + u.value, 0) / unitType.units.length).toLocaleString() : '0',
        typeof unitType.units.reduce((sum, u) => sum + u.value, 0) === 'number' ? unitType.units.reduce((sum, u) => sum + u.value, 0).toLocaleString() : '0'
      ]);
    });
    // Units total row
    revenueTableBody.push([
      'Total',
      String(proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)),
      (proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.area, 0), 0) / (proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0) || 1)).toFixed(2),
      (proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.value, 0), 0) / (proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0) || 1)).toFixed(2),
      '',
      typeof proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.value, 0), 0) === 'number' ? proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.value, 0), 0).toLocaleString() : '0'
    ]);
    // Other Income subheader
    revenueTableBody.push([
      { content: 'Other Income', colSpan: 6, styles: { fontStyle: 'bold' as const, halign: 'left' as const } }
    ]);
    // Other income rows
    proforma.otherIncome.forEach((item) => {
      revenueTableBody.push([
        item.name || '',
        String(item.numberOfUnits),
        '',
        '',
        typeof item.valuePerUnit === 'number' ? item.valuePerUnit.toLocaleString() : '0',
        typeof item.numberOfUnits === 'number' && typeof item.valuePerUnit === 'number' ? (item.numberOfUnits * item.valuePerUnit).toLocaleString() : '0'
      ]);
    });
    // Other income total row
    revenueTableBody.push([
      'Total',
      String(proforma.otherIncome.reduce((sum, i) => sum + i.numberOfUnits, 0)),
      '',
      '',
      '',
      typeof proforma.otherIncome.reduce((sum, i) => sum + (i.numberOfUnits * i.valuePerUnit), 0) === 'number' ? proforma.otherIncome.reduce((sum, i) => sum + (i.numberOfUnits * i.valuePerUnit), 0).toLocaleString() : '0'
    ]);
    // Total Revenue row (bold, left label, right value)
    revenueTableBody.push([
      { content: 'Total Revenue', styles: { fontStyle: 'bold' as const, halign: 'left' as const } },
      '', '', '', '',
      { content: typeof proforma.totalRevenue === 'number' ? proforma.totalRevenue.toLocaleString() : '0', styles: { fontStyle: 'bold' as const, halign: 'right' as const } }
    ]);
    autoTable(doc, {
      startY: y,
      head: [[
        '', 'Units', 'Avg SF', '$/SF', 'Avg Unit Value', 'Total'
      ]],
      body: revenueTableBody as any,
      theme: 'plain',
      headStyles: {
        fillColor: [0, 0, 0], // solid black
        textColor: 255, // white text
        fontStyle: 'bold' as const,
        fontSize: 9,
        halign: 'right' as const,
        valign: 'middle' as const,
        cellPadding: { top: 1.5, bottom: 1.5 }
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: { top: 1.5, bottom: 1.5 },
        halign: 'right' as const,
        valign: 'middle' as const,
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 100 }, // Label column
        1: { halign: 'right', cellWidth: 60 }, // Units
        2: { halign: 'right', cellWidth: 80 }, // Avg SF
        3: { halign: 'right', cellWidth: 80 }, // $/SF
        4: { halign: 'right', cellWidth: 95 }, // Avg Unit Value
        5: { halign: 'right', cellWidth: 100 }, // Total
      },
      margin: { left: 40, right: 40 },
      tableWidth: 'auto',
      didParseCell: function (data) {
        // Make subheaders and total revenue bold
        if (data.row.raw && Array.isArray(data.row.raw) && data.row.raw[0] && typeof data.row.raw[0] === 'object' && 'styles' in data.row.raw[0] && data.row.raw[0].styles && data.row.raw[0].styles.fontStyle === 'bold') {
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.row.raw && Array.isArray(data.row.raw) && data.row.raw[0] && typeof data.row.raw[0] === 'object' && 'content' in data.row.raw[0] && data.row.raw[0].content === 'Total Revenue') {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      didDrawCell: function (data) {
        const doc = data.doc;
        // Calculate the rightmost x position of the table
        const columns = data.table.columns as any[];
        const leftCol = columns[0];
        const rightCol = columns[columns.length - 1];
        const tableLeftX = leftCol && typeof leftCol.x === 'number' ? leftCol.x : undefined;
        const tableRightX = rightCol && typeof rightCol.x === 'number' && typeof rightCol.width === 'number'
          ? rightCol.x + rightCol.width
          : undefined;
        // Draw only horizontal lines above the header and at the bottom of the table
        if (
          typeof tableLeftX === 'number' &&
          typeof tableRightX === 'number' &&
          typeof data.cell.y === 'number'
        ) {
          if (data.cell.section === 'head' && data.row.index === 0 && data.column.index === 0) {
            // Top border above header
            doc.setLineWidth(0.7);
            doc.line(tableLeftX, data.cell.y, tableRightX, data.cell.y);
          }
          // Bottom border for the last row
          if (data.cell.section === 'body' && data.row.index === data.table.body.length - 1 && data.column.index === 0) {
            doc.setLineWidth(0.7);
            doc.line(tableLeftX, data.cell.y + data.cell.height, tableRightX, data.cell.y + data.cell.height);
          }
        }
      }
    });
  
    // Save PDF
    doc.save(`${proforma.name || 'proforma'}.pdf`)
  }

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>
  }

  if (!proforma) {
    return <div className="container mx-auto py-8">Proforma not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex-1 max-w-2xl">
          <h1 
            className="text-3xl font-bold cursor-pointer hover:bg-muted/50 px-2 py-1 rounded"
          >
            {proformaName || "Untitled Proforma"}
          </h1>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleExportPDF}>Export to PDF</Button>
          <Link href={`/projects/${id}`}>
            <Button variant="outline">Back to Project</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTabState(value)
              setActiveTab(id, proformaId, value)
            }} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
              <TabsTrigger value="other-income">Other Income</TabsTrigger>
              <TabsTrigger value="sources-uses">Sources & Uses</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <GeneralTab
                gbaValue={proforma.gba?.toString() ?? ''}
                setGbaValue={(value) => handleInputChange('gba', value)}
                storiesValue={proforma.stories?.toString() ?? ''}
                setStoriesValue={(value) => handleInputChange('stories', value)}
                projectLengthValue={proforma.projectLength?.toString() ?? ''}
                setProjectLengthValue={(value) => handleInputChange('projectLength', value)}
                absorptionPeriodValue={proforma.absorptionPeriod?.toString() ?? ''}
                setAbsorptionPeriodValue={(value) => handleInputChange('absorptionPeriod', value)}
                handleInputChange={handleInputChange}
              />
            </TabsContent>

            <TabsContent value="unit-mix">
              <UnitMixTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="other-income">
              <OtherIncomeTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="sources-uses">
              <SourcesUsesTab proforma={proforma} onProformaChange={setProforma} />
            </TabsContent>

            <TabsContent value="results">
              <ResultsTab proforma={proforma} />
            </TabsContent>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Info</CardTitle>
                  <CardDescription>Assumptions and input sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Auto-filled Values</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Development Charges - Based on Toronto, ON rates</li>
                        <li>Permit Fees - Based on Toronto, ON rates</li>
                        <li>Legal Costs - Based on market averages</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Manual Inputs</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        <li>Unit Mix - User defined</li>
                        <li>Construction Debt Ratio - User defined</li>
                        <li>Interest Rate - User defined</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Last Updated</h3>
                      <p className="text-sm text-muted-foreground">March 15, 2024</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <SummaryCard proforma={proforma} />
        </div>
      </div>
    </div>
  )
}