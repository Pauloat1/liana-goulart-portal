/* /backend/routes/students.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Rotas de Alunos (/api/students)
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Consulta de alunos para professores lançarem notas e gerenciarem turmas
router.get('/', authenticateToken, requireRoles('teacher'), studentsController.getStudents);

module.exports = router;
