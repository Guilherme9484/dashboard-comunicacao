# Dashboard de Comunicação

Um sistema completo de dashboard para gerenciamento de comunicação, agendamentos e contatos, com backend em Node.js e frontend em HTML, CSS e JavaScript.

## Estrutura do Projeto

```
Dashboard/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js        # Gerenciamento de autenticação
│       ├── calendar.js    # Funcionalidades do calendário
│       ├── config.js      # Configurações da aplicação
│       ├── contacts.js    # Gerenciamento de contatos
│       ├── dashboard.js   # Funcionalidades do dashboard
│       ├── messages.js    # Sistema de mensagens
│       ├── templates.js   # Geração de templates
│       └── ui.js          # Interface do usuário
├── backend/
│   ├── config/            # Configurações do servidor
│   ├── controllers/       # Controladores da API
│   ├── middleware/        # Middlewares do Express
│   ├── models/            # Modelos do MongoDB
│   ├── routes/            # Rotas da API
│   ├── .env               # Variáveis de ambiente (não versionado)
│   ├── Dockerfile         # Configuração de container para o backend
│   ├── package.json       # Dependências do Node.js
│   └── server.js          # Ponto de entrada do servidor
├── .gitignore             # Arquivos ignorados pelo Git
├── Dockerfile             # Configuração de container para o frontend
├── index.html             # Página principal do frontend
├── nginx.conf             # Configuração do Nginx para o frontend
└── README.md              # Este arquivo
```

## Funcionalidades

- **Autenticação**: Sistema de login com JWT
- **Dashboard**: Visualização de estatísticas e gráficos
- **Agendamentos**: Calendário de compromissos com sistema de filtros
- **Contatos**: Gerenciamento de contatos com busca e filtragem
- **Mensagens**: Sistema de envio e geração de templates de mensagens
- **Tema**: Suporte para modo claro/escuro
- **Responsivo**: Layout adaptado para dispositivos móveis

## Tecnologias Utilizadas

### Frontend
- HTML5 / CSS3 / JavaScript
- Bootstrap 5
- Chart.js para gráficos
- FullCalendar para o calendário
- SheetJS e jsPDF para exportação de dados

### Backend
- Node.js com Express
- MongoDB com Mongoose
- JWT para autenticação
- Bcrypt para criptografia de senhas

## Instalação e Execução

### Pré-requisitos
- Node.js (v14+)
- MongoDB
- Docker (opcional)

### Configuração Local

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/dashboard-comunicacao.git
   cd dashboard-comunicacao
   ```

2. **Configure o Backend**
   ```bash
   cd backend
   npm install
   # Crie um arquivo .env com as variáveis necessárias
   # Exemplo: PORT=3000 MONGODB_URI=mongodb://localhost:27017/dashboard JWT_SECRET=sua-chave-jwt
   npm start
   ```

3. **Execute o Frontend**
   ```bash
   # Em uma nova janela do terminal
   # Na raiz do projeto
   # Você pode usar qualquer servidor HTTP estático
   npx serve -s .
   ```

### Usando Docker

1. **Backend**
   ```bash
   cd backend
   docker build -t dashboard-backend .
   docker run -p 3000:3000 --env-file .env dashboard-backend
   ```

2. **Frontend**
   ```bash
   # Na raiz do projeto
   docker build -t dashboard-frontend .
   docker run -p 80:80 dashboard-frontend
   ```

## Implantação no EasyPanel

Este projeto está configurado para fácil implantação usando EasyPanel:

1. Vincule seu repositório GitHub ao EasyPanel
2. Configure dois serviços usando os Dockerfiles incluídos
3. Configure as variáveis de ambiente necessárias para o backend
4. Ative o domínio e SSL conforme necessário

## Contribuição

1. Faça um fork do projeto
2. Crie sua branch de recurso (`git checkout -b feature/nome-do-recurso`)
3. Faça commit das suas alterações (`git commit -am 'Adicionar novo recurso'`)
4. Faça push para a branch (`git push origin feature/nome-do-recurso`)
5. Crie um novo Pull Request

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
