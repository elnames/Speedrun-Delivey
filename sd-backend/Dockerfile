# Usa una imagen de Node ligera
FROM node:20-slim

# Crea el directorio de trabajo
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Genera el cliente de Prisma (si lo usas, vi una carpeta prisma en tu ls)
RUN npx prisma generate

# Compila el proyecto
RUN npm run build

# Expone el puerto interno
EXPOSE 3001

# Comando para arrancar
CMD ["npm", "run", "start:prod"]