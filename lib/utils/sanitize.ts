/**
 * Sanitización de texto para prevenir XSS
 * Elimina tags HTML y caracteres peligrosos
 */

export function sanitizeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidFolioFormat(folio: string): boolean {
  // Formato: REP-YYYY-NNNNNN (15 caracteres)
  const regex = /^REP-\d{4}-\d{6}$/;
  return regex.test(folio);
}
