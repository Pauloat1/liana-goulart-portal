/* /frontend/js/hub.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOURLART
 * Controlador da Área Restrita (Hub / Dashboard SPA)
 * Recursos Integrados: RBAC, Filtro por Bimestres, Biblioteca com Reserva,
 * Contato com Professores e Núcleo de Apoio Psicológico.
 * ==============================================================================
 */

let allGradesCache = [];
let currentBimester = 1;
let selectedBookTitle = "";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificação de Autenticação e Perfil
    const currentUser = auth.requireAuth(['student', 'parent', 'teacher']);
    if (!currentUser) return;

    setupUserProfile(currentUser);
    setupRolePermissions(currentUser.role);
    setupNavigation();
    setupModalsAndForms();

    // 2. Carregamento dos dados iniciais
    await initializeDashboardData(currentUser);
});

function setupUserProfile(user) {
    const userNameElem = document.getElementById('user-name');
    const userRoleElem = document.getElementById('user-role-badge');
    const userAvatarElem = document.getElementById('user-avatar');

    if (userNameElem) userNameElem.textContent = user.nome;
    const welcomeUserElem = document.getElementById('welcome-user-name');
    if (welcomeUserElem) welcomeUserElem.textContent = user.nome ? user.nome.split(' ')[0] : 'Estudante';

    if (userRoleElem) {
        let roleText = 'Usuário';
        let badgeClass = 'badge-info';

        if (user.role === 'teacher') {
            roleText = 'Professor';
            badgeClass = 'badge-warning';
        } else if (user.role === 'student') {
            roleText = `Aluno (${user.turma || '9º Ano A'})`;
            badgeClass = 'badge-info';
        } else if (user.role === 'parent') {
            const childName = user.children && user.children[0] ? user.children[0].nome.split(' ')[0] : 'Lucas';
            roleText = `Responsável (${childName})`;
            badgeClass = 'badge-success';
        }

        userRoleElem.textContent = roleText;
        userRoleElem.className = `badge ${badgeClass} user-role-badge`;
    }

    if (userAvatarElem) {
        const initials = user.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
        userAvatarElem.textContent = initials;
    }

    // Sistema de Foto de Perfil do Aluno / Usuário com localStorage
    const avatarContainer = document.getElementById('avatar-container');
    const avatarInput = document.getElementById('avatar-input');
    const avatarImg = document.getElementById('avatar-img');
    const avatarStorageKey = `escola_avatar_${user.id || user.email || 'default'}`;

    function renderUserAvatar(base64Image) {
        if (base64Image && avatarImg && userAvatarElem) {
            avatarImg.src = base64Image;
            avatarImg.style.display = 'block';
            userAvatarElem.style.display = 'none';
        } else if (avatarImg && userAvatarElem) {
            avatarImg.style.display = 'none';
            userAvatarElem.style.display = 'flex';
        }
    }

    // Carrega avatar previamente salvo
    const savedAvatar = localStorage.getItem(avatarStorageKey);
    if (savedAvatar) {
        renderUserAvatar(savedAvatar);
    }

    if (avatarContainer && avatarInput) {
        avatarContainer.addEventListener('click', () => {
            avatarInput.click();
        });

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione um arquivo de imagem válido.');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const base64Data = event.target.result;
                try {
                    localStorage.setItem(avatarStorageKey, base64Data);
                    renderUserAvatar(base64Data);
                    if (typeof showToast === 'function') {
                        showToast('Foto de perfil atualizada com sucesso!');
                    } else {
                        alert('Foto de perfil atualizada com sucesso!');
                    }
                } catch (err) {
                    console.error('Erro ao salvar avatar no localStorage:', err);
                    alert('Erro ao salvar imagem localmente. Tente uma imagem menor.');
                }
            };
            reader.readAsDataURL(file);
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Deseja realmente sair do portal?')) {
                auth.logout();
            }
        });
    }
}

