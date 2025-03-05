const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Importação das rotas
const authRoutes = require('./routes/auth.routes');
const agendamentoRoutes = require('./routes/agendamento.routes');
const contatoRoutes = require('./routes/contato.routes');
const mensagemRoutes = require('./routes/mensagem.routes');

// Inicializa o Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Configuração do MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dashboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
    retryWrites: true,
    w: 'majority'
})
.then(() => console.log('MongoDB conectado com sucesso'))
.catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    console.log('String de conexão utilizada:', process.env.MONGODB_URI ? 'Usando variável de ambiente' : 'Usando fallback local');
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/agendamento', agendamentoRoutes);
app.use('/api/contato', contatoRoutes);
app.use('/api/mensagem', mensagemRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor!' });
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
