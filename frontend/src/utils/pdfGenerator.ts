import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Loan, LoanItem } from "../../types";

export const generateLoanPDF = (loan: Loan, type: 'ENTREGA' | 'DEVOLUCION') => {
  const doc = new jsPDF();
  const isDelivery = type === 'ENTREGA';
  // Actualizado a Verde Tuniche (basado en Tailwind green-600: #16a34a)
  const primaryColor = [22, 163, 74]; 

  // --- Header ---
  // Logo placeholder (Círculo verde)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.circle(25, 20, 10, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Tuniche Fruits", 40, 18);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text("Equipamiento IT", 40, 24);

  // --- Título ---
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  const title = isDelivery ? "PRÉSTAMO DE EQUIPOS DE INFORMÁTICA" : "DEVOLUCIÓN DE EQUIPOS DE INFORMÁTICA";
  doc.text(title, 105, 45, { align: "center" });

  // --- Texto Legal / Contexto ---
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const marginX = 14;
  let cursorY = 60;

  const empName = loan.employeeSnapshot.name.toUpperCase();
  const empRut = loan.employeeSnapshot.rut;
  const empShift = loan.employeeSnapshot.shift;
  const empArea = loan.employeeSnapshot.area.toUpperCase();
  const dateParts = loan.date.split('-'); // YYYY-MM-DD
  const dateFormatted = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

  const textLines = isDelivery 
    ? [
      `El departamento de informática con fecha ${dateFormatted}, entrega a ${empName} RUT:`,
      `${empRut} Labora en el turno ${empShift}, Perteneciente al área de ${empArea}. El detalle del`,
      `equipamiento a continuación.`,
      ``,
      `En caso de pérdida o reposición de equipo(s) el valor total es: $${loan.totalValue.toLocaleString()}`,
      ``,
      `Si el trabajador tenga terminada su relación laboral con Tuniche Fruits debe hacer entrega`,
      `de equipamiento entregado.`
    ] 
    : [
      `El departamento de informática con fecha ${new Date().toLocaleDateString('es-CL')}, recibe de ${empName} RUT:`,
      `${empRut} Labora en el turno ${empShift}, Perteneciente al área de ${empArea}. El detalle del`,
      `equipamiento devuelto a continuación.`,
      ``,
      `El equipo ha sido recibido y verificado por el departamento de informática.`,
      `La devolución del equipamiento queda registrada en el sistema.`
    ];

  doc.text(textLines, marginX, cursorY);
  cursorY += (textLines.length * 5) + 10;

  // --- Tabla de Equipos ---
  const tableBody = loan.items.map((item: LoanItem) => [
    item.equipmentSnapshot.serial,
    item.equipmentSnapshot.type,
    item.equipmentSnapshot.description || item.equipmentSnapshot.type,
    item.equipmentSnapshot.brand,
    item.equipmentSnapshot.model,
    item.quantity
  ]);

  autoTable(doc, {
    startY: cursorY,
    head: [['Serie', 'Equipo', 'Descripción', 'Marca', 'Modelo', 'Cantidad']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1, fontStyle: 'bold' },
    styles: { lineColor: [0, 0, 0], lineWidth: 0.1, fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      5: { cellWidth: 20, halign: 'center' }
    }
  });

  // Obtener la posición Y final de la tabla
  // @ts-ignore
  cursorY = doc.lastAutoTable.finalY + 15;

  // --- Observaciones ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Observación:", marginX, cursorY);
  cursorY += 5;

  doc.setLineWidth(0.5);
  doc.rect(marginX, cursorY, 180, 25);
  doc.setFont("helvetica", "normal");
  
  // Texto de observación por defecto
  const obsText = isDelivery ? "SE HACE ENTREGA DE EQUIPOS" : "EL EQUIPO SE ENCUENTRA EN BUEN ESTADO";
  doc.text(isDelivery && loan.observations ? loan.observations : obsText, marginX + 2, cursorY + 6);
  
  cursorY += 45;

  // --- Firma ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const signLabel = isDelivery ? "Firma del Receptor" : "Firma del Empleado (Devuelve)";
  doc.text(signLabel, 105, cursorY, { align: 'center' });
  
  cursorY += 5;
  // Caja firma
  doc.setLineWidth(0.1);
  doc.rect(65, cursorY, 80, 35);

  // Insertar imagen de firma si existe
  if (loan.signature) {
    doc.addImage(loan.signature, 'PNG', 70, cursorY + 2, 70, 30);
  }

  // Línea de firma
  doc.setLineWidth(0.5);
  doc.line(75, cursorY + 28, 135, cursorY + 28);

  cursorY += 45;

  // --- Footer Generado Por ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const generatorName = loan.generatedBy.toUpperCase();
  const receiverName = "JEREMY MUÑOZ"; // Ejemplo estático o dinámico según se requiera
  const footerText = isDelivery ? `Cargo Generado Por: ${generatorName}` : `Recibido Por: ${receiverName}`;
  doc.text(footerText, marginX, cursorY);

  // Guardar PDF
  const filename = `${type}_${loan.id.slice(0, 6)}.pdf`;
  doc.save(filename);
};