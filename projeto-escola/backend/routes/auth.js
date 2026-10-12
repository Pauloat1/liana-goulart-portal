/* /backend/routes/auth.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Rotas de Autenticação (/api/auth ou /api)
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Endpoint de login (público)
router.post('/login', authController.login);

// Endpoint de dados do usuário autenticado
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
