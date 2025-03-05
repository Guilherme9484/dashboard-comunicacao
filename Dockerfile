# Dockerfile raiz - Redirecionamento para o Dockerfile dentro do subdiretório
# Este arquivo foi criado para compatibilidade com EasyPanel

# Use o mesmo Dockerfile do subdiretório dashboard-comunicacao
FROM nginx:alpine

# Copiar configuração personalizada do nginx
COPY dashboard-comunicacao/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar arquivos estáticos
COPY dashboard-comunicacao/index.html /usr/share/nginx/html/
COPY dashboard-comunicacao/assets/ /usr/share/nginx/html/assets/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
