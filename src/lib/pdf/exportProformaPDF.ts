import { jsPDF } from 'jspdf';
import { Proforma, Project } from '@/lib/session-storage';
import { generateRevenueTable } from './generateRevenueTable';
import { generateUsesTable } from './generateUsesTable';
import { generateFinancingTable } from './generateFinancingTable';

export function exportProformaPDF(proforma: Proforma, project: Project | null) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 40;
  // Header Section (copy your header code here if needed)
  doc.setFontSize(18);
  doc.text(proforma.name || '[Property Name]', 40, y);
  doc.setFontSize(10);
  y += 20;
  doc.text(project?.proformaType ? 
    (project.proformaType === 'condo' ? 'Condominium Development Proforma' : 
     project.proformaType === 'purpose-built-rental' ? 'Purpose Built Rental Proforma' :
     project.proformaType === 'land-development' ? 'Land Development Proforma' :
     `${project.proformaType} Proforma`) 
    : '[Proforma Type]', 40, y);
  doc.text(`Date (${new Date().toLocaleDateString()})`, 40, y + 15);
  // Logo placeholder
  doc.setFillColor(235, 235, 235);
  doc.rect(420, 20, 120, 50, 'F');
  doc.setTextColor(100);
  doc.text('[USER LOGO]', 480, 50, { align: 'center' });
  y += 40;
  // Property image placeholder
  doc.setFillColor(235, 235, 235);
  doc.rect(40, y, 500, 100, 'F');
  doc.setTextColor(120);
  doc.setFontSize(12);
  doc.text('[INSERT IMAGE OF PROPERTY]', 290, y + 55, { align: 'center' });
  y += 120;
  doc.setTextColor(0);
  doc.setFontSize(10);
  // Property Description, GBA, Project Length
  doc.text('[Property Description]', 40, y);
  doc.text('GBA: ' + (typeof proforma.gba === 'number' ? proforma.gba.toLocaleString() : ''), 420, Number(y));
  y += 15;
  doc.text('Project Length (months): ' + (typeof proforma.projectLength === 'number' ? proforma.projectLength.toString() : ''), 420, Number(y));
  y += 20;
  // Proforma Summary Title
  doc.setFontSize(14);
  doc.text('Proforma Summary', 40, y);
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(40, y, 555, y);
  y += 18;
  // Revenue Table
  y = generateRevenueTable(doc, proforma, project, y);
  // Uses Table
  y = generateUsesTable(doc, proforma, project, y);
  // Financing Table
  y = generateFinancingTable(doc, proforma, project, y);
  // (Add more tables as needed)
  // Save PDF
  doc.save(`${proforma.name || 'proforma'}.pdf`);
} 