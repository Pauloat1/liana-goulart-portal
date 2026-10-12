/* /backend/routes/contact.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Rotas de Contato e Fale Conosco (/api/contact)
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const contactController = require('../controllers/contactController');
const { authenticateToken, requireRoles, JWT_SECRET } = require('../middleware/auth');

function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (!err) req.user = decoded;
            next();
        });
    } else {
        next();
    }
}

// Enviar mensagem (Visitantes ou usuários autenticados)
router.post('/', optionalAuth, contactController.sendContactMessage);

// Listar mensagens recebidas (Professor e coordenação)
router.get('/', authenticateToken, requireRoles('teacher'), contactController.getContactMessages);

module.exports = router;
