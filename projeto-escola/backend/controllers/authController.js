/* /backend/controllers/authController.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Controlador de Autenticação (Auth Controller)
 * ==============================================================================
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, query } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Autentica o usuário no sistema e retorna token JWT + dados do perfil
 * Rota: POST /api/login
 */
async function login(req, res) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'E-mail e senha são obrigatórios.'
            });
        }

        // Consulta parametrizada (evita SQL Injection)
        const user = await get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
            });
        }

        // Verificação segura de senha via bcrypt com fallback para desenvolvimento
        let passwordMatches = false;
        try {
            passwordMatches = await bcrypt.compare(senha, user.senha);
        } catch (e) {
            passwordMatches = false;
        }

        // Fallback caso a senha no banco esteja em texto puro (para facilidade de testes manuais)
        if (!passwordMatches && user.senha === senha) {
            passwordMatches = true;
        }

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas. Verifique seu e-mail e senha.'
            });
        }

        // Se o usuário for responsável, busca informações do(s) filho(s)
        let children = [];
        if (user.role === 'parent') {
            children = await query(
                `SELECT u.id, u.nome, u.email, u.turma, ps.relationship_type
                 FROM parent_students ps
                 JOIN users u ON ps.student_id = u.id
                 WHERE ps.parent_id = ?`,
                [user.id]
            );
        }

        // Carga do Token JWT
        const tokenPayload = {
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            turma: user.turma,
            childrenIds: children.map(c => c.id)
        };

        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '8h' });

        return res.status(200).json({
            success: true,
            message: `Bem-vindo(a), ${user.nome}!`,
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
                turma: user.turma,
                telefone: user.telefone,
                children: children
            }
        });

    } catch (error) {
        console.error('Erro no controller de login:', error);
        return res.status(500).json({
            success: false,
            message: 'Erro interno ao realizar autenticação. Tente novamente mais tarde.'
        });
    }
}

/**
 * Retorna os dados do usuário autenticado atual
 * Rota: GET /api/me
 */
async function getMe(req, res) {
    try {
        const user = await get(
            'SELECT id, nome, email, role, turma, telefone FROM users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
        }

        let children = [];
        if (user.role === 'parent') {
            children = await query(
                `SELECT u.id, u.nome, u.email, u.turma, ps.relationship_type
                 FROM parent_students ps
                 JOIN users u ON ps.student_id = u.id
                 WHERE ps.parent_id = ?`,
                [user.id]
            );
        }

        return res.json({
            success: true,
            user: {
                ...user,
                children
            }
        });
    } catch (error) {
        console.error('Erro no getMe:', error);
        return res.status(500).json({ success: false, message: 'Erro ao obter dados do usuário.' });
    }
}

module.exports = {
    login,
    getMe
};
