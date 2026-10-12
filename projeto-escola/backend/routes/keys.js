/* /backend/routes/keys.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Rotas de Gabaritos (/api/answer-keys)
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const keysController = require('../controllers/keysController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Consulta de gabaritos (Aluno, Responsável e Professor)
router.get('/', authenticateToken, keysController.getAnswerKeys);

// Cadastro de novos gabaritos (Exclusivo para Professor)
router.post('/', authenticateToken, requireRoles('teacher'), keysController.createAnswerKey);

// Exclusão de gabarito (Exclusivo para Professor)
router.delete('/:id', authenticateToken, requireRoles('teacher'), keysController.deleteAnswerKey);

module.exports = router;
