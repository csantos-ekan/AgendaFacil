FROM node:20-alpine

# 1. Instala dependências nativas necessárias para compilar pacotes Node
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

ENV NODE_OPTIONS="--max-old-space-size=450"

COPY package*.json ./

# 2. Tente usar o clean install para garantir um build limpo
#RUN npm install
RUN npm ci --maxsockets 1 --no-audit --progress=false
COPY . .

# 3. Garanta que o build do TS funcione
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
