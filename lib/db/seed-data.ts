// @/lib/registro/seed-data.ts
//
// Listas fijas de nombres y apellidos, usadas únicamente por el seeder de
// afiliados (@/lib/db/seed/seed-afiliados.ts) para generar nombres
// aleatorios.
//
// Los valores son exactamente los que diste. La única corrección aplicada
// fue agregar la coma faltante entre "Chávez" y "Quintana" en el arreglo de
// apellidos: tal como lo pegaste, dos strings quedaban pegados sin coma
// (`"Chávez"\n  "Quintana"`), lo cual no es un arreglo de TypeScript válido
// (error de sintaxis "Unexpected string"). No se modificó, quitó ni agregó
// ningún valor.

export const nombres = [
  "Julian",
  "Julio",
  "Gael",
  "Rufino",
  "Claudio",
  "Cynthia",
  "Nuno",
  "Carlos",
  "Samanta",
  "Samantha",
  "Julieta",
  "Monica",
  "Jorge",
  "Jorgin",
  "Jael",
  "Rufina",
  "Ana",
  "Alex",
  "Alejandro",
  "Samara",
  "Oscar",
  "Pedro",
  "Diana",
  "Hilario",
  "Fabricio",
] as const;

export const apellidos = [
  "Arizmendi",
  "Balam",
  "Castañeda",
  "Delgadillo",
  "Echeverría",
  "Escamilla",
  "Figueroa",
  "Galarza",
  "Ibarra",
  "Iturbide",
  "Ledesma",
  "Montalvo",
  "Montemayor",
  "Nájera",
  "Ocampo",
  "Olivares",
  "Chávez",
  "Quintana",
  "Salvatierra",
  "Santillán",
  "Talamantes",
  "Valdivia",
  "Villaseñor",
  "Zambrano",
] as const;
