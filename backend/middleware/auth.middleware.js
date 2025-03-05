const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const User = require('../models/user.model');

// Middleware para verificar o token JWT
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Token não fornecido' 
            });
        }

        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user || !user.active) {
            return res.status(401).json({ 
                error: 'Usuário não encontrado ou inativo' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ 
                error: 'Token expirado' 
            });
        }
        return res.status(401).json({ 
            error: 'Token inválido' 
        });
    }
};

// Middleware para verificar se o usuário é admin
exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            error: 'Acesso negado. Requer privilégios de administrador' 
        });
    }
};

// Middleware para validar campos obrigatórios
exports.validateFields = (requiredFields) => {
    return (req, res, next) => {
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Campos obrigatórios ausentes',
                fields: missingFields
            });
        }
        next();
    };
};

// Middleware para validar formato de email
exports.validateEmail = (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = req.body.email;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            error: 'Email inválido'
        });
    }
    next();
};

// Middleware para validar senha forte
exports.validatePassword = (req, res, next) => {
    const password = req.body.password;
    
    if (!password || password.length < 6) {
        return res.status(400).json({
            error: 'A senha deve ter no mínimo 6 caracteres'
        });
    }
    next();
};