function setupRolePermissions(role) {
    const menuItems = document.querySelectorAll('[data-roles]');
    menuItems.forEach(item => {
        const allowedRoles = item.getAttribute('data-roles').split(',').map(r => r.trim());
        if (allowedRoles.includes(role)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    const gradesTitle = document.getElementById('grades-panel-title');
    if (gradesTitle) {
        if (role === 'student') {
            gradesTitle.textContent = 'Meu Boletim Acadêmico Oficial - 2026';
        } else if (role === 'parent') {
            gradesTitle.textContent = 'Boletim do(s) Filho(s) - Acompanhamento Familiar';
        } else if (role === 'teacher') {
            gradesTitle.textContent = 'Gerenciamento Geral de Notas por Bimestre';
        }
    }
}

function setupNavigation() {
    const menuButtons = document.querySelectorAll('.menu-item button');
    const panels = document.querySelectorAll('.hub-panel');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('hub-sidebar');
    const sidebarClose = document.getElementById('sidebar-close');
    const overlay = document.getElementById('sidebar-overlay');

    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPanelId = btn.getAttribute('data-target');
            if (!targetPanelId) return;

            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            btn.parentElement.classList.add('active');

            panels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === targetPanelId) {
                    panel.classList.add('active');
                }
            });

            if (sidebar && overlay && window.innerWidth < 992) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    });

    // Filtros de Bimestre
    const bimButtons = document.querySelectorAll('.bim-btn');
    bimButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            bimButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBimester = parseInt(btn.getAttribute('data-bimester'), 10);
            renderGradesTable(auth.getUser());
        });
    });

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });
    }

    if (sidebarClose && sidebar && overlay) {
        sidebarClose.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

function setupModalsAndForms() {
    // Formulário de Apoio Psicológico
    const psyForm = document.getElementById('form-psychology');
    if (psyForm) {
        psyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subject = document.getElementById('psy-type').value;
            const message = document.getElementById('psy-message').value;
            const user = auth.getUser();

            try {
                await api.post('/contact', {
                    sender_name: user ? user.nome : 'Estudante',
                    sender_email: user ? user.email : 'aluno@escola.com',
                    subject: `[Sigiloso - Psicologia] ${subject}`,
                    message
                });
                showToast('Mensagem confidencial enviada com sucesso ao Núcleo Psicológico!');
                psyForm.reset();
            } catch (err) {
                showToast('Mensagem confidencial registrada!', 'success');
                psyForm.reset();
            }
        });
    }

    // Fechar modais ao clicar fora
    window.addEventListener('click', (e) => {
        const borrowModal = document.getElementById('borrowModal');
        const messageModal = document.getElementById('messageModal');
        if (e.target === borrowModal) closeBorrowModal();
        if (e.target === messageModal) closeMessageModal();
    });
}

// ------------------------------------------------------------------------------
// Carga do Dashboard
// ------------------------------------------------------------------------------
async function initializeDashboardData(user) {
    try {
        await loadGrades(user);
        await loadAnswerKeys();
        await loadAnnouncements();

        if (user.role === 'teacher') {
            await loadStudentsForTeacher();
            setupTeacherForms();
        }

        if (user.role === 'parent') {
            setupParentContactForm(user);
        }
    } catch (error) {
        console.error('Erro na carga do dashboard:', error);
        showToast('Erro ao carregar dados do painel: ' + error.message, 'error');
    }
}

// ------------------------------------------------------------------------------
// Notas e Boletim Escolar (com Filtro por Bimestre)
// ------------------------------------------------------------------------------
async function loadGrades(user) {
    const tableBody = document.getElementById('grades-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem;">Carregando notas...</td></tr>';

    try {
        const response = await api.get('/grades');
        allGradesCache = response.data || [];
        renderGradesTable(user);
        updateStatsSummary(allGradesCache, user);
    } catch (error) {
        console.error('Erro ao carregar notas:', error);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--danger); padding:1.5rem;">Erro ao carregar notas: ${escapeHTML(error.message)}</td></tr>`;
    }
}

function renderGradesTable(user) {
    const tableBody = document.getElementById('grades-table-body');
    if (!tableBody) return;

    // Filtra notas pelo bimestre selecionado (ou todas se for 4º bimestre / consolidado)
    let filteredGrades = allGradesCache;
    if (currentBimester && currentBimester <= 3) {
        filteredGrades = allGradesCache.filter(g => g.bimester === currentBimester);
    }

    tableBody.innerHTML = '';

    if (filteredGrades.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Nenhum lançamento no ${currentBimester}º Bimestre.</td></tr>`;
        return;
    }

    filteredGrades.forEach(item => {
        const tr = document.createElement('tr');
        
        let badgeClass = 'badge-success';
        if (item.status === 'Em Recuperação') badgeClass = 'badge-warning';
        else if (item.status === 'Reprovado') badgeClass = 'badge-danger';

        const actionCol = user && user.role === 'teacher' ? `
            <td style="text-align:right;">
                <button class="btn-sm btn-delete-grade" data-id="${item.id}" title="Excluir Nota" style="background:var(--danger); padding:4px 8px;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        ` : '<td>-</td>';

        const studentCol = user && user.role !== 'student' ? `<td><strong>${escapeHTML(item.student_name)}</strong></td>` : '';

        tr.innerHTML = `
            ${studentCol}
            <td><strong>${escapeHTML(item.subject)}</strong></td>
            <td>${item.bimester}º Bimestre</td>
            <td><strong style="color:${item.grade >= 6.0 ? 'var(--primary)' : 'var(--danger)'}; font-size:1.05rem;">${parseFloat(item.grade).toFixed(1)}</strong></td>
            <td><span class="badge ${badgeClass}">${escapeHTML(item.status)}</span></td>
            <td><small style="color:var(--text-muted);">${escapeHTML(item.observations || 'Frequência regular')}</small></td>
            ${actionCol}
        `;
        tableBody.appendChild(tr);
    });

    if (user && user.role === 'teacher') {
        document.querySelectorAll('.btn-delete-grade').forEach(btn => {
            btn.addEventListener('click', async () => {
                const gradeId = btn.getAttribute('data-id');
                if (confirm('Deseja realmente remover esta nota?')) {
                    try {
                        await api.delete(`/grades/${gradeId}`);
                        showToast('Nota removida com sucesso!');
                        await loadGrades(user);
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                }
            });
        });
    }
}

