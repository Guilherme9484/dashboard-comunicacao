const express = require('express');
const router = express.Router();
const mensagemController = require('../controllers/mensagem.controller');
const { verifyToken, validateFields } = require('../middleware/auth.middleware');

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Criar mensagem/template
router.post('/',
    validateFields(['texto', 'tipo']),
    mensagemController.create
);

// Listar mensagens/templates
router.get('/', mensagemController.list);

// Gerar template com IA
router.post('/generate',
    validateFields(['descricao']),
    mensagemController.generateTemplate
);

// Enviar mensagem para contatos
router.post('/send',
    validateFields(['mensagemId', 'contatosIds']),
    mensagemController.send
);

// Obter histórico de mensagens
router.get('/history', mensagemController.getHistory);

// Obter mensagem por ID
router.get('/:id', mensagemController.getById);

// Atualizar mensagem
router.put('/:id',
    validateFields(['texto']),
    mensagemController.update
);

module.exports = router;
