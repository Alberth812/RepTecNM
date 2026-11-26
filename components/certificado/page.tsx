"use client";

import { useEffect, useState, useRef } from "react";
import { Download, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { CertificadoHTML } from "@/components/certificado/CertificadoHTML";

interface CertificadoData {
  numeroAfiliado: string;
  folio: string;
  nombreCompleto: string;
  instituto: string;
  programaPosgrado: string;
  anioAprobacion: number;
}

export default function CertificadoPage() {
  const [data, setData] = useState<CertificadoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const certificadoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/afiliado/credencial", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar la información");
        return res.json();
      })
      .then((info) => {
        // Simulamos el programa de posgrado (puedes ajustarlo para que venga de la BD)
        setData({
          numeroAfiliado: info.numeroAfiliado,
          folio: info.folio,
          nombreCompleto: info.nombreCompleto,
          instituto: info.instituto,
          programaPosgrado: "Maestría en Ciencias de la Computación", // Ajustar según datos reales
          anioAprobacion: info.anioAprobacion,
        });
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        setLoading(false);
      });
  }, []);

  const descargarCertificado = async () => {
    if (!data || !certificadoRef.current) return;
    setGenerando(true);
    
    try {
      toast.info("Generando certificado en alta resolución...");
      
      // Capturar el HTML como imagen (A4 a 96 DPI es aprox 794 x 1123 px, usamos scale 2 para calidad)
      const dataUrl = await toPng(certificadoRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        style: { transform: "none", transformOrigin: "top left" },
      });

      // Crear PDF en tamaño A4 vertical
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Agregar imagen al PDF (A4: 210mm x 297mm)
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      
      const nombreArchivo = `Certificado_Afiliacion_${data.numeroAfiliado}.pdf`;
      pdf.save(nombreArchivo);
      
      toast.success("Certificado descargado correctamente");
    } catch (error) {
      console.error("Error generando PDF:", error);
      toast.error("Error al generar el certificado");
    } finally {
      setGenerando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Cargando información del certificado...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-yellow-500" />
            <h2 className="text-xl font-semibold">Información no disponible</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Debes tener una afiliación activa para generar este certificado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fechaEmision = new Date().toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#004B87] flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Certificado de Afiliación
        </h1>
        <p className="mt-2 text-muted-foreground">
          Descarga tu certificado oficial que avala tu membresía activa en la REP-TecNM.
        </p>
      </div>

      {/* Botón de descarga */}
      <div className="mb-6 flex justify-end">
        <Button onClick={descargarCertificado} disabled={generando} className="bg-[#004B87] hover:bg-[#003a6b]">
          <Download className="mr-2 h-4 w-4" />
          {generando ? "Generando PDF..." : "Descargar Certificado (PDF)"}
        </Button>
      </div>

      {/* Vista previa del certificado (Escalada para que quepa en pantalla) */}
      <Card className="overflow-hidden border-2 border-[#004B87]/20 shadow-xl">
        <CardContent className="p-0 bg-gray-100 flex justify-center overflow-auto max-h-[80vh]">
          <div className="scale-[0.45] origin-top my-[-30%]"> {/* Escala para vista previa en pantalla */}
            <CertificadoHTML 
              data={{
                ...data,
                fechaEmision,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contenedor oculto para la generación real en alta resolución */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <div ref={certificadoRef}>
          <CertificadoHTML 
            data={{
              ...data,
              fechaEmision,
            }}
          />
        </div>
      </div>
    </div>
  );
}