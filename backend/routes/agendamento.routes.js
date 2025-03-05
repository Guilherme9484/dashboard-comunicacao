const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamento.controller');
const { verifyToken, validateFields } = require('../middleware/auth.middleware');

// Middleware de autenticação para todas as rotas
router.use(verifyToken);

// Criar agendamento
router.post('/',
    validateFields(['nome_cliente', 'email_cliente', 'telefone_cliente', 'data_agendamento', 'tipo']),
    agendamentoController.create
);

// Listar agendamentos
router.get('/', agendamentoController.list);

// Obter agendamento por ID
router.get('/:id', agendamentoController.getById);

// Atualizar agendamento
router.put('/:id',
    validateFields(['nome_cliente', 'email_cliente', 'telefone_cliente', 'data_agendamento', 'tipo']),
    agendamentoController.update
);

// Cancelar agendamento
router.patch('/:id/cancel', agendamentoController.cancel);

// Obter estatísticas
router.get('/stats/overview', agendamentoController.getStats);

module.exports = router;
