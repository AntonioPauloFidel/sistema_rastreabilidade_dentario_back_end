FROM node:20-alpine AS build

WORKDIR /app

# Copia arquivos de dependências e o schema do Prisma (necessário pro postinstall gerar o client)
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Copia o resto do código e compila TypeScript -> JavaScript
COPY . .
RUN npm run build

# --- Estágio final: imagem mais leve, só com o necessário pra rodar ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm install --omit=dev

# Copia o código já compilado e o Prisma Client já gerado
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["node", "dist/server.js"]
