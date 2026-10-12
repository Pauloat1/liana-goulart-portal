/* /backend/routes/announcements.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Rotas do Mural de Avisos (/api/announcements)
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const announcementsController = require('../controllers/announcementsController');
const { authenticateToken, requireRoles, JWT_SECRET } = require('../middleware/auth');

// Middleware opcional para capturar o usuário caso o token exista
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (!err) {
                req.user = decoded;
            }
            next();
        });
    } else {
        next();
    }
}

// Listagem de avisos (Público / Aluno / Responsável / Professor)
router.get('/', optionalAuth, announcementsController.getAnnouncements);

// Publicação de novo aviso (Exclusivo para Professor)
router.post('/', authenticateToken, requireRoles('teacher'), announcementsController.createAnnouncement);

module.exports = router;
