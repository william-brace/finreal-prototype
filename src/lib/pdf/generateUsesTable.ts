import { jsPDF } from 'jspdf';
import autoTable, { CellHookData, UserOptions } from 'jspdf-autotable';
import { Proforma, Project } from '@/lib/session-storage';

type TableCell = string | { content: string; colSpan?: number; styles?: { fontStyle?: 'bold' | 'normal'; halign?: 'left' | 'right' } };
type TableRow = TableCell[];

export function generateUsesTable(doc: jsPDF, proforma: Proforma, project: Project | null, y: number): number {
  // Uses Table Title (smaller, bold, closer)
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Uses', 40, y);
  doc.setFont('helvetica', 'normal');
  y += 8;
  // Uses Table Body
  const usesTableBody: TableRow[] = [];
  // Land Costs Section
  usesTableBody.push([
    { content: 'Land Costs', colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }
  ]);
  usesTableBody.push([
    'Land Costs',
    typeof proforma.gba === 'number' && proforma.gba > 0 ? (proforma.uses.landCosts.baseCost / proforma.gba).toFixed(2) : '',
    proforma.unitMix.length > 0 ? (proforma.uses.landCosts.baseCost / proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)).toLocaleString() : '',
    proforma.totalRevenue > 0 ? Math.round((proforma.uses.landCosts.baseCost / proforma.totalRevenue) * 100) + '%' : '',
    typeof proforma.uses.landCosts.baseCost === 'number' ? proforma.uses.landCosts.baseCost.toLocaleString() : '0'
  ]);
  usesTableBody.push([
    { content: 'Closing Costs', styles: { fontStyle: 'normal', halign: 'left' } },
    proforma.uses.landCosts.closingCost > 0 ? '2.5%' : '',
    '', '',
    typeof proforma.uses.landCosts.closingCost === 'number' ? proforma.uses.landCosts.closingCost.toLocaleString() : '0'
  ]);
  usesTableBody.push([
    { content: 'Total', styles: { fontStyle: 'bold', halign: 'left' } }, '', '', '',
    ((proforma.uses.landCosts.baseCost || 0) + (proforma.uses.landCosts.closingCost || 0)).toLocaleString()
  ]);
  // Hard Costs Section
  usesTableBody.push([
    { content: 'Hard Costs', colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }
  ]);
  usesTableBody.push([
    'Construction Costs',
    typeof proforma.gba === 'number' && proforma.gba > 0 ? (proforma.uses.hardCosts.baseCost / proforma.gba).toFixed(2) : '',
    proforma.unitMix.length > 0 ? (proforma.uses.hardCosts.baseCost / proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)).toLocaleString() : '',
    proforma.totalRevenue > 0 ? Math.round((proforma.uses.hardCosts.baseCost / proforma.totalRevenue) * 100) + '%' : '',
    typeof proforma.uses.hardCosts.baseCost === 'number' ? proforma.uses.hardCosts.baseCost.toLocaleString() : '0'
  ]);
  // Insert dynamic hard costs rows
  if (proforma.uses.hardCosts.additionalCosts && proforma.uses.hardCosts.additionalCosts.length > 0) {
    proforma.uses.hardCosts.additionalCosts.forEach(cost => {
      usesTableBody.push([
        cost.name || '', '', '', '', '',
        typeof cost.amount === 'number' ? cost.amount.toLocaleString() : '0'
      ]);
    });
  }
  usesTableBody.push([
    { content: 'Contingency', styles: { fontStyle: 'normal', halign: 'left' } },
    proforma.uses.hardCosts.contingencyPct > 0 ? proforma.uses.hardCosts.contingencyPct + '%' : '',
    '', '',
    typeof proforma.uses.hardCosts.baseCost === 'number' ? (proforma.uses.hardCosts.baseCost * (proforma.uses.hardCosts.contingencyPct / 100)).toLocaleString() : '0'
  ]);
  usesTableBody.push([
    { content: 'Total', styles: { fontStyle: 'bold', halign: 'left' } }, '', '', '',
    ((proforma.uses.hardCosts.baseCost || 0) + (proforma.uses.hardCosts.baseCost * (proforma.uses.hardCosts.contingencyPct / 100) || 0)).toLocaleString()
  ]);
  // Soft Costs Section
  usesTableBody.push([
    { content: 'Soft Costs', colSpan: 5, styles: { fontStyle: 'bold', halign: 'left' } }
  ]);
  usesTableBody.push([
    'Development',
    typeof proforma.gba === 'number' && proforma.gba > 0 ? (proforma.uses.softCosts.development / proforma.gba).toFixed(2) : '',
    proforma.unitMix.length > 0 ? (proforma.uses.softCosts.development / proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)).toLocaleString() : '',
    proforma.totalRevenue > 0 ? Math.round((proforma.uses.softCosts.development / proforma.totalRevenue) * 100) + '%' : '',
    typeof proforma.uses.softCosts.development === 'number' ? proforma.uses.softCosts.development.toLocaleString() : '0'
  ]);
  usesTableBody.push([
    'Consultants',
    typeof proforma.gba === 'number' && proforma.gba > 0 ? (proforma.uses.softCosts.consultants / proforma.gba).toFixed(2) : '',
    proforma.unitMix.length > 0 ? (proforma.uses.softCosts.consultants / proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)).toLocaleString() : '',
    proforma.totalRevenue > 0 ? Math.round((proforma.uses.softCosts.consultants / proforma.totalRevenue) * 100) + '%' : '',
    typeof proforma.uses.softCosts.consultants === 'number' ? proforma.uses.softCosts.consultants.toLocaleString() : '0'
  ]);
  usesTableBody.push([
    'Admin & Marketing',
    typeof proforma.gba === 'number' && proforma.gba > 0 ? (proforma.uses.softCosts.adminMarketing / proforma.gba).toFixed(2) : '',
    proforma.unitMix.length > 0 ? (proforma.uses.softCosts.adminMarketing / proforma.unitMix.reduce((sum, ut) => sum + ut.units.length, 0)).toLocaleString() : '',
    proforma.totalRevenue > 0 ? Math.round((proforma.uses.softCosts.adminMarketing / proforma.totalRevenue) * 100) + '%' : '',
    typeof proforma.uses.softCosts.adminMarketing === 'number' ? proforma.uses.softCosts.adminMarketing.toLocaleString() : '0'
  ]);
  usesTableBody.push([
    { content: 'Soft Cost Contingency', styles: { fontStyle: 'normal', halign: 'left' } },
    proforma.uses.softCosts.contingencyPct > 0 ? proforma.uses.softCosts.contingencyPct + '%' : '',
    '', '',
    typeof proforma.uses.softCosts.development === 'number' ? (proforma.uses.softCosts.development * (proforma.uses.softCosts.contingencyPct / 100)).toLocaleString() : '0'
  ]);
  usesTableBody.push([
    { content: 'Total', styles: { fontStyle: 'bold', halign: 'left' } }, '', '', '',
    ((proforma.uses.softCosts.development || 0) + (proforma.uses.softCosts.consultants || 0) + (proforma.uses.softCosts.adminMarketing || 0) + (proforma.uses.softCosts.development * (proforma.uses.softCosts.contingencyPct / 100) || 0)).toLocaleString()
  ]);
  // Grand Total
  usesTableBody.push([
    { content: 'Total Uses Excl. Financing', styles: { fontStyle: 'bold', halign: 'left' } }, '', '', '',
    typeof proforma.totalExpenses === 'number' ? proforma.totalExpenses.toLocaleString() : '0'
  ]);
  // Uses Table
  autoTable(doc, {
    startY: y,
    head: [['', '/GBA', '/Unit', '% of Revenue', 'Total']],
    body: usesTableBody,
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
    },
    margin: { left: 40, right: 40 },
    tableWidth: 'auto',
    didParseCell: function (data: CellHookData) {
      // Make section headers and totals bold
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
      // Draw horizontal lines above totals and at the bottom
      if (
        typeof tableLeftX === 'number' &&
        typeof tableRightX === 'number' &&
        typeof data.cell.y === 'number'
      ) {
        // Above section totals
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