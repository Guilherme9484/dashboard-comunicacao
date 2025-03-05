const mongoose = require('mongoose');

const contatoSchema = new mongoose.Schema({
    nome_cliente: {
        type: String,
        required: [true, 'Nome do cliente é obrigatório']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        lowercase: true,
        trim: true
    },
    telefone: {
        type: String,
        required: [true, 'Telefone é obrigatório']
    },
    mensagem_enviada: {
        type: Boolean,
        default: false
    },
    ultima_mensagem: {
        type: Date
    },
    tags: [{
        type: String
    }],
    grupo: {
        type: String
    },
    observacoes: {
        type: String
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'bloqueado'],
        default: 'ativo'
    },
    criado_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Índices para melhorar a performance das consultas
contatoSchema.index({ email: 1 }, { unique: true });
contatoSchema.index({ telefone: 1 });
contatoSchema.index({ status: 1 });
contatoSchema.index({ mensagem_enviada: 1 });

module.exports = mongoose.model('Contato', contatoSchema);
