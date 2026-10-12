/* /backend/controllers/studentsController.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Controlador de Alunos e Turmas (Students Controller)
 * ==============================================================================
 */

const { query } = require('../db');

/**
 * Retorna a lista de alunos para seleção em formulários e listagens de turma
 * Exclusivo para: Professores ('teacher')
 * Rota: GET /api/students
 */
async function getStudents(req, res) {
    try {
        const { turma } = req.query;

        let sql = `
            SELECT 
                u.id, 
                u.nome, 
                u.email, 
                u.turma, 
                u.telefone,
                (SELECT COUNT(*) FROM grades g WHERE g.student_id = u.id) AS total_grades,
                (SELECT ROUND(AVG(g.grade), 1) FROM grades g WHERE g.student_id = u.id) AS average_grade
            FROM users u
            WHERE u.role = 'student'
        `;
        const params = [];

        if (turma) {
            sql += ` AND LOWER(u.turma) = LOWER(?)`;
            params.push(turma);
        }

        sql += ` ORDER BY u.turma ASC, u.nome ASC`;

        const students = await query(sql, params);

        return res.status(200).json({
            success: true,
            total: students.length,
            data: students
        });
    } catch (error) {
        console.error('Erro ao listar alunos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao consultar lista de alunos.'
        });
    }
}

module.exports = {
    getStudents
};
