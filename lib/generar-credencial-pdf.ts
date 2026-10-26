import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function generarCredencialPDF(credencial: any, logoUrl: string, fotoUrl?: string) {
  // 1. Crear documento PDF
  const pdfDoc = await PDFDocument.create();
  
  // 2. Incrustar fuentes estándar (Helvética es nativa y profesional)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // 3. Cargar el logo (asumimos PNG por ser el estándar web)
  const logoBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
  const logoImage = await pdfDoc.embedPng(logoBytes);
  
  // 4. Cargar la foto del afiliado (intentar PNG, si falla, intentar JPG)
  let fotoImage: any = null;
  if (fotoUrl) {
    try {
      const fotoBytes = await fetch(fotoUrl).then(res => res.arrayBuffer());
      try {
        fotoImage = await pdfDoc.embedPng(fotoBytes);
      } catch {
        fotoImage = await pdfDoc.embedJpg(fotoBytes);
      }
    } catch (e) {
      console.warn("No se pudo cargar la foto del afiliado", e);
    }
  }

  // 5. Generar QR en base64 y cargarlo
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;
  const qrDataUrl = await QRCode.toDataURL(`${baseUrl}/verificar/${credencial.folio}`, { width: 200, margin: 1 });
  const qrBytes = await fetch(qrDataUrl).then(res => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrBytes);

  // Dimensiones estándar ID-1 Vertical (5.40cm x 8.56cm ≈ 153pt x 243pt)
  const WIDTH = 153;
  const HEIGHT = 243;

  // Colores institucionales en formato RGB (0-1)
  const C_AZUL = rgb(0 / 255, 75 / 255, 135 / 255);      // #004B87
  const C_AZUL_OSCURO = rgb(0 / 255, 51 / 255, 102 / 255); // #003366
  const C_DORADO = rgb(201 / 255, 162 / 255, 39 / 255);    // #C9A227
  const C_BLANCO = rgb(1, 1, 1);
  const C_GRIS_CLARO = rgb(0.97, 0.98, 0.99);
  const C_GRIS_TEXTO = rgb(0.4, 0.4, 0.4);

  // ==========================================
  // PÁGINA 1: FRENTE
  // ==========================================
  const page1 = pdfDoc.addPage([WIDTH, HEIGHT]);

  // Fondo blanco
  page1.drawRectangle({ x: 0, y: 0, width: WIDTH, height: HEIGHT, color: C_BLANCO });

  // Franja azul superior (simula curva con rectángulo limpio)
  page1.drawRectangle({ x: 0, y: HEIGHT - 45, width: WIDTH, height: 45, color: C_AZUL });

  // Logo centrado en la franja (escala ajustada para que se vea completo)
  const logoDims = logoImage.scale(0.18); 
  page1.drawImage(logoImage, {
    x: (WIDTH - logoDims.width) / 2,
    y: HEIGHT - 40,
    width: logoDims.width,
    height: logoDims.height,
  });

  // Badge "ACTIVO" (Dorado, sin icono, esquina superior derecha)
  page1.drawRectangle({ x: WIDTH - 48, y: HEIGHT - 18, width: 42, height: 14, color: C_DORADO });
  page1.drawText('ACTIVO', {
    x: WIDTH - 38, y: HEIGHT - 15, font: helveticaBold, size: 7, color: C_BLANCO,
  });

  // Foto con marco dorado
  const photoX = (WIDTH - 52) / 2;
  const photoY = HEIGHT - 105;
  if (fotoImage) {
    page1.drawImage(fotoImage, { x: photoX + 2, y: photoY + 2, width: 48, height: 64 });
  } else {
    page1.drawRectangle({ x: photoX + 2, y: photoY + 2, width: 48, height: 64, color: C_GRIS_CLARO });
    page1.drawText('Sin foto', { x: photoX + 12, y: photoY + 35, font: helvetica, size: 6, color: C_GRIS_TEXTO });
  }
  // Marco dorado
  page1.drawRectangle({
    x: photoX, y: photoY, width: 52, height: 68,
    borderColor: C_DORADO, borderWidth: 2,
  });

  // Nombre del afiliado (Jerarquía principal)
  page1.drawText(credencial.nombreCompleto, {
    x: WIDTH / 2, y: photoY - 15,
    font: helveticaBold, size: 11, color: C_AZUL_OSCURO, align: 'center',
  });

  // Campos de información
  let currentY = photoY - 40;
  const drawField = (label: string, value: string) => {
    page1.drawText(label, { x: 10, y: currentY, font: helvetica, size: 5, color: C_GRIS_TEXTO });
    page1.drawText(value, { x: 10, y: currentY - 8, font: helveticaBold, size: 8, color: rgb(0.1, 0.1, 0.1) });
    page1.drawLine({ start: { x: 10, y: currentY - 14 }, end: { x: WIDTH - 10, y: currentY - 14 }, color: rgb(0.9, 0.9, 0.9), thickness: 0.5 });
    currentY -= 22;
  };

  drawField('INSTITUTO / UNIDAD', credencial.instituto);
  drawField('AÑO DE APROBACIÓN', credencial.anioAprobacion.toString());

  // Caja destacada para Número de Afiliado
  page1.drawRectangle({ x: 10, y: currentY - 5, width: WIDTH - 20, height: 22, color: C_GRIS_CLARO });
  page1.drawLine({ start: { x: 10, y: currentY - 5 }, end: { x: 10, y: currentY + 17 }, color: C_AZUL, thickness: 3 });
  page1.drawText('NO. DE AFILIADO', { x: 18, y: currentY + 8, font: helvetica, size: 5, color: C_AZUL });
  page1.drawText(credencial.numeroAfiliado, { x: 18, y: currentY - 2, font: helveticaBold, size: 10, color: C_AZUL_OSCURO });

  // Footer con folio
  page1.drawText(`Folio: ${credencial.folio}`, {
    x: WIDTH / 2, y: 10, font: helvetica, size: 6, color: C_GRIS_TEXTO, align: 'center',
  });

  // ==========================================
  // PÁGINA 2: REVERSO
  // ==========================================
  const page2 = pdfDoc.addPage([WIDTH, HEIGHT]);
  
  // Fondo azul institucional completo
  page2.drawRectangle({ x: 0, y: 0, width: WIDTH, height: HEIGHT, color: C_AZUL });

  // Título
  page2.drawText('VERIFICAR AUTENTICIDAD', {
    x: WIDTH / 2, y: HEIGHT - 30, font: helveticaBold, size: 8, color: C_BLANCO, align: 'center',
  });
  page2.drawText('Escanea el código QR o visita:', {
    x: WIDTH / 2, y: HEIGHT - 45, font: helvetica, size: 6, color: rgb(0.9, 0.9, 0.9), align: 'center',
  });

  // Caja blanca para el QR
  page2.drawRectangle({ x: (WIDTH - 72) / 2, y: HEIGHT - 130, width: 72, height: 72, color: C_BLANCO });
  page2.drawImage(qrImage, { x: (WIDTH - 66) / 2, y: HEIGHT - 127, width: 66, height: 66 });

  // Folio grande en dorado
  page2.drawText(`FOLIO: ${credencial.folio}`, {
    x: WIDTH / 2, y: HEIGHT - 155, font: helveticaBold, size: 9, color: C_DORADO, align: 'center',
  });

  // Aviso legal (dividido en líneas para que quepa)
  const legalText = "Esta credencial es propiedad de la Red de Egresados de Posgrado del TecNM (REP-TecNM). Su uso es personal e intransferible. En caso de extravío, repórtelo inmediatamente. La información de afiliación se valida en tiempo real a través del código QR.";
  const words = legalText.split(' ');
  let line = '';
  let legalY = 65;
  for (const word of words) {
    const testLine = line + word + ' ';
    if (helvetica.widthOfTextAtSize(testLine, 5) > WIDTH - 20) {
      page2.drawText(line, { x: 10, y: legalY, font: helvetica, size: 5, color: rgb(0.9, 0.9, 0.9) });
      line = word + ' ';
      legalY -= 8;
    } else {
      line = testLine;
    }
  }
  page2.drawText(line, { x: 10, y: legalY, font: helvetica, size: 5, color: rgb(0.9, 0.9, 0.9) });

  // URL institucional al pie
  page2.drawText('www.reptecnm.org.mx', {
    x: WIDTH / 2, y: 15, font: helveticaBold, size: 6, color: C_DORADO, align: 'center',
  });

  // 6. Guardar y descargar
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `credencial-${credencial.numeroAfiliado}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
