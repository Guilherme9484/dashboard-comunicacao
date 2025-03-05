FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o código da aplicação
COPY . .

# Expor a porta que o app usa
EXPOSE 3000

# Iniciar a aplicação
CMD ["npm", "start"]
