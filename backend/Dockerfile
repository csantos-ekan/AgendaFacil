FROM node:20-alpine

# 1. Instala dependências nativas necessárias para compilar pacotes Node
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

# 2. Tente usar o clean install para garantir um build limpo
RUN npm install

COPY . .

# 3. Garanta que o build do TS funcione
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
