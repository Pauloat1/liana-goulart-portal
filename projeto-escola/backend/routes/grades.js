/* /backend/routes/grades.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Rotas de Notas e Boletim (/api/grades)
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const gradesController = require('../controllers/gradesController');
const { authenticateToken, requireRoles } = require('../middleware/auth');

// Consulta de notas (Aluno, Responsável e Professor com filtros automáticos)
router.get('/', authenticateToken, gradesController.getGrades);

// Cadastro de nota (Exclusivo para Professor)
router.post('/', authenticateToken, requireRoles('teacher'), gradesController.createGrade);

// Atualização de nota (Exclusivo para Professor)
router.put('/:id', authenticateToken, requireRoles('teacher'), gradesController.updateGrade);

// Exclusão de nota (Exclusivo para Professor)
router.delete('/:id', authenticateToken, requireRoles('teacher'), gradesController.deleteGrade);

module.exports = router;
