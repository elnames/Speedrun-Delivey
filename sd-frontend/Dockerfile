FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Compila para producción
RUN npm run build

# Usaremos un servidor ligero para servir los archivos estáticos
RUN npm install -g serve
EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]