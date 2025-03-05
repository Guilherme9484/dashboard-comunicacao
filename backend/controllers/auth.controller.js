const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { secret, expiresIn } = require('../config/jwt.config');

// Gerar token JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id,
            email: user.email,
            role: user.role
        },
        secret,
        { expiresIn }
    );
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verifica se o usuário existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: 'Email ou senha inválidos'
            });
        }

        // Verifica se a senha está correta
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Email ou senha inválidos'
            });
        }

        // Verifica se o usuário está ativo
        if (!user.active) {
            return res.status(401).json({
                error: 'Usuário inativo'
            });
        }

        // Atualiza último login
        user.lastLogin = new Date();
        await user.save();

        // Gera token e retorna dados do usuário
        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Erro ao realizar login'
        });
    }
};

// Registro de novo usuário (apenas admin pode criar)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Verifica se o email já está em uso
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'Email já está em uso'
            });
        }

        // Cria novo usuário
        const user = new User({
            name,
            email,
            password,
            role: role || 'padrao'
        });

        await user.save();

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'Erro ao criar usuário'
        });
    }
};

// Obter perfil do usuário
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Erro ao obter perfil'
        });
    }
};

// Atualizar perfil
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user.id);

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    error: 'Email já está em uso'
                });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (password) user.password = password;

        await user.save();

        res.json({
            message: 'Perfil atualizado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar perfil'
        });
    }
};

// Listar usuários (apenas admin)
exports.listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({
            error: 'Erro ao listar usuários'
        });
    }
};

// Atualizar status do usuário (apenas admin)
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { active } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }

        user.active = active;
        await user.save();

        res.json({
            message: 'Status do usuário atualizado com sucesso',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                active: user.active
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            error: 'Erro ao atualizar status do usuário'
        });
    }
};
