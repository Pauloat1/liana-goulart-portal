/* /backend/controllers/keysController.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Controlador de Gabaritos e Avaliações (Answer Keys Controller)
 * ==============================================================================
 */

const { query, get, run } = require('../db');

/**
 * Lista todos os gabaritos disponíveis no sistema
 * Acessível por: Alunos, Responsáveis e Professores
 * Rota: GET /api/answer-keys
 */
async function getAnswerKeys(req, res) {
    try {
        const { class_name, subject } = req.query;

        let sql = `
            SELECT 
                k.id,
                k.title,
                k.class_name,
                k.subject,
                k.file_url,
                k.content,
                k.created_at,
                k.teacher_id,
                COALESCE(u.nome, 'Coordenação Pedagógica') AS teacher_name
            FROM answer_keys k
            LEFT JOIN users u ON k.teacher_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (class_name) {
            sql += ` AND LOWER(k.class_name) LIKE LOWER(?)`;
            params.push(`%${class_name}%`);
        }

        if (subject) {
            sql += ` AND LOWER(k.subject) LIKE LOWER(?)`;
            params.push(`%${subject}%`);
        }

        sql += ` ORDER BY k.created_at DESC`;

        const answerKeys = await query(sql, params);

        return res.status(200).json({
            success: true,
            total: answerKeys.length,
            data: answerKeys
        });
    } catch (error) {
        console.error('Erro ao listar gabaritos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao consultar gabaritos.'
        });
    }
}

/**
 * Cadastra um novo gabarito de avaliação ou simulado
 * Exclusivo para: Professores ('teacher')
 * Rota: POST /api/answer-keys
 */
async function createAnswerKey(req, res) {
    try {
        const teacher_id = req.user.id;
        const { title, class_name, subject, content, file_url = '#' } = req.body;

        if (!title || !class_name || !subject || !content) {
            return res.status(400).json({
                success: false,
                message: 'Preencha todos os campos obrigatórios: Título, Turma, Matéria e Conteúdo/Respostas.'
            });
        }

        const insertSql = `
            INSERT INTO answer_keys (teacher_id, title, class_name, subject, file_url, content)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const result = await run(insertSql, [
            teacher_id,
            title.trim(),
            class_name.trim(),
            subject.trim(),
            file_url || '#',
            content.trim()
        ]);

        return res.status(201).json({
            success: true,
            message: 'Gabarito publicado com sucesso!',
            data: {
                id: result.id,
                title: title.trim(),
                class_name: class_name.trim(),
                subject: subject.trim(),
                content: content.trim(),
                file_url: file_url || '#'
            }
        });
    } catch (error) {
        console.error('Erro ao cadastrar gabarito:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao cadastrar gabarito.'
        });
    }
}

/**
 * Remove um gabarito
 * Exclusivo para: Professores ('teacher')
 * Rota: DELETE /api/answer-keys/:id
 */
async function deleteAnswerKey(req, res) {
    try {
        const { id } = req.params;
        const existingKey = await get('SELECT id FROM answer_keys WHERE id = ?', [id]);

        if (!existingKey) {
            return res.status(404).json({ success: false, message: 'Gabarito não encontrado.' });
        }

        await run('DELETE FROM answer_keys WHERE id = ?', [id]);

        return res.status(200).json({
            success: true,
            message: 'Gabarito excluído com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao excluir gabarito:', error);
        return res.status(500).json({ success: false, message: 'Erro ao excluir gabarito.' });
    }
}

module.exports = {
    getAnswerKeys,
    createAnswerKey,
    deleteAnswerKey
};
