"use client";

import { User } from "lucide-react";
import type { CredentialTemplate } from "@/lib/credential-templates";

interface CredencialHTMLProps {
  template: CredentialTemplate;
  lado: 'frente' | 'reverso';
  data: {
    numeroAfiliado: string;
    nombreCompleto: string;
    instituto: string;
    anioAprobacion: number;
    folio: string;
    fotografiaUrl?: string;
    logoUrl?: string;
  };
  urlVerificacion?: string;
}

// Cenefa con símbolos de carreras del TecNM (SVG inline minimalista)
function CenefaCarreras() {
  const color = "#4A7FB5";
  const opacity = 0.35;
  const size = 14;
  
  return (
    <div className="w-full flex items-center justify-between px-1 py-1.5">
      {/* Línea superior */}
      <div className="absolute top-0 left-4 right-4 h-px" style={{ backgroundColor: color, opacity: 0.25 }} />
      
      {/* Íconos distribuidos uniformemente */}
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {/* Engranaje - Ingeniería */}
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
      
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {/* Átomo - Ciencias Químicas */}
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.5" fill={color} />
      </svg>
      
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {/* Integral - Matemáticas */}
        <path d="M14 4c-2 0-3 1-3 3v10c0 2 1 3 3 3M10 4c-2 0-3 1-3 3v10c0 2 1 3 3 3" />
      </svg>
      
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {/* Chip - Tecnología/Sistemas */}
        <rect x="6" y="6" width="12" height="12" rx="1" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
      </svg>
      
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {/* Libro - Educación/Administración */}
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z" />
      </svg>
      
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}>
        {/* Gráfica - Contaduría/Economía */}
        <path d="M3 3v18h18" />
        <path d="M7 16l4-6 4 4 5-7" />
      </svg>
      
      {/* Línea inferior */}
      <div className="absolute bottom-0 left-4 right-4 h-px" style={{ backgroundColor: color, opacity: 0.25 }} />
    </div>
  );
}

