/* /frontend/js/auth.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Módulo de Autenticação e Gerenciamento de Sessão (Auth)
 * ==============================================================================
 */

const auth = {
    /**
     * Realiza o login do usuário na API
     * @param {string} email 
     * @param {string} senha 
     * @returns {Promise<Object>}
     */
    async login(email, senha) {
        try {
            const result = await api.post('/login', { email, senha });

            if (result.success && result.token) {
                // Persistência da sessão localmente
                localStorage.setItem('escola_token', result.token);
                localStorage.setItem('escola_user', JSON.stringify(result.user));
                return result;
            } else {
                throw new Error(result.message || 'Falha ao autenticar.');
            }
        } catch (error) {
            throw error;
        }
    },

    /**
     * Encerra a sessão atual e redireciona
     */
    logout() {
        localStorage.removeItem('escola_token');
        localStorage.removeItem('escola_user');
        window.location.href = 'login.html';
    },

    /**
     * Retorna os dados do usuário atualmente autenticado
     * @returns {Object|null}
     */
    getUser() {
        const userStr = localStorage.getItem('escola_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    },

    /**
     * Verifica se há um usuário autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('escola_token') && !!this.getUser();
    },

    /**
     * Garante que o usuário está autenticado e possui o perfil exigido
     * @param {Array<string>} allowedRoles 
     */
    requireAuth(allowedRoles = []) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return null;
        }

        const user = this.getUser();
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            alert(`Acesso Restrito: Seu perfil (${user.role}) não tem permissão para visualizar esta página.`);
            window.location.href = 'index.html';
            return null;
        }

        return user;
    }
};

// ==============================================================================
// Inicialização do Formulário de Login (login.html)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    // Se estiver na página de login e já houver sessão ativa, vai direto para o hub
    if (loginForm && auth.isAuthenticated()) {
        const user = auth.getUser();
        if (user) {
            window.location.href = 'hub.html';
            return;
        }
    }

    if (loginForm) {
        const emailInput = document.getElementById('email');
        const senhaInput = document.getElementById('senha');
        const submitBtn = document.getElementById('login-btn');
        const errorAlert = document.getElementById('login-error');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();

            if (!email || !senha) {
                showError('Por favor, informe seu e-mail e sua senha.');
                return;
            }

            // Estado de carregamento no botão
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Entrando...</span>';
            hideError();

            try {
                const response = await auth.login(email, senha);
                // Redireciona com sucesso para o Hub do Portal
                window.location.href = 'hub.html';
            } catch (error) {
                console.error('Erro no login:', error);
                showError(error.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });

        function showError(msg) {
            if (errorAlert) {
                errorAlert.textContent = msg;
                errorAlert.style.display = 'block';
            } else {
                alert(msg);
            }
        }

        function hideError() {
            if (errorAlert) {
                errorAlert.style.display = 'none';
            }
        }

        // Suporte aos botões de preenchimento rápido (Demo Cards)
        const demoBtns = document.querySelectorAll('.btn-demo-fill');
        demoBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.getAttribute('data-email');
                const pass = btn.getAttribute('data-pass');
                if (emailInput && senhaInput) {
                    emailInput.value = email;
                    senhaInput.value = pass;
                    hideError();
                }
            });
        });
    }
});

window.auth = auth;
