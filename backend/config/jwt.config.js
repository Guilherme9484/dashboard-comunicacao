module.exports = {
    secret: process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura-2025',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
};
