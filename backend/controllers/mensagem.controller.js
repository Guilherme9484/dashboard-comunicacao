const { Mensagem, MensagemEnviada } = require('../models/mensagem.model');
const Contato = require('../models/contato.model');

// Criar nova mensagem/template
exports.create = async (req, res) => {
    try {
        const {
            texto,
            tipo,
            tags,
            variaveis
        } = req.body;

        const mensagem = new Mensagem({
            texto,
            tipo,
            tags,
            variaveis,
            criado_por: req.user.id
        });

        await mensagem.save();

        res.status(201).json({
            message: 'Mensagem criada com sucesso',
            mensagem
        });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({
            error: 'Erro ao criar mensagem'
        });
    }
};

// Listar mensagens/templates
exports.list = async (req, res) => {
    try {
        const { tipo, status, tag } = req.query;
        let query = {};

        // Filtros
        if (tipo) query.tipo = tipo;
        if (status) query.status = status;
        if (tag) query.tags = tag;

        const mensagens = await Mensagem.find(query)
            .sort({ createdAt: -1 })
            .populate('criado_por', 'name email');

        res.json(mensagens);
    } catch (error) {
        console.error('List messages error:', error);
        res.status(500).json({
            error: 'Erro ao listar mensagens'
        });
    }
};

// Obter mensagem por ID
exports.getById = async (req, res) => {
    try {
        const mensagem = await Mensagem.findById(req.params.id)
            .populate('criado_por', 'name email');

        if (!mensagem) {
            return res.status(404).json({
                error: 'Mensagem não encontrada'
            });
        }

        res.json(mensagem);
    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({
            error: 'Erro ao obter mensagem'
        });
    }
};

// Atualizar mensagem
exports.update = async (req, res) => {
    try {
        const {
            texto,
            tags,
            variaveis,
            status
        } = req.body;

        const mensagem = await Mensagem.findById(req.params.id);

        if (!mensagem) {
            return res.status(404).json({
                error: 'Mensagem não encontrada'
            });
        }

        // Atualiza os campos
        if (texto) mensagem.texto = texto;
        if (tags) mensagem.tags = tags;
        if (variaveis) mensagem.variaveis = variaveis;
        if (status) mensagem.status = status;

        await mensagem.save();

        res.json({
            message: 'Mensagem atualizada com sucesso',
            mensagem
        });
    } catch (error) {
        console.error('Update message error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar mensagem'
        });
    }
};

// Enviar mensagem para contatos
exports.send = async (req, res) => {
    try {
        const { mensagemId, contatosIds, variaveis } = req.body;

        const mensagem = await Mensagem.findById(mensagemId);
        if (!mensagem) {
            return res.status(404).json({
                error: 'Mensagem não encontrada'
            });
        }

        const contatos = await Contato.find({
            _id: { $in: contatosIds },
            status: 'ativo'
        });

        if (contatos.length === 0) {
            return res.status(404).json({
                error: 'Nenhum contato ativo encontrado'
            });
        }

        // Prepara o texto com as variáveis
        const prepararTexto = (texto, contato) => {
            let textoFinal = texto;
            // Substitui variáveis padrão
            textoFinal = textoFinal.replace('{nome}', contato.nome_cliente);
            // Substitui variáveis customizadas
            if (variaveis) {
                Object.entries(variaveis).forEach(([key, value]) => {
                    textoFinal = textoFinal.replace(`{${key}}`, value);
                });
            }
            return textoFinal;
        };

        // Cria registros de mensagens enviadas
        const mensagensEnviadas = await Promise.all(
            contatos.map(async (contato) => {
                const textoEnviado = prepararTexto(mensagem.texto, contato);
                const mensagemEnviada = new MensagemEnviada({
                    mensagem: mensagem._id,
                    contato: contato._id,
                    texto_enviado: textoEnviado,
                    status: 'enviado',
                    data_envio: new Date(),
                    enviado_por: req.user.id
                });

                // Atualiza o status do contato
                contato.mensagem_enviada = true;
                contato.ultima_mensagem = new Date();
                await contato.save();

                return mensagemEnviada.save();
            })
        );

        res.json({
            message: 'Mensagens enviadas com sucesso',
            total_enviadas: mensagensEnviadas.length,
            mensagens_enviadas: mensagensEnviadas
        });
    } catch (error) {
        console.error('Send messages error:', error);
        res.status(500).json({
            error: 'Erro ao enviar mensagens'
        });
    }
};

// Obter histórico de mensagens enviadas
exports.getHistory = async (req, res) => {
    try {
        const { contatoId, startDate, endDate } = req.query;
        let query = {};

        if (contatoId) {
            query.contato = contatoId;
        }

        if (startDate || endDate) {
            query.data_envio = {};
            if (startDate) query.data_envio.$gte = new Date(startDate);
            if (endDate) query.data_envio.$lte = new Date(endDate);
        }

        const historico = await MensagemEnviada.find(query)
            .sort({ data_envio: -1 })
            .populate('mensagem', 'texto tipo')
            .populate('contato', 'nome_cliente email')
            .populate('enviado_por', 'name email');

        res.json(historico);
    } catch (error) {
        console.error('Get message history error:', error);
        res.status(500).json({
            error: 'Erro ao obter histórico de mensagens'
        });
    }
};

// Gerar template com IA
exports.generateTemplate = async (req, res) => {
    try {
        const { descricao } = req.body;

        if (!descricao) {
            return res.status(400).json({
                error: 'Descrição é obrigatória para gerar o template'
            });
        }

        // Aqui você implementaria a chamada para sua API de IA
        // Por enquanto, vamos retornar templates de exemplo
        const templates = [
            {
                template1: `Olá {nome},\n\nEspero que esteja bem! ${descricao}\n\nAtenciosamente,\n{assinatura}`
            },
            {
                template2: `Prezado(a) {nome},\n\n${descricao}\n\nCordialmente,\n{assinatura}`
            },
            {
                template3: `Caro(a) {nome},\n\nTudo bem? ${descricao}\n\nAbraços,\n{assinatura}`
            }
        ];

        res.json(templates);
    } catch (error) {
        console.error('Generate template error:', error);
        res.status(500).json({
            error: 'Erro ao gerar templates'
        });
    }
};
