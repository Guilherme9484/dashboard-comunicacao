# Dockerfile para o backend - Redirecionamento para o Dockerfile dentro do subdiretório
# Este arquivo foi criado para compatibilidade com EasyPanel

FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY dashboard-comunicacao/backend/package*.json ./

# Instalar dependências
RUN npm install

# Copiar o código da aplicação
COPY dashboard-comunicacao/backend/ ./

# Expor a porta que o app usa
EXPOSE 3000

# Iniciar a aplicação
CMD ["npm", "start"]
