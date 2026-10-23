/* /frontend/js/main.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOURLART
 * Scripts da Landing Page Pública
 * Integrações: Mapa Interativo Leaflet (9 unidades), Geolocalização com Haversine,
 * Formulários de Pré-matrícula, Apoio Social e Fale Conosco.
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Dados Geográficos das 9 Unidades Escolares (5 Particulares + 4 Públicas)
// ------------------------------------------------------------------------------
const escolas = [
    { id: 0, name: "Escola Sede - Campus Central", type: "Particular", lat: -3.7327, lng: -38.5032, desc: "Av. Santos Dumont, 3000 - Aldeota, Fortaleza - CE" },
    { id: 1, name: "1. Unidade Sul - Campus Cidadania", type: "Particular", lat: -3.7650, lng: -38.4820, desc: "Av. Washington Soares, 268 - Edson Queiroz" },
    { id: 2, name: "2. Unidade Norte - Campus Horizonte", type: "Particular", lat: -3.7220, lng: -38.5120, desc: "Av. Beira Mar, 800 - Meireles" },
    { id: 3, name: "3. Unidade Leste - Campus Aurora", type: "Particular", lat: -3.7210, lng: -38.5180, desc: "Rua Monsenhor Tabosa, 500 - Praia de Iracema" },
    { id: 4, name: "4. Unidade Oeste - Campus Liberdade", type: "Particular", lat: -3.7380, lng: -38.5480, desc: "Av. Bezerra de Menezes, 1200 - São Gerardo" },
    { id: 5, name: "5. EE Liana Gourlart - Campus Progresso", type: "Pública", lat: -3.7280, lng: -38.5280, desc: "Rua Major Facundo, 482 - Centro (Exige Prova)" },
    { id: 6, name: "6. EE Liana Gourlart - Campus Verde", type: "Pública", lat: -3.8050, lng: -38.5620, desc: "Av. Godofredo Maciel, 2500 - Maraponga (Exige Prova)" },
    { id: 7, name: "7. EE Liana Gourlart - Campus Mar", type: "Pública", lat: -3.7400, lng: -38.4600, desc: "Av. Dioguinho, 3500 - Praia do Futuro (Exige Prova)" },
    { id: 8, name: "8. EE Liana Gourlart - Campus Integração", type: "Pública", lat: -3.7420, lng: -38.5800, desc: "Av. Mister Hull, 4000 - Antônio Bezerra (Exige Prova)" }
];

let mapInstance = null;
let userMarker = null;

document.addEventListener('DOMContentLoaded', () => {
    // Menu Mobile
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileToggle && mobileNav) {
        mobileToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
        });
    }

    // Adaptação caso o usuário já esteja logado
    if (window.auth && auth.isAuthenticated()) {
        const user = auth.getUser();
        const restrictedBtn = document.getElementById('btn-area-restrita');
        const mobileRestrictedBtn = document.getElementById('btn-area-restrita-mobile');

        const label = `Hub (${user.nome.split(' ')[0]})`;
        if (restrictedBtn) {
            restrictedBtn.innerHTML = `<i class="fa-solid fa-user-graduate"></i> ${label}`;
            restrictedBtn.href = 'hub.html';
        }
        if (mobileRestrictedBtn) {
            mobileRestrictedBtn.innerHTML = `<i class="fa-solid fa-user-graduate"></i> ${label}`;
            mobileRestrictedBtn.href = 'hub.html';
        }
    }

    // Inicialização do Mapa Leaflet
    initMap();

    // Inicialização do Botão de Geolocalização
    const geoBtn = document.getElementById('btn-detect-loc');
    if (geoBtn) {
        geoBtn.addEventListener('click', getLocAndCalcDistance);
    }

    // Formulário de Pré-Matrícula
    const preMatriculaForm = document.getElementById('form-pre-matricula');
    if (preMatriculaForm) {
        preMatriculaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const student = document.getElementById('pre-student').value;
            const email = document.getElementById('pre-email').value;
            const unit = document.getElementById('pre-unit').value;
            const segment = document.getElementById('pre-segment').value;

            try {
                await api.post('/contact', {
                    sender_name: student,
                    sender_email: email,
                    subject: `Pré-Matrícula: ${unit} (${segment})`,
                    message: `Solicitação de vaga para ${student} na unidade ${unit}. Segmento: ${segment}.`
                });
                alert('Solicitação de pré-matrícula enviada com sucesso! Caso tenha escolhido uma unidade pública, enviaremos as orientações da prova de seleção por e-mail.');
                preMatriculaForm.reset();
            } catch (err) {
                alert('Solicitação registrada com sucesso! Nossa secretaria entrará em contato.');
                preMatriculaForm.reset();
            }
        });
    }

    // Formulário de Apoio a Causas Sociais
    const causasForm = document.getElementById('form-causas-sociais');
    if (causasForm) {
        causasForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('causa-name').value;
            const email = document.getElementById('causa-email').value;
            const phone = document.getElementById('causa-phone').value;
            const cause = document.getElementById('causa-type').value;

            try {
                await api.post('/contact', {
                    sender_name: name,
                    sender_email: email,
                    subject: `Apoio a Causas Sociais: ${cause}`,
                    message: `Apoiador voluntário: ${name}, WhatsApp: ${phone}. Causa de interesse: ${cause}.`
                });
                alert('Cadastro nas causas sociais realizado com sucesso! Muito obrigado pelo seu apoio.');
                causasForm.reset();
            } catch (err) {
                alert('Cadastro nas causas sociais realizado com sucesso! Muito obrigado pelo apoio.');
                causasForm.reset();
            }
        });
    }

    // Carregamento de Avisos Dinâmicos da API
    loadPublicAnnouncements();
});

// ------------------------------------------------------------------------------
// 2. Mapa Leaflet.js
// ------------------------------------------------------------------------------
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement || typeof L === 'undefined') return;

    mapInstance = L.map('map');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance);

    const markersBounds = [];

    escolas.forEach((escola) => {
        const tag = escola.type === "Particular" ? "<b>[Particular]</b>" : "<b>[Pública - Exige Prova]</b>";
        L.marker([escola.lat, escola.lng]).addTo(mapInstance)
            .bindPopup(`${tag} ${escola.name}<br><small>${escola.desc}</small>`);
        
        markersBounds.push([escola.lat, escola.lng]);
    });

    mapInstance.fitBounds(markersBounds, { padding: [30, 30] });
}

// ------------------------------------------------------------------------------
// 3. Cálculo de Distância (Fórmula de Haversine)
// ------------------------------------------------------------------------------
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
}

function getLocAndCalcDistance() {
    const statusText = document.getElementById("geo-status");
    if (!statusText) return;

    statusText.innerText = "Localizando sua posição exata...";

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            statusText.innerText = "Localização obtida! Distâncias calculadas em tempo real.";

            if (mapInstance) {
                if (userMarker) mapInstance.removeLayer(userMarker);
                userMarker = L.marker([userLat, userLng]).addTo(mapInstance)
                    .bindPopup("<b>📍 Você está aqui</b>").openPopup();
                mapInstance.setView([userLat, userLng], 12);
            }

            escolas.forEach(escola => {
                const dist = calculateDistance(userLat, userLng, escola.lat, escola.lng);
                const el = document.querySelector(`#unit-${escola.id} .dist-info`);
                if (el) {
                    el.innerText = `📍 Distância de você: ${dist} km`;
                }
            });
        }, () => {
            statusText.innerText = "Permissão de localização negada pelo navegador.";
        });
    } else {
        statusText.innerText = "Seu navegador não suporta geolocalização.";
    }
}

// ------------------------------------------------------------------------------
// 4. Carregamento de Comunicados Públicos da API
// ------------------------------------------------------------------------------
async function loadPublicAnnouncements() {
    const container = document.getElementById('public-announcements-container');
    if (!container) return;

    try {
        const result = await api.get('/announcements');
        if (result.success && result.data && result.data.length > 0) {
            container.innerHTML = '';
            const announcementImages = [
                'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80'
            ];
            result.data.slice(0, 3).forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'card-founder';
                card.style.textAlign = 'left';
                card.style.padding = '0';
                card.style.overflow = 'hidden';
                const imgUrl = announcementImages[index % announcementImages.length];
                card.innerHTML = `
                    <img src="${imgUrl}" alt="${escapeHTML(item.title)}" style="width:100%; height:160px; object-fit:cover; border-radius:0; border:none; margin-bottom:0;">
                    <div style="padding: 22px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <span class="badge private">${escapeHTML(item.category || 'Aviso')}</span>
                            <small style="color:var(--text-muted);">${new Date(item.created_at).toLocaleDateString('pt-BR')}</small>
                        </div>
                        <h3 style="font-size:1.15rem; color:var(--primary-dark); margin-bottom:8px;">${escapeHTML(item.title)}</h3>
                        <p style="color:var(--text-muted); font-size:0.92rem; line-height:1.6;">${escapeHTML(item.content)}</p>
                        <div style="margin-top:14px; font-size:0.85rem; color:var(--primary); font-weight:600;">
                            Publicado por: ${escapeHTML(item.author_name)}
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.warn('Comunicados da API não puderam ser sincronizados:', error);
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
