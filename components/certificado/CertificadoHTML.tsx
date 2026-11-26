"use client";

interface CertificadoHTMLProps {
  data: {
    numeroAfiliado: string;
    nombreCompleto: string;
    instituto: string;
    programaPosgrado: string;
    anioAprobacion: number;
    fechaEmision: string;
    folio: string;
  };
}

export function CertificadoHTML({ data }: CertificadoHTMLProps) {
  return (
    <div 
      className="relative bg-white p-12 flex flex-col justify-between"
      style={{ 
        width: '210mm',
        height: '297mm',
        fontFamily: 'Georgia, "Times New Roman", serif',
        border: '8px double #004B87',
        padding: '40px'
      }}
    >
      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#C9A227]" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#C9A227]" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#C9A227]" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#C9A227]" />

      <div className="text-center mb-8">
        <img src="/logos/rep-tecnm.png" alt="Logo REP-TecNM" className="h-24 w-auto mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-[#004B87] uppercase tracking-widest mb-2">
          Certificado de Afiliación
        </h1>
        <p className="text-xl text-gray-600 italic">
          Red de Egresados de Posgrado del Tecnológico Nacional de México
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center text-center space-y-8 px-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          La Directiva de la <strong className="text-[#004B87]">Red de Egresados de Posgrado del TecNM (REP-TecNM)</strong> hace constar que:
        </p>

        <h2 className="text-5xl font-bold text-[#003366] uppercase tracking-wide border-b-2 border-[#C9A227] pb-4 inline-block mx-auto px-8">
          {data.nombreCompleto}
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed">
          Se encuentra registrado como <strong className="text-[#004B87]">MIEMBRO ACTIVO</strong> de esta asociación, 
          habiendo concluido satisfactoriamente sus estudios de:
        </p>

        <h3 className="text-2xl font-semibold text-[#003366] italic">
          {data.programaPosgrado}
        </h3>
        
        <p className="text-lg text-gray-700">
          en el <strong>{data.instituto}</strong>, obteniendo su título en el año <strong>{data.anioAprobacion}</strong>.
        </p>

        <p className="text-base text-gray-600 mt-8">
          Se expide el presente certificado a petición del interesado, para los fines que a su derecho convengan, 
          en la ciudad de México, a los {data.fechaEmision}.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-300">
        <div className="flex justify-between items-end">
          <div className="text-center">
            <div className="h-16 border-b border-gray-400 w-48 mb-2 mx-auto" />
            <p className="text-sm font-bold text-[#004B87]">Dirección General</p>
            <p className="text-xs text-gray-500">REP-TecNM</p>
          </div>

          <div className="text-center">
            <div className="h-16 border-b border-gray-400 w-48 mb-2 mx-auto" />
            <p className="text-sm font-bold text-[#004B87]">Secretaría de Afiliación</p>
            <p className="text-xs text-gray-500">REP-TecNM</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-gray-500 font-mono">
            Folio de validación: <span className="font-bold text-[#004B87]">{data.folio}</span> | 
            No. de Afiliado: <span className="font-bold text-[#004B87]">{data.numeroAfiliado}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Este documento puede ser verificado en www.reptecnm.org.mx/verificar
          </p>
        </div>
      </div>
    </div>
  );
}
