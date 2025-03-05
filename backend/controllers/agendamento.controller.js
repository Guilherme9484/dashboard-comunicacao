const Agendamento = require('../models/agendamento.model');

// Criar novo agendamento
exports.create = async (req, res) => {
    try {
        const {
            nome_cliente,
            email_cliente,
            telefone_cliente,
            data_agendamento,
            tipo,
            procedimentos,
            observacoes
        } = req.body;

        const agendamento = new Agendamento({
            nome_cliente,
            email_cliente,
            telefone_cliente,
            data_agendamento,
            tipo,
            procedimentos,
            observacoes,
            criado_por: req.user.id
        });

        await agendamento.save();

        res.status(201).json({
            message: 'Agendamento criado com sucesso',
            agendamento
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            error: 'Erro ao criar agendamento'
        });
    }
};

// Listar agendamentos
exports.list = async (req, res) => {
    try {
        const { start_date, end_date, status } = req.query;
        let query = {};

        // Filtro por período
        if (start_date || end_date) {
            query.data_agendamento = {};
            if (start_date) query.data_agendamento.$gte = new Date(start_date);
            if (end_date) query.data_agendamento.$lte = new Date(end_date);
        }

        // Filtro por status
        if (status) {
            query.status = status;
        }

        const agendamentos = await Agendamento.find(query)
            .sort({ data_agendamento: 1 })
            .populate('criado_por', 'name email');

        res.json(agendamentos);
    } catch (error) {
        console.error('List appointments error:', error);
        res.status(500).json({
            error: 'Erro ao listar agendamentos'
        });
    }
};

// Obter agendamento por ID
exports.getById = async (req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id)
            .populate('criado_por', 'name email');

        if (!agendamento) {
            return res.status(404).json({
                error: 'Agendamento não encontrado'
            });
        }

        res.json(agendamento);
    } catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({
            error: 'Erro ao obter agendamento'
        });
    }
};

// Atualizar agendamento
exports.update = async (req, res) => {
    try {
        const {
            nome_cliente,
            email_cliente,
            telefone_cliente,
            data_agendamento,
            tipo,
            procedimentos,
            observacoes,
            status
        } = req.body;

        const agendamento = await Agendamento.findById(req.params.id);

        if (!agendamento) {
            return res.status(404).json({
                error: 'Agendamento não encontrado'
            });
        }

        // Atualiza os campos
        if (nome_cliente) agendamento.nome_cliente = nome_cliente;
        if (email_cliente) agendamento.email_cliente = email_cliente;
        if (telefone_cliente) agendamento.telefone_cliente = telefone_cliente;
        if (data_agendamento) agendamento.data_agendamento = data_agendamento;
        if (tipo) agendamento.tipo = tipo;
        if (procedimentos) agendamento.procedimentos = procedimentos;
        if (observacoes) agendamento.observacoes = observacoes;
        if (status) agendamento.status = status;

        await agendamento.save();

        res.json({
            message: 'Agendamento atualizado com sucesso',
            agendamento
        });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar agendamento'
        });
    }
};

// Cancelar agendamento
exports.cancel = async (req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id);

        if (!agendamento) {
            return res.status(404).json({
                error: 'Agendamento não encontrado'
            });
        }

        agendamento.status = 'cancelado';
        await agendamento.save();

        res.json({
            message: 'Agendamento cancelado com sucesso',
            agendamento
        });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            error: 'Erro ao cancelar agendamento'
        });
    }
};

// Estatísticas de agendamentos
exports.getStats = async (req, res) => {
    try {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        // Total de agendamentos do mês
        const totalMes = await Agendamento.countDocuments({
            data_agendamento: {
                $gte: inicioMes,
                $lte: fimMes
            }
        });

        // Agendamentos por status
        const porStatus = await Agendamento.aggregate([
            {
                $match: {
                    data_agendamento: {
                        $gte: inicioMes,
                        $lte: fimMes
                    }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Agendamentos por tipo
        const porTipo = await Agendamento.aggregate([
            {
                $match: {
                    data_agendamento: {
                        $gte: inicioMes,
                        $lte: fimMes
                    }
                }
            },
            {
                $group: {
                    _id: '$tipo',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            total_mes: totalMes,
            por_status: porStatus,
            por_tipo: porTipo
        });
    } catch (error) {
        console.error('Get appointment stats error:', error);
        res.status(500).json({
            error: 'Erro ao obter estatísticas'
        });
    }
};
