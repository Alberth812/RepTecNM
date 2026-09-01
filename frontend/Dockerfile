# frontend/Dockerfile
FROM node:20-alpine

# Habilitar corepack para usar pnpm nativamente en Node 20
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copiar solo los archivos de dependencias de pnpm primero (para aprovechar la caché de Docker)
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias con pnpm
RUN pnpm install --frozen-lockfile

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto de Next.js
EXPOSE 3000

# Comando para iniciar el servidor de desarrollo
CMD ["pnpm", "run", "dev"]
