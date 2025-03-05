const Contato = require('../models/contato.model');

// Criar novo contato
exports.create = async (req, res) => {
    try {
        const {
            nome_cliente,
            email,
            telefone,
            tags,
            grupo,
            observacoes
        } = req.body;

        // Verifica se o email já está cadastrado
        const existingContact = await Contato.findOne({ email });
        if (existingContact) {
            return res.status(400).json({
                error: 'Email já cadastrado'
            });
        }

        const contato = new Contato({
            nome_cliente,
            email,
            telefone,
            tags,
            grupo,
            observacoes,
            criado_por: req.user.id
        });

        await contato.save();

        res.status(201).json({
            message: 'Contato criado com sucesso',
            contato
        });
    } catch (error) {
        console.error('Create contact error:', error);
        res.status(500).json({
            error: 'Erro ao criar contato'
        });
    }
};

// Listar contatos
exports.list = async (req, res) => {
    try {
        const { status, grupo, tag } = req.query;
        let query = {};

        // Filtros
        if (status) query.status = status;
        if (grupo) query.grupo = grupo;
        if (tag) query.tags = tag;

        const contatos = await Contato.find(query)
            .sort({ nome_cliente: 1 })
            .populate('criado_por', 'name email');

        res.json(contatos);
    } catch (error) {
        console.error('List contacts error:', error);
        res.status(500).json({
            error: 'Erro ao listar contatos'
        });
    }
};

// Obter contato por ID
exports.getById = async (req, res) => {
    try {
        const contato = await Contato.findById(req.params.id)
            .populate('criado_por', 'name email');

        if (!contato) {
            return res.status(404).json({
                error: 'Contato não encontrado'
            });
        }

        res.json(contato);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            error: 'Erro ao obter contato'
        });
    }
};

// Atualizar contato
exports.update = async (req, res) => {
    try {
        const {
            nome_cliente,
            telefone,
            tags,
            grupo,
            observacoes,
            status
        } = req.body;

        const contato = await Contato.findById(req.params.id);

        if (!contato) {
            return res.status(404).json({
                error: 'Contato não encontrado'
            });
        }

        // Atualiza os campos
        if (nome_cliente) contato.nome_cliente = nome_cliente;
        if (telefone) contato.telefone = telefone;
        if (tags) contato.tags = tags;
        if (grupo) contato.grupo = grupo;
        if (observacoes) contato.observacoes = observacoes;
        if (status) contato.status = status;

        await contato.save();

        res.json({
            message: 'Contato atualizado com sucesso',
            contato
        });
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar contato'
        });
    }
};

// Marcar mensagem como enviada
exports.markMessageSent = async (req, res) => {
    try {
        const contato = await Contato.findById(req.params.id);

        if (!contato) {
            return res.status(404).json({
                error: 'Contato não encontrado'
            });
        }

        contato.mensagem_enviada = true;
        contato.ultima_mensagem = new Date();
        await contato.save();

        res.json({
            message: 'Status de mensagem atualizado com sucesso',
            contato
        });
    } catch (error) {
        console.error('Mark message sent error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar status de mensagem'
        });
    }
};

// Obter estatísticas de contatos
exports.getStats = async (req, res) => {
    try {
        // Total de contatos
        const total = await Contato.countDocuments();

        // Contatos por status
        const porStatus = await Contato.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Contatos por grupo
        const porGrupo = await Contato.aggregate([
            {
                $group: {
                    _id: '$grupo',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Contatos com mensagem enviada
        const comMensagem = await Contato.countDocuments({
            mensagem_enviada: true
        });

        res.json({
            total,
            por_status: porStatus,
            por_grupo: porGrupo,
            com_mensagem: comMensagem
        });
    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            error: 'Erro ao obter estatísticas'
        });
    }
};

// Buscar contatos
exports.search = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({
                error: 'Termo de busca não fornecido'
            });
        }

        const contatos = await Contato.find({
            $or: [
                { nome_cliente: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { telefone: { $regex: q, $options: 'i' } }
            ]
        }).sort({ nome_cliente: 1 });

        res.json(contatos);
    } catch (error) {
        console.error('Search contacts error:', error);
        res.status(500).json({
            error: 'Erro ao buscar contatos'
        });
    }
};
