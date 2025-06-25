import { jsPDF } from 'jspdf';
import autoTable, { CellHookData, UserOptions } from 'jspdf-autotable';
import { Proforma, Project } from '@/lib/session-storage';
import { formatCurrency } from '@/lib/utils';

type TableCell = string | { content: string; colSpan?: number; styles?: { fontStyle?: 'bold' | 'normal'; halign?: 'left' | 'right' } };
type TableRow = TableCell[];

export function generateRevenueTable(doc: jsPDF, proforma: Proforma, project: Project | null, y: number): number {
  // Revenue Table Title (smaller, bold, closer)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue', 40, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  // Revenue Table (combined Units and Other Income)
  const revenueTableBody: TableRow[] = [];
  // Units subheader
  revenueTableBody.push([
    { content: 'Units', colSpan: 6, styles: { fontStyle: 'bold' as const, halign: 'left' as const } }
  ]);
  // Unit mix rows
  proforma.unitMix.forEach((unitType) => {
    revenueTableBody.push([
      unitType.name,
      String(unitType.units.length),
      unitType.units.length ? (unitType.units.reduce((sum, u) => sum + u.area, 0) / unitType.units.length).toFixed(2) : '0.00',
      unitType.units.length > 0 ? (unitType.units.reduce((sum, u) => sum + u.value, 0) / unitType.units.length).toFixed(2) : '0.00',
      unitType.units.length > 0 ? formatCurrency(unitType.units.reduce((sum, u) => sum + u.value, 0) / unitType.units.length) : formatCurrency(0),
      formatCurrency(unitType.units.reduce((sum, u) => sum + u.value, 0))
    ]);
  });
  // Units total row
  revenueTableBody.push([
    'Total',
    String(proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)),
    (proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.area, 0), 0) / (proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0) || 1)).toFixed(2),
    (proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.value, 0), 0) / (proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0) || 1)).toFixed(2),
    '',
    formatCurrency(proforma.unitMix.reduce((sum, ut) => sum + ut.units.reduce((s, u) => s + u.value, 0), 0))
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
      formatCurrency(item.valuePerUnit),
      formatCurrency(item.numberOfUnits * item.valuePerUnit)
    ]);
  });
  // Other income total row
  revenueTableBody.push([
    'Total',
    String(proforma.otherIncome.reduce((sum, i) => sum + i.numberOfUnits, 0)),
    '',
    '',
    '',
    formatCurrency(proforma.otherIncome.reduce((sum, i) => sum + (i.numberOfUnits * i.valuePerUnit), 0))
  ]);
  // Total Revenue row (bold, left label, right value)
  revenueTableBody.push([
    { content: 'Total Revenue', styles: { fontStyle: 'bold' as const, halign: 'left' as const } },
    '', '', '', '',
    { content: formatCurrency(proforma.totalRevenue || 0), styles: { fontStyle: 'bold' as const, halign: 'right' as const } }
  ]);
  autoTable(doc, {
    startY: y,
    head: [[
      '', 'Units', 'Avg SF', '$/SF', 'Avg Unit Value', 'Total'
    ]],
    body: revenueTableBody,
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
    didParseCell: function (data: CellHookData) {
      // Make subheaders and total revenue bold
      if (
        data.row.raw &&
        Array.isArray(data.row.raw) &&
        data.row.raw[0] &&
        typeof data.row.raw[0] === 'object' &&
        'styles' in data.row.raw[0] &&
        (data.row.raw[0] as { styles: { fontStyle?: string } }).styles &&
        (data.row.raw[0] as { styles: { fontStyle?: string } }).styles.fontStyle === 'bold'
      ) {
        data.cell.styles.fontStyle = 'bold';
      }
      if (
        data.row.raw &&
        Array.isArray(data.row.raw) &&
        data.row.raw[0] &&
        typeof data.row.raw[0] === 'object' &&
        'content' in data.row.raw[0] &&
        (data.row.raw[0] as { content: string }).content === 'Total Revenue'
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
          doc.line(tableLeftX, data.cell.y + (data.cell.height || 0), tableRightX, data.cell.y + (data.cell.height || 0));
        }
      }
    }
  } as UserOptions);
  return ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 18);
}