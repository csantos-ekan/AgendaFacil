# Estágio 1: Build do React
FROM node:20-alpine AS build-stage
RUN apk add --no-cache python3 make g++
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=450"
COPY package*.json ./
#RUN npm install
RUN npm ci --maxsockets 1 --no-audit --progress=false
COPY . .
RUN npm run build

# Estágio 2: Servindo com Nginx (Leve e rápido)
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["npm", "run", "start"]
