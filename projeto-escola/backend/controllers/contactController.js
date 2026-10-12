/* /backend/controllers/contactController.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Controlador de Contato e Comunicação Direta (Contact Controller)
 * ==============================================================================
 */

const { query, run } = require('../db');

/**
 * Envia uma mensagem para a secretaria/escola (Visitante, Responsável ou Aluno)
 * Rota: POST /api/contact
 */
async function sendContactMessage(req, res) {
    try {
        const { sender_name, sender_email, subject, message } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!sender_name || !sender_email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Por favor, preencha todos os campos obrigatórios.'
            });
        }

        const sql = `
            INSERT INTO contact_messages (user_id, sender_name, sender_email, subject, message, status)
            VALUES (?, ?, ?, ?, ?, 'Pendente')
        `;
        const result = await run(sql, [userId, sender_name.trim(), sender_email.trim(), subject.trim(), message.trim()]);

        return res.status(201).json({
            success: true,
            message: 'Sua mensagem foi enviada com sucesso! A equipe da Escola Liana Goulart responderá em breve.',
            ticketId: result.id
        });
    } catch (error) {
        console.error('Erro ao enviar mensagem de contato:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao processar a mensagem. Tente novamente mais tarde.'
        });
    }
}

/**
 * Lista mensagens recebidas pela escola (Para professores e coordenação)
 * Rota: GET /api/contact
 */
async function getContactMessages(req, res) {
    try {
        const messages = await query(
            `SELECT id, user_id, sender_name, sender_email, subject, message, status, created_at 
             FROM contact_messages 
             ORDER BY created_at DESC`
        );

        return res.status(200).json({
            success: true,
            total: messages.length,
            data: messages
        });
    } catch (error) {
        console.error('Erro ao listar mensagens:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro ao consultar mensagens.'
        });
    }
}

module.exports = {
    sendContactMessage,
    getContactMessages
};
