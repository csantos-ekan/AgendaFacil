# Estágio 1: Build do React
FROM node:20-alpine AS build-stage
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
#RUN npm install
RUN npm install --no-audit --progress=false
COPY . .
RUN npm run build

# Estágio 2: Servindo com Nginx (Leve e rápido)
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