export function CredencialHTML({ template, lado, data, urlVerificacion }: CredencialHTMLProps) {
  return (
    <div 
      className="relative overflow-hidden"
      style={{ 
        width: '323px', 
        height: '204px',
        backgroundColor: '#FFFFFF',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {lado === 'frente' ? (
        // ==========================================
        // FRENTE - ESTILO SUIZO MINIMALISTA
        // ==========================================
        <div className="w-full h-full relative flex flex-col" style={{ padding: '16px' }}>
          
          {/* HEADER: Logo centrado */}
          <div className="flex justify-center items-center mb-6">
            {data.logoUrl && (
              <img 
                src={data.logoUrl} 
                alt="Logo" 
                className="h-9 w-auto object-contain"
              />
            )}
          </div>

          {/* CONTENIDO PRINCIPAL: Foto + Datos */}
          <div className="flex-1 flex items-start gap-5">
            
            {/* FOTO: Sin marco, solo borde sutil */}
            <div className="shrink-0">
              <div className="w-[52px] h-[65px] rounded overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5]">
                {data.fotografiaUrl ? (
                  <img 
                    src={data.fotografiaUrl} 
                    alt="Foto" 
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-[#999999]" />
                  </div>
                )}
              </div>
            </div>

            {/* DATOS */}
            <div className="flex-1 space-y-2">
              {/* Nombre */}
              <h2 
                className="font-bold uppercase leading-tight"
                style={{ 
                  color: '#1A1A1A',
                  fontSize: '12px',
                  letterSpacing: '0.3px'
                }}
              >
                {data.nombreCompleto}
              </h2>
              
              {/* Instituto */}
              <div>
                <p 
                  className="uppercase tracking-wide"
                  style={{ 
                    color: '#666666',
                    fontSize: '6px',
                    letterSpacing: '0.5px',
                    marginBottom: '2px'
                  }}
                >
                  Instituto
                </p>
                <p 
                  className="font-medium leading-tight"
                  style={{ 
                    color: '#333333',
                    fontSize: '8px'
                  }}
                >
                  {data.instituto}
                </p>
              </div>

              {/* CENEA DECORATIVA con símbolos de carreras del TecNM */}
              <div className="relative mt-3">
                <CenefaCarreras />
              </div>
            </div>
          </div>

          {/* FOOTER: Badge ACTIVO + Año */}
          <div className="flex items-center justify-between mt-auto pt-3">
            {/* Badge ACTIVO */}
            <div 
              className="px-2.5 py-0.5 rounded font-semibold uppercase tracking-wider"
              style={{ 
                backgroundColor: '#4A7FB5',
                color: '#FFFFFF',
                fontSize: '6px',
                letterSpacing: '0.8px'
              }}
            >
              ACTIVO
            </div>
            
            {/* Año */}
            <div className="text-right">
              <p 
                className="uppercase tracking-wide"
                style={{ 
                  color: '#999999',
                  fontSize: '6px',
                  letterSpacing: '0.5px',
                  marginBottom: '2px'
                }}
              >
                Año
              </p>
              <p 
                className="font-light"
                style={{ 
                  color: '#1A1A1A',
                  fontSize: '14px',
                  letterSpacing: '0.5px'
                }}
              >
                {data.anioAprobacion}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // REVERSO - ESTILO SUIZO MINIMALISTA
        // ==========================================
        <div className="w-full h-full relative flex flex-col" style={{ padding: '16px' }}>
          
          {/* HEADER */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p 
                className="font-bold uppercase tracking-widest"
                style={{ 
                  color: '#1A1A1A',
                  fontSize: '8px',
                  letterSpacing: '1.2px'
                }}
              >
                Credencial de Afiliado
              </p>
              <p 
                className="mt-0.5"
                style={{ 
                  color: '#999999',
                  fontSize: '7px'
                }}
              >
                REP-TecNM
              </p>
            </div>
            {data.logoUrl && (
              <img 
                src={data.logoUrl} 
                alt="Logo" 
                className="h-6 w-auto object-contain"
              />
            )}
          </div>

          {/* CONTENIDO: QR y datos */}
          <div className="flex-1 flex justify-between items-start gap-4">
            
            {/* QR */}
            {urlVerificacion && (
              <div className="flex flex-col items-center">
                <div className="p-2 bg-[#FAFAFA] rounded border border-[#E5E5E5]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(urlVerificacion)}`}
                    alt="QR Verificación"
                    className="w-[60px] h-[60px]"
                  />
                </div>
                <p 
                  className="text-center mt-1.5 leading-tight"
                  style={{ 
                    color: '#999999',
                    fontSize: '6px'
                  }}
                >
                  Escanea para<br/>verificar
                </p>
              </div>
            )}

            {/* DATOS */}
            <div className="flex-1 space-y-2">
              
              {/* Año de Aprobación */}
              <div 
                className="rounded px-2.5 py-1.5"
                style={{ 
                  backgroundColor: '#F0F4F8',
                  border: '1px solid #E5EAF0'
                }}
              >
                <p 
                  className="uppercase tracking-wide"
                  style={{ 
                    color: '#666666',
                    fontSize: '6px',
                    letterSpacing: '0.5px',
                    marginBottom: '2px'
                  }}
                >
                  Año de Aprobación
                </p>
                <p 
                  className="font-bold"
                  style={{ 
                    color: '#1A1A1A',
                    fontSize: '11px'
                  }}
                >
                  {data.anioAprobacion}
                </p>
              </div>
              
              {/* Folio de Verificación (único lugar donde aparece) */}
              <div 
                className="rounded px-2.5 py-1.5"
                style={{ 
                  backgroundColor: '#F0F4F8',
                  border: '1px solid #E5EAF0'
                }}
              >
                <p 
                  className="uppercase tracking-wide"
                  style={{ 
                    color: '#666666',
                    fontSize: '6px',
                    letterSpacing: '0.5px',
                    marginBottom: '2px'
                  }}
                >
                  Folio de Verificación
                </p>
                <p 
                  className="font-mono font-bold"
                  style={{ 
                    color: '#4A7FB5',
                    fontSize: '8px',
                    letterSpacing: '0.3px'
                  }}
                >
                  {data.folio}
                </p>
              </div>

              {/* Aviso Legal */}
              <div className="mt-3">
                <p 
                  className="leading-tight"
                  style={{ 
                    color: '#999999',
                    fontSize: '5.5px',
                    lineHeight: '1.4'
                  }}
                >
                  Esta credencial es propiedad de la Red de Egresados de Posgrado del TecNM.
                  Su uso es personal e intransferible.
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER: URL */}
          <div className="mt-auto pt-2 text-center">
            <p 
              className="font-medium tracking-wider"
              style={{ 
                color: '#4A7FB5',
                fontSize: '7px',
                letterSpacing: '0.8px'
              }}
            >
              www.reptecnm.org.mx
            </p>
          </div>
        </div>
      )}
    </div>
  );
}