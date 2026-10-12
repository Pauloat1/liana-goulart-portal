/* /backend/controllers/gradesController.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Controlador de Notas e Boletim Escolar (Grades Controller)
 * ==============================================================================
 */

const { query, get, run } = require('../db');

/**
 * Consulta notas de acordo com o perfil RBAC:
 * - Aluno: Visualiza apenas suas próprias notas
 * - Responsável: Visualiza as notas dos filhos vinculados
 * - Professor: Visualiza notas de todos os alunos ou com filtros
 * Rota: GET /api/grades
 */
async function getGrades(req, res) {
    try {
        const { role, id } = req.user;
        const { student_id, bimester, subject } = req.query;

        let sql = `
            SELECT 
                g.id,
                g.student_id,
                u_student.nome AS student_name,
                u_student.turma AS student_class,
                g.teacher_id,
                COALESCE(u_teacher.nome, 'Não informado') AS teacher_name,
                g.subject,
                g.grade,
                g.bimester,
                g.status,
                g.observations,
                g.created_at
            FROM grades g
            JOIN users u_student ON g.student_id = u_student.id
            LEFT JOIN users u_teacher ON g.teacher_id = u_teacher.id
            WHERE 1=1
        `;
        const params = [];

        // Filtro por Perfil RBAC
        if (role === 'student') {
            sql += ` AND g.student_id = ?`;
            params.push(id);
        } else if (role === 'parent') {
            sql += ` AND g.student_id IN (SELECT student_id FROM parent_students WHERE parent_id = ?)`;
            params.push(id);
        } else if (role === 'teacher') {
            if (student_id) {
                sql += ` AND g.student_id = ?`;
                params.push(student_id);
            }
        }

        // Filtros opcionais adicionais
        if (bimester) {
            sql += ` AND g.bimester = ?`;
            params.push(parseInt(bimester, 10));
        }

        if (subject) {
            sql += ` AND LOWER(g.subject) LIKE LOWER(?)`;
            params.push(`%${subject}%`);
        }

        sql += ` ORDER BY g.bimester ASC, g.subject ASC, u_student.nome ASC`;

        const grades = await query(sql, params);

        return res.status(200).json({
            success: true,
            total: grades.length,
            data: grades
        });
    } catch (error) {
        console.error('Erro ao buscar notas:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao consultar notas do boletim.'
        });
    }
}

/**
 * Cadastra uma nova nota no sistema
 * Exclusivo para: Professores ('teacher')
 * Rota: POST /api/grades
 */
async function createGrade(req, res) {
    try {
        const teacher_id = req.user.id;
        const { student_id, subject, grade, bimester = 1, status, observations = '' } = req.body;

        // Validações de entrada
        if (!student_id || !subject || grade === undefined || grade === null) {
            return res.status(400).json({
                success: false,
                message: 'Preencha todos os campos obrigatórios: Aluno, Matéria e Nota.'
            });
        }

        const numericGrade = parseFloat(grade);
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
            return res.status(400).json({
                success: false,
                message: 'A nota deve ser um valor numérico entre 0.0 e 10.0.'
            });
        }

        const numericBimester = parseInt(bimester, 10);
        if (![1, 2, 3, 4].includes(numericBimester)) {
            return res.status(400).json({
                success: false,
                message: 'O bimestre deve ser 1, 2, 3 ou 4.'
            });
        }

        // Verifica se o aluno existe e possui papel 'student'
        const student = await get('SELECT id, nome, role FROM users WHERE id = ? AND role = ?', [student_id, 'student']);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Aluno não encontrado no sistema.'
            });
        }

        // Determinação automática do status acadêmico se não informado
        const calculatedStatus = status || (numericGrade >= 6.0 ? 'Aprovado' : 'Em Recuperação');

        // Inserção com Prepared Statement seguro
        const insertSql = `
            INSERT INTO grades (student_id, teacher_id, subject, grade, bimester, status, observations)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await run(insertSql, [
            student_id,
            teacher_id,
            subject.trim(),
            numericGrade,
            numericBimester,
            calculatedStatus,
            observations ? observations.trim() : null
        ]);

        return res.status(201).json({
            success: true,
            message: `Nota cadastrada com sucesso para o aluno ${student.nome}!`,
            data: {
                id: result.id,
                student_id,
                student_name: student.nome,
                teacher_id,
                subject: subject.trim(),
                grade: numericGrade,
                bimester: numericBimester,
                status: calculatedStatus,
                observations
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar nota:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao lançar nota.'
        });
    }
}

/**
 * Atualiza uma nota existente
 * Exclusivo para: Professores ('teacher')
 * Rota: PUT /api/grades/:id
 */
async function updateGrade(req, res) {
    try {
        const { id } = req.params;
        const { grade, status, observations, bimester, subject } = req.body;

        const existingGrade = await get('SELECT * FROM grades WHERE id = ?', [id]);
        if (!existingGrade) {
            return res.status(404).json({
                success: false,
                message: 'Registro de nota não encontrado.'
            });
        }

        const newGrade = grade !== undefined ? parseFloat(grade) : existingGrade.grade;
        if (isNaN(newGrade) || newGrade < 0 || newGrade > 10) {
            return res.status(400).json({
                success: false,
                message: 'A nota deve ser um valor entre 0.0 e 10.0.'
            });
        }

        const newStatus = status || (newGrade >= 6.0 ? 'Aprovado' : 'Em Recuperação');
        const newBimester = bimester ? parseInt(bimester, 10) : existingGrade.bimester;
        const newSubject = subject ? subject.trim() : existingGrade.subject;
        const newObs = observations !== undefined ? observations : existingGrade.observations;

        const updateSql = `
            UPDATE grades 
            SET grade = ?, status = ?, observations = ?, bimester = ?, subject = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await run(updateSql, [newGrade, newStatus, newObs, newBimester, newSubject, id]);

        return res.status(200).json({
            success: true,
            message: 'Nota atualizada com sucesso!',
            data: {
                id: parseInt(id, 10),
                grade: newGrade,
                status: newStatus,
                observations: newObs
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar nota:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao atualizar nota.'
        });
    }
}

/**
 * Remove um lançamento de nota
 * Exclusivo para: Professores ('teacher')
 * Rota: DELETE /api/grades/:id
 */
async function deleteGrade(req, res) {
    try {
        const { id } = req.params;
        const existingGrade = await get('SELECT id FROM grades WHERE id = ?', [id]);

        if (!existingGrade) {
            return res.status(404).json({ success: false, message: 'Nota não encontrada.' });
        }

        await run('DELETE FROM grades WHERE id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Nota removida com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao excluir nota:', error);
        return res.status(500).json({ success: false, message: 'Erro ao excluir nota.' });
    }
}

module.exports = {
    getGrades,
    createGrade,
    updateGrade,
    deleteGrade
};