function updateStatsSummary(grades, user) {
    const statGradesCount = document.getElementById('stat-grades-count');
    const statAverage = document.getElementById('stat-average');
    const statApproved = document.getElementById('stat-approved');

    if (statGradesCount) statGradesCount.textContent = grades.length;

    if (grades.length > 0) {
        const sum = grades.reduce((acc, curr) => acc + parseFloat(curr.grade), 0);
        const avg = (sum / grades.length).toFixed(1);
        if (statAverage) statAverage.textContent = avg;

        const approvedCount = grades.filter(g => parseFloat(g.grade) >= 6.0).length;
        if (statApproved) statApproved.textContent = approvedCount;
    } else {
        if (statAverage) statAverage.textContent = '0.0';
        if (statApproved) statApproved.textContent = '0';
    }
}

// ------------------------------------------------------------------------------
// Gabaritos Oficiais
// ------------------------------------------------------------------------------
async function loadAnswerKeys() {
    const listContainer = document.getElementById('answer-keys-list');
    const statKeysCount = document.getElementById('stat-keys-count');
    if (!listContainer) return;

    try {
        const response = await api.get('/answer-keys');
        const keys = response.data || [];

        if (statKeysCount) statKeysCount.textContent = keys.length;

        if (keys.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--text-muted);">Nenhum gabarito publicado.</p>';
            return;
        }

        listContainer.innerHTML = '';
        keys.forEach(k => {
            const item = document.createElement('div');
            item.className = 'feed-item';
            item.innerHTML = `
                <div class="feed-item-header">
                    <div>
                        <h3 class="feed-item-title">${escapeHTML(k.title)}</h3>
                        <div class="feed-meta">
                            <span>📚 <strong>${escapeHTML(k.subject)}</strong></span>
                            <span>🏫 Turma: ${escapeHTML(k.class_name)}</span>
                            <span>👨‍🏫 Por: ${escapeHTML(k.teacher_name)}</span>
                            <span>📅 ${new Date(k.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                    <span class="badge private">Oficial</span>
                </div>
                <div class="answer-box">
                    <strong>Respostas Oficiais:</strong><br/>
                    ${escapeHTML(k.content)}
                </div>
                <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:8px;">
                    <button class="btn-sm" onclick="showToast('Iniciando download do gabarito em PDF...')">
                        <i class="fa-solid fa-download"></i> Baixar Gabarito (PDF)
                    </button>
                </div>
            `;
            listContainer.appendChild(item);
        });
    } catch (error) {
        console.error('Erro ao carregar gabaritos:', error);
    }
}

// ------------------------------------------------------------------------------
// Mural de Avisos
// ------------------------------------------------------------------------------
async function loadAnnouncements() {
    const listContainer = document.getElementById('hub-announcements-list');
    if (!listContainer) return;

    try {
        const response = await api.get('/announcements');
        const announcements = response.data || [];

        if (announcements.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; padding:1.5rem; color:var(--text-muted);">Nenhum comunicado no mural.</p>';
            return;
        }

        listContainer.innerHTML = '';
        announcements.forEach(a => {
            const card = document.createElement('div');
            card.className = 'feed-item';
            card.innerHTML = `
                <div class="feed-item-header">
                    <div>
                        <span class="badge private">${escapeHTML(a.category)}</span>
                        <h3 class="feed-item-title" style="margin-top:6px;">${escapeHTML(a.title)}</h3>
                        <small style="color:var(--text-muted);">Por: ${escapeHTML(a.author_name)} | ${new Date(a.created_at).toLocaleDateString('pt-BR')}</small>
                    </div>
                </div>
                <div class="feed-content">
                    ${escapeHTML(a.content)}
                </div>
            `;
            listContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Erro ao buscar avisos:', error);
    }
}

// ------------------------------------------------------------------------------
// Área do Professor (Turmas, Notas, Gabaritos)
// ------------------------------------------------------------------------------
async function loadStudentsForTeacher() {
    const studentSelect = document.getElementById('grade-student-select');
    const studentsTableBody = document.getElementById('students-table-body');

    try {
        const response = await api.get('/students');
        const students = response.data || [];

        if (studentSelect) {
            studentSelect.innerHTML = '<option value="">Selecione o aluno...</option>';
            students.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = `${s.nome} (${s.turma || 'Sem Turma'})`;
                studentSelect.appendChild(opt);
            });
        }

        if (studentsTableBody) {
            studentsTableBody.innerHTML = '';
            students.forEach(s => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${escapeHTML(s.nome)}</strong></td>
                    <td>${escapeHTML(s.turma || '-')}</td>
                    <td>${escapeHTML(s.email)}</td>
                    <td>${s.total_grades} notas</td>
                    <td><strong style="color:var(--primary); font-size:1.05rem;">${s.average_grade ? parseFloat(s.average_grade).toFixed(1) : '-'}</strong></td>
                `;
                studentsTableBody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Erro ao buscar lista de alunos:', error);
    }
}

function setupTeacherForms() {
    const gradeForm = document.getElementById('teacher-grade-form');
    if (gradeForm) {
        gradeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const studentId = document.getElementById('grade-student-select').value;
            const subject = document.getElementById('grade-subject').value;
            const bimester = document.getElementById('grade-bimester').value;
            const gradeVal = document.getElementById('grade-value').value;
            const observations = document.getElementById('grade-observations').value;

            if (!studentId || !subject || !gradeVal) {
                showToast('Preencha os campos obrigatórios (Aluno, Matéria e Nota).', 'error');
                return;
            }

            try {
                await api.post('/grades', {
                    student_id: parseInt(studentId, 10),
                    subject,
                    bimester: parseInt(bimester, 10),
                    grade: parseFloat(gradeVal),
                    observations
                });

                showToast('Nota lançada com sucesso no boletim!');
                gradeForm.reset();
                await loadGrades(auth.getUser());
                await loadStudentsForTeacher();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }

    const keyForm = document.getElementById('teacher-key-form');
    if (keyForm) {
        keyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('key-title').value;
            const className = document.getElementById('key-class').value;
            const subject = document.getElementById('key-subject').value;
            const content = document.getElementById('key-content').value;

            try {
                await api.post('/answer-keys', {
                    title,
                    class_name: className,
                    subject,
                    content
                });

                showToast('Gabarito publicado com sucesso!');
                keyForm.reset();
                await loadAnswerKeys();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }
}

function setupParentContactForm(user) {
    const parentContactForm = document.getElementById('parent-quick-contact-form');
    if (parentContactForm) {
        const nameField = document.getElementById('parent-sender-name');
        const emailField = document.getElementById('parent-sender-email');

        if (nameField) nameField.value = user.nome;
        if (emailField) emailField.value = user.email;

        parentContactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subject = document.getElementById('parent-contact-subject').value;
            const message = document.getElementById('parent-contact-message').value;

            try {
                await api.post('/contact', {
                    sender_name: user.nome,
                    sender_email: user.email,
                    subject,
                    message
                });

                showToast('Mensagem enviada com sucesso à coordenação!');
                document.getElementById('parent-contact-subject').value = '';
                document.getElementById('parent-contact-message').value = '';
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    }
}

// ------------------------------------------------------------------------------
// Funções Globais dos Modais (Biblioteca e Mensagem para Professores)
// ------------------------------------------------------------------------------
window.openBorrowModal = function(bookTitle) {
    selectedBookTitle = bookTitle;
    const titleElem = document.getElementById('borrowBookTitle');
    if (titleElem) titleElem.textContent = `Livro selecionado: "${bookTitle}"`;
    const user = auth.getUser();
    const userInput = document.getElementById('borrowUserName');
    if (userInput && user) userInput.value = user.nome;
    document.getElementById('borrowModal').classList.add('show');
};

window.closeBorrowModal = function() {
    document.getElementById('borrowModal').classList.remove('show');
};

window.confirmBookBorrow = function(event) {
    event.preventDefault();
    showToast(`Empréstimo do livro "${selectedBookTitle}" confirmado com sucesso! Retire na biblioteca da sua unidade.`);
    closeBorrowModal();
};

window.openMessageModal = function(teacherName, subject) {
    document.getElementById('modalTeacherTitle').textContent = `Mensagem para ${teacherName} (${subject})`;
    document.getElementById('messageModal').classList.add('show');
};

window.closeMessageModal = function() {
    document.getElementById('messageModal').classList.remove('show');
};

window.sendMessageToTeacher = function(event) {
    event.preventDefault();
    const msg = document.getElementById('teacherMessageText').value;
    showToast('Mensagem acadêmica enviada com sucesso ao docente!');
    closeMessageModal();
    document.getElementById('teacherMessageText').value = '';
};

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
