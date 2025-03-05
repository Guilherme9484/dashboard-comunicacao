const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin, validateEmail, validatePassword, validateFields } = require('../middleware/auth.middleware');

// Rotas públicas
router.post('/login', 
    validateFields(['email', 'password']),
    validateEmail,
    authController.login
);

// Rotas protegidas
router.use(verifyToken);

// Rotas de usuário
router.get('/profile', authController.getProfile);
router.put('/profile', 
    validateFields(['name']),
    authController.updateProfile
);

// Rotas de admin
router.post('/register',
    isAdmin,
    validateFields(['name', 'email', 'password']),
    validateEmail,
    validatePassword,
    authController.register
);

router.get('/users',
    isAdmin,
    authController.listUsers
);

router.patch('/users/:userId/status',
    isAdmin,
    validateFields(['active']),
    authController.updateUserStatus
);

module.exports = router;
