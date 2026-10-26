export type TemplateId = 'rep-tecnm-2024' | 'rep-tecnm-clean';

export interface CredentialTemplate {
  id: TemplateId;
  name: string;
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
  layout: 'solid' | 'clean';
  photoShape: 'circle' | 'rounded' | 'square';
}

// Plantilla 1: Estilo Sólido (Fondo azul, textos blancos, foto circular)
export const REP_TECNM_2024: CredentialTemplate = {
  id: 'rep-tecnm-2024',
  name: 'REP-TecNM Sólido 2024',
  colors: {
    background: '#004B87', // Azul institucional fuerte
    text: '#FFFFFF',
    textSecondary: '#E2E8F0',
    accent: '#C9A227', // Dorado
  },
  layout: 'solid',
  photoShape: 'circle',
};

// Plantilla 2: Estilo Limpio (Fondo blanco, textos oscuros, minimalista)
export const REP_TECNM_CLEAN: CredentialTemplate = {
  id: 'rep-tecnm-clean',
  name: 'REP-TecNM Limpio',
  colors: {
    background: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    accent: '#004B87',
  },
  layout: 'clean',
  photoShape: 'rounded',
};

export function getTemplate(id: TemplateId = 'rep-tecnm-2024'): CredentialTemplate {
  const templates: Record<TemplateId, CredentialTemplate> = {
    'rep-tecnm-2024': REP_TECNM_2024,
    'rep-tecnm-clean': REP_TECNM_CLEAN,
  };
  return templates[id] || REP_TECNM_2024;
}