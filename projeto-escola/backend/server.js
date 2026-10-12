/* /backend/server.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Servidor Principal (Node.js + Express.js)
 * Arquitetura Modular Cliente-Servidor Tradicional
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Inicialização da aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// ==============================================================================
// 1. Middlewares Globais
// ==============================================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (HTML, CSS, JS, Imagens)
const FRONTEND_DIR = path.join(__dirname, '../frontend');
app.use(express.static(FRONTEND_DIR));

// ==============================================================================
// 2. Importação e Registro das Rotas Modulares da API
// ==============================================================================
const authRoutes = require('./routes/auth');
const gradesRoutes = require('./routes/grades');
const keysRoutes = require('./routes/keys');
const announcementsRoutes = require('./routes/announcements');
const contactRoutes = require('./routes/contact');
const studentsRoutes = require('./routes/students');
const authController = require('./controllers/authController');

// Endpoint solicitado explicitamente: POST /api/login
app.post('/api/login', authController.login);

// Mapeamento dos grupos de rotas REST
app.use('/api/auth', authRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/answer-keys', keysRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/students', studentsRoutes);

// Endpoint de verificação de integridade da API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        system: 'Portal Escola Liana Goulart',
        timestamp: new Date().toISOString()
    });
});

// ==============================================================================
// 3. Roteamento de Páginas Públicas e Restritas
// ==============================================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'login.html'));
});

app.get('/hub', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'hub.html'));
});

// Tratamento de rotas inexistentes da API (404 JSON)
app.all('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.url} não encontrado.`
    });
});

// Redirecionamento padrão para index.html para qualquer outra rota desconhecida
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ==============================================================================
// 4. Inicialização do Servidor HTTP
// ==============================================================================
app.listen(PORT, () => {
    console.log('==============================================================================');
    console.log(`🚀 Escola Liana Goulart - Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesso Web: http://localhost:${PORT}`);
    console.log(`🔑 Login:      http://localhost:${PORT}/login.html`);
    console.log(`🎓 Hub Aluno:  http://localhost:${PORT}/hub.html`);
    console.log('==============================================================================');
    console.log('Perfis de teste disponíveis:');
    console.log('  👨‍🏫 Professor:   prof.carlos@escola.com   / senha123');
    console.log('  👨‍🎓 Aluno:       aluno.lucas@escola.com   / senha123');
    console.log('  👩‍👦 Responsável: maria.mae@escola.com     / senha123');
    console.log('==============================================================================');
});

module.exports = app;
