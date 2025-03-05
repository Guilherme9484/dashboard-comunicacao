const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
    nome_cliente: {
        type: String,
        required: [true, 'Nome do cliente é obrigatório']
    },
    email_cliente: {
        type: String,
        required: [true, 'Email do cliente é obrigatório'],
        lowercase: true,
        trim: true
    },
    telefone_cliente: {
        type: String,
        required: [true, 'Telefone do cliente é obrigatório']
    },
    data_agendamento: {
        type: Date,
        required: [true, 'Data do agendamento é obrigatória']
    },
    tipo: {
        type: String,
        enum: ['consulta', 'retorno', 'procedimento'],
        required: [true, 'Tipo de agendamento é obrigatório']
    },
    procedimentos: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['agendado', 'confirmado', 'cancelado', 'realizado'],
        default: 'agendado'
    },
    observacoes: {
        type: String
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
agendamentoSchema.index({ data_agendamento: 1 });
agendamentoSchema.index({ email_cliente: 1 });
agendamentoSchema.index({ status: 1 });

module.exports = mongoose.model('Agendamento', agendamentoSchema);
