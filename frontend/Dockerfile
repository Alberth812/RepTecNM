# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Next.js
EXPOSE 3000

# Comando para iniciar el servidor de desarrollo
CMD ["npm", "run", "dev"]
