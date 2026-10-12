/* /backend/controllers/announcementsController.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Controlador do Mural de Avisos (Announcements Controller)
 * ==============================================================================
 */

const { query, run } = require('../db');

/**
 * Retorna os avisos filtrados pelo perfil do usuário
 * Rota: GET /api/announcements
 */
async function getAnnouncements(req, res) {
    try {
        const userRole = req.user ? req.user.role : 'all';

        let sql = `
            SELECT 
                a.id,
                a.title,
                a.content,
                a.category,
                a.target_role,
                a.created_at,
                COALESCE(u.nome, 'Diretoria Pedagógica') AS author_name
            FROM announcements a
            LEFT JOIN users u ON a.teacher_id = u.id
        `;
        const params = [];

        // Aluno vê 'all' e 'student'; Responsável vê 'all' e 'parent'; Professor vê tudo
        if (userRole === 'student') {
            sql += ` WHERE a.target_role IN ('all', 'student')`;
        } else if (userRole === 'parent') {
            sql += ` WHERE a.target_role IN ('all', 'parent')`;
        } else if (userRole === 'all') {
            sql += ` WHERE a.target_role = 'all'`;
        }

        sql += ` ORDER BY a.created_at DESC`;

        const announcements = await query(sql, params);

        return res.status(200).json({
            success: true,
            total: announcements.length,
            data: announcements
        });
    } catch (error) {
        console.error('Erro ao buscar avisos:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao consultar mural de avisos.'
        });
    }
}

/**
 * Cria um novo aviso no mural
 * Exclusivo para: Professores ('teacher')
 * Rota: POST /api/announcements
 */
async function createAnnouncement(req, res) {
    try {
        const teacher_id = req.user.id;
        const { title, content, category = 'Geral', target_role = 'all' } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Título e conteúdo são obrigatórios.'
            });
        }

        const sql = `
            INSERT INTO announcements (teacher_id, title, content, category, target_role)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await run(sql, [teacher_id, title.trim(), content.trim(), category, target_role]);

        return res.status(201).json({
            success: true,
            message: 'Aviso publicado com sucesso no mural!',
            data: {
                id: result.id,
                title,
                content,
                category,
                target_role
            }
        });
    } catch (error) {
        console.error('Erro ao publicar aviso:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao publicar aviso.'
        });
    }
}

module.exports = {
    getAnnouncements,
    createAnnouncement
};
