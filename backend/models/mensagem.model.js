const mongoose = require('mongoose');

const mensagemSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: [true, 'Texto da mensagem é obrigatório']
    },
    tipo: {
        type: String,
        enum: ['template', 'personalizada'],
        default: 'template'
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'arquivado'],
        default: 'ativo'
    },
    tags: [{
        type: String
    }],
    variaveis: [{
        nome: String,
        descricao: String
    }],
    criado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Schema para mensagens enviadas
const mensagemEnviadaSchema = new mongoose.Schema({
    mensagem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mensagem',
        required: true
    },
    contato: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contato',
        required: true
    },
    texto_enviado: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['enviado', 'falha', 'pendente'],
        default: 'pendente'
    },
    data_envio: {
        type: Date
    },
    tentativas: {
        type: Number,
        default: 0
    },
    erro: {
        type: String
    },
    enviado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índices para melhorar a performance das consultas
mensagemSchema.index({ status: 1 });
mensagemSchema.index({ tipo: 1 });
mensagemEnviadaSchema.index({ status: 1 });
mensagemEnviadaSchema.index({ data_envio: 1 });
mensagemEnviadaSchema.index({ contato: 1 });

const Mensagem = mongoose.model('Mensagem', mensagemSchema);
const MensagemEnviada = mongoose.model('MensagemEnviada', mensagemEnviadaSchema);

module.exports = {
    Mensagem,
    MensagemEnviada
};
