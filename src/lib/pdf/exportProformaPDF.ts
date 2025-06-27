import { jsPDF } from 'jspdf';
import { Proforma, Project } from '@/lib/session-storage';
import { generateRevenueTable } from './generateRevenueTable';
import { generateUsesTable } from './generateUsesTable';
import { generateFinancingTable } from './generateFinancingTable';

// Helper to load image as data URL and invert colors
async function getImageDataUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');
      ctx.drawImage(img, 0, 0);
      // Invert colors
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // Alpha (data[i + 3]) stays the same
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function exportProformaPDF(proforma: Proforma, project: Project | null) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 40;
  // Header Section (copy your header code here if needed)
  doc.setFontSize(18);
  doc.text(proforma.name || '[Property Name]', 40, y);
  doc.setFontSize(10);
  y += 20;
  doc.text(proforma.proformaType ? 
    (proforma.proformaType === 'condo' ? 'Condominium Development Proforma' : 
     proforma.proformaType === 'purpose-built-rental' ? 'Purpose Built Rental Proforma' :
     proforma.proformaType === 'land-development' ? 'Land Development Proforma' :
     `${proforma.proformaType} Proforma`) 
    : '[Proforma Type]', 40, y);
  const today = new Date();
  const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;
  doc.text(formattedDate, 40, y + 15);
  // Logo image
  const logoDataUrl = await getImageDataUrl('/elevate_living_logo.jpg');
  doc.addImage(logoDataUrl, 'JPEG', 420, 20, 120, 50);
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