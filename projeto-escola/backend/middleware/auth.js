/* /backend/middleware/auth.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Middleware de Autenticação e Controle de Acesso Baseado em Perfis (RBAC)
 * ==============================================================================
 */

const jwt = require('jsonwebtoken');

// Chave secreta JWT (em produção, utilize variável de ambiente process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'liana_goulart_secret_key_2026_portal_seguro';

/**
 * Middleware para validar a presença e autenticidade do JWT Token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acesso negado. Token de autenticação não fornecido.'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Sessão inválida ou expirada. Faça login novamente.'
            });
        }
        req.user = decodedUser;
        next();
    });
}

/**
 * Middleware para autorização de perfis RBAC
 * @param  {...string} allowedRoles - Perfis autorizados ('teacher', 'student', 'parent')
 */
function requireRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acesso proibido. Seu perfil (${req.user ? req.user.role : 'desconhecido'}) não tem permissão para esta operação.`
            });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    requireRoles,
    JWT_SECRET
};
