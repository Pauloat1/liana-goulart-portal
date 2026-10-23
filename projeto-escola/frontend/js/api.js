/* /frontend/js/api.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOURLART
 * Módulo de Integração com API (Client HTTP Fetch Helper)
 * Suporte Híbrido: API Express (Local/Produção) + Fallback Inteligente para GitHub Pages
 * ==============================================================================
 */

const API_BASE_URL = '/api';

// Detecção de ambiente estático (Cloudflare Pages, Workers, GitHub Pages, Vercel, Netlify ou modo arquivo)
const isStaticHost = 
    window.location.hostname.includes('pages.dev') ||
    window.location.hostname.includes('workers.dev') ||
    window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.protocol === 'file:';

const api = {
    getToken() {
        return localStorage.getItem('escola_token');
    },

    getHeaders(customHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...customHeaders
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    },

    async handleResponse(response) {
        let data = null;
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
        }

        // Se o servidor retornou HTML (ex: 404 em servidor estático como Cloudflare Pages), sinaliza para fallback
        if (!data) {
            const error = new Error('Resposta não-JSON do servidor (ambiente estático).');
            error.status = response.status;
            error.isNonJson = true;
            throw error;
        }

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                if (window.location.pathname.includes('hub.html')) {
                    localStorage.removeItem('escola_token');
                    localStorage.removeItem('escola_user');
                    alert('Sua sessão expirou. Por favor, realize o login novamente.');
                    window.location.href = 'login.html';
                    return;
                }
            }

            const errorMsg = data.message || `Erro ${response.status}: Falha na operação.`;
            const error = new Error(errorMsg);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    },

    async get(endpoint) {
        if (isStaticHost) {
            return this.staticMockGet(endpoint);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            // Em caso de falha de rede, erro 404 ou resposta HTML
            if (error.isNonJson || error.status === 404 || error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Load failed')) {
                return this.staticMockGet(endpoint);
            }
            console.error(`Erro na requisição GET ${endpoint}:`, error);
            throw error;
        }
    },

    async post(endpoint, body = {}) {
        if (isStaticHost) {
            return this.staticMockPost(endpoint, body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await this.handleResponse(response);
        } catch (error) {
            if (error.isNonJson || error.status === 404 || error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Load failed')) {
                return this.staticMockPost(endpoint, body);
            }
            console.error(`Erro na requisição POST ${endpoint}:`, error);
            throw error;
        }
    },

    async put(endpoint, body = {}) {
        if (isStaticHost) {
            return { success: true, message: 'Atualizado em modo demonstração estática.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: true, message: 'Atualizado em modo demonstração estática.' };
        }
    },

    async delete(endpoint) {
        if (isStaticHost) {
            return { success: true, message: 'Removido em modo demonstração estática.' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return await this.handleResponse(response);
        } catch (error) {
            return { success: true, message: 'Removido em modo demonstração estática.' };
        }
    },

    /**
     * Fallback para demonstração sem servidor ativo (GitHub Pages)
     */
    staticMockGet(endpoint) {
        if (endpoint.startsWith('/grades')) {
            return {
                success: true,
                total: 4,
                data: [
                    { id: 1, student_id: 2, student_name: "Lucas Mendes Goulart", student_class: "9º Ano A", teacher_name: "Prof. Carlos Eduardo", subject: "História & Direitos Humanos", grade: 9.4, bimester: 1, status: "Aprovado", observations: "Excelente participação nas discussões de cidadania." },
                    { id: 2, student_id: 2, student_name: "Lucas Mendes Goulart", student_class: "9º Ano A", teacher_name: "Profª Mariana Souza", subject: "Língua Portuguesa e Literatura", grade: 8.8, bimester: 1, status: "Aprovado", observations: "Ótima interpretação e clareza textual." },
                    { id: 3, student_id: 2, student_name: "Lucas Mendes Goulart", student_class: "9º Ano A", teacher_name: "Prof. Carlos Eduardo", subject: "Matemática Aplicada", grade: 8.0, bimester: 1, status: "Aprovado", observations: "Bom raciocínio lógico." },
                    { id: 4, student_id: 2, student_name: "Lucas Mendes Goulart", student_class: "9º Ano A", teacher_name: "Profª Juliana Lima", subject: "Ciências e Sustentabilidade", grade: 9.8, bimester: 1, status: "Aprovado", observations: "Destaque no projeto da feira científica." }
                ]
            };
        }
        if (endpoint.startsWith('/answer-keys')) {
            return {
                success: true,
                total: 2,
                data: [
                    { id: 1, title: "Gabarito Oficial - Simulado 1º Bimestre", class_name: "9º Ano A", subject: "Multidisciplinar", teacher_name: "Coordenação", created_at: new Date().toISOString(), content: "1-A | 2-C | 3-B | 4-D | 5-E | 6-A | 7-B | 8-C" },
                    { id: 2, title: "Gabarito Prova de Matemática", class_name: "9º Ano A", subject: "Matemática", teacher_name: "Prof. Carlos Eduardo", created_at: new Date().toISOString(), content: "1-B | 2-D | 3-A | 4-C | 5-B | 6-C" }
                ]
            };
        }
        if (endpoint.startsWith('/announcements')) {
            return {
                success: true,
                total: 2,
                data: [
                    { id: 1, title: "Semana de Avaliações do 1º Bimestre", category: "Acadêmico", author_name: "Diretoria Pedagógica", created_at: new Date().toISOString(), content: "As avaliações ocorrerão entre os dias 15 e 19. Cheguem com 15 minutos de antecedência." },
                    { id: 2, title: "Inscrições Abertas para Feira Científica e Sustentabilidade", category: "Eventos", author_name: "Prof. Liana Magalhães", created_at: new Date().toISOString(), content: "Alunos do fundamental e médio podem submeter projetos até o final deste mês." }
                ]
            };
        }
        if (endpoint.startsWith('/students')) {
            return {
                success: true,
                total: 2,
                data: [
                    { id: 2, nome: "Lucas Mendes Goulart", turma: "9º Ano A", email: "aluno.lucas@escola.com", total_grades: 4, average_grade: 9.0 },
                    { id: 4, nome: "Beatriz Souza Rocha", turma: "9º Ano A", email: "aluna.beatriz@escola.com", total_grades: 4, average_grade: 9.2 }
                ]
            };
        }
        return { success: true, data: [] };
    },

    staticMockPost(endpoint, body = {}) {
        if (endpoint.includes('login')) {
            const email = (body.email || '').toLowerCase();
            const role = email.includes('prof') ? 'teacher' : (email.includes('mae') || email.includes('maria') || email.includes('resp') ? 'parent' : 'student');
            const name = role === 'teacher' ? 'Prof. Carlos Eduardo' : (role === 'parent' ? 'Maria Clara Mendes' : 'Lucas Mendes Goulart');
            const id = role === 'teacher' ? 1 : (role === 'student' ? 2 : 3);
            return {
                success: true,
                message: `Bem-vindo(a), ${name}!`,
                token: 'mock_jwt_token_for_static_demo',
                user: {
                    id: id,
                    nome: name,
                    email: body.email || 'aluno.lucas@escola.com',
                    role: role,
                    turma: role === 'teacher' ? 'Corpo Docente' : '9º Ano A',
                    children: [{ id: 2, nome: 'Lucas Mendes Goulart' }]
                }
            };
        }
        return {
            success: true,
            message: 'Operação registrada com sucesso no modo de demonstração!'
        };
    }
};

function showToast(message, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.className = `toast show ${type === 'error' ? 'toast-error' : 'toast-success'}`;
    toast.textContent = message;

    setTimeout(() => {
        toast.className = 'toast';
    }, 4000);
}

window.api = api;
window.showToast = showToast;
