const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/contato.controller');
const { verifyToken, validateFields, validateEmail } = require('../middleware/auth.middleware');

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Criar contato
router.post('/',
    validateFields(['nome_cliente', 'email', 'telefone']),
    validateEmail,
    contatoController.create
);

// Listar contatos
router.get('/', contatoController.list);

// Buscar contatos
router.get('/search', contatoController.search);

// Obter estatísticas
router.get('/stats/overview', contatoController.getStats);

// Obter contato por ID
router.get('/:id', contatoController.getById);

// Atualizar contato
router.put('/:id',
    validateFields(['nome_cliente', 'telefone']),
    contatoController.update
);

// Marcar mensagem como enviada
router.patch('/:id/message-sent', contatoController.markMessageSent);

module.exports = router;
