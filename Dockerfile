# Usa uma imagem leve do Node.js
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código fonte
COPY . .

# Compila a aplicação (TypeScript -> JavaScript)
RUN npm run build

# Expõe a porta que a aplicação usa (padrão 5000, ajuste se necessário)
EXPOSE 5000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
