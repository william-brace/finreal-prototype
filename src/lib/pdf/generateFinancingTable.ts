import { jsPDF } from 'jspdf';
import autoTable, { CellHookData, UserOptions } from 'jspdf-autotable';
import { Proforma, Project } from '@/lib/session-storage';
import { formatCurrency } from '@/lib/utils';

type TableCell = string | { content: string; colSpan?: number; styles?: { fontStyle?: 'bold' | 'normal'; halign?: 'left' | 'right' } };
type TableRow = TableCell[];

export function generateFinancingTable(doc: jsPDF, proforma: Proforma, project: Project | null, y: number): number {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Financing', 40, y);
  doc.setFont('helvetica', 'normal');
  y += 8;

  // Use values from session storage (proforma)
  const debtPct = proforma.sources.debtPct || 0;
  const equityPct = proforma.sources.equityPct || 0;
  const interestRate = proforma.sources.financingCosts.interestPct || 0;
  const brokerFeePct = proforma.sources.financingCosts.brokerFeePct || 0;
  const interestCost = proforma.sources.financingCosts.interestCost || 0;
  const brokerFee = proforma.sources.financingCosts.brokerFee || 0;
  const totalFinancing = proforma.sources.financingCosts.totalFinancingCost || 0;

  // These are placeholders for the /GBA, /Unit, % of Revenue columns
  // You may want to update these with real calculations if available in your data
  const constructionDebtGBA = '73.78';
  const constructionDebtUnit = '262,317';
  const constructionDebtPctRevenue = '55%';
  const interestCostGBA = '15.38';
  const interestCostUnit = '54,693';
  const interestCostPctRevenue = '11%';
  const brokerFeeGBA = '1.48';
  const brokerFeeUnit = '5,246';
  const brokerFeePctRevenue = '1%';
  const totalGBA = '16.86';
  const totalUnit = '59,939';
  const totalPctRevenue = '13%';

  const financingTableBody: TableRow[] = [
    [
      'Construction Debt',
      `${debtPct}%`,
      `${equityPct}%`,
      '', // Interest Rate (not shown for this row in image)
      constructionDebtGBA,
      constructionDebtUnit,
      constructionDebtPctRevenue,
      (proforma.totalExpenses ? formatCurrency(proforma.totalExpenses - totalFinancing) : formatCurrency(0))
    ],
    [
      'Interest Cost',
      '',
      '',
      `${interestRate.toFixed(2)}%`,
      interestCostGBA,
      interestCostUnit,
      interestCostPctRevenue,
      formatCurrency(interestCost)
    ],
    [
      'Broker Fee',
      '',
      '',
      brokerFeePct ? brokerFeePct.toFixed(2) + '%' : '',
      brokerFeeGBA,
      brokerFeeUnit,
      brokerFeePctRevenue,
      formatCurrency(brokerFee)
    ],
    [
      { content: 'Total', styles: { fontStyle: 'bold', halign: 'left' } },
      '',
      '',
      '',
      totalGBA,
      totalUnit,
      totalPctRevenue,
      formatCurrency(totalFinancing)
    ]
  ];

  autoTable(doc, {
    startY: y,
    head: [[
      '', 'Debt %', 'Equity %', 'Interest Rate', '/GBA', '/Unit', '% of Revenue', 'Total'
    ]],
    body: financingTableBody,
    theme: 'plain',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'right',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 }
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: { top: 1.5, bottom: 1.5 },
      halign: 'right',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
    margin: { left: 40, right: 40 },
    tableWidth: 'auto',
    didParseCell: function (data: CellHookData) {
      if (
        data.row.raw &&
        Array.isArray(data.row.raw) &&
        data.row.raw[0] &&
        typeof data.row.raw[0] === 'object' &&
        'styles' in data.row.raw[0] &&
        data.row.raw[0].styles &&
        (data.row.raw[0] as { styles: { fontStyle?: string } }).styles.fontStyle === 'bold'
      ) {
        data.cell.styles.fontStyle = 'bold';
      }
    },
    didDrawCell: function (data: CellHookData) {
      const doc = data.doc;
      const columns = data.table.columns;
      const leftCol = columns[0];
      const rightCol = columns[columns.length - 1];
      const hasXandWidth = (col: { x?: number; width?: number }): col is { x: number; width: number } =>
        col && typeof col.x === 'number' && typeof col.width === 'number';
      const tableLeftX = hasXandWidth(leftCol) ? leftCol.x : undefined;
      const tableRightX = hasXandWidth(rightCol) ? rightCol.x + rightCol.width : undefined;
      if (
        typeof tableLeftX === 'number' &&
        typeof tableRightX === 'number' &&
        typeof data.cell.y === 'number'
      ) {
        if (
          data.row.raw &&
          Array.isArray(data.row.raw) &&
          data.row.raw[0] &&
          typeof data.row.raw[0] === 'object' &&
          'content' in data.row.raw[0] &&
          (data.row.raw[0] as { content: string }).content === 'Total'
        ) {
          doc.setLineWidth(0.7);
          doc.line(tableLeftX, data.cell.y, tableRightX, data.cell.y);
        }
        if (data.cell.section === 'body' && data.row.index === data.table.body.length - 1 && data.column.index === 0) {
          doc.setLineWidth(0.7);
          doc.line(tableLeftX, data.cell.y + (data.cell.height || 0), tableRightX, data.cell.y + (data.cell.height || 0));
        }
      }
    }
  } as UserOptions);

  // Add the summary row
  y = ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Uses Incl. Financing', 40, y + 12);
  doc.text((proforma.totalProjectCostInclFinancing ? proforma.totalProjectCostInclFinancing.toLocaleString() : '0'), 520, y + 12, { align: 'right' });

  return y + 24;
}