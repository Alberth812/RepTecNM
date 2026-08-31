// Archivo de utilidad para prellenar datos del formulario de registro
export const getPrefillData = () => {
  return {};
};

export const urlToFile = async (url: string, filename: string, mimeType: string) => {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new File([buf], filename, { type: mimeType });
};
