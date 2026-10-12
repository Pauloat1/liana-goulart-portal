# 🎓 Escola Liana Gourlart - Portal Educacional Integrado

> **Educação Transformadora, Inclusiva e Humana.**  
> Hub responsivo de gestão escolar que centraliza funções públicas e restritas para a rede de 9 unidades escolares (5 particulares e 4 públicas de referência) em Fortaleza - CE.

---

## 🌟 Visão Geral do Projeto

O **Portal da Escola Liana Gourlart** foi desenvolvido utilizando uma arquitetura cliente-servidor tradicional, estritamente modular e limpa (**Clean Code**). Ele une a rica identidade visual do protótipo original (história das fundadoras, mapa interativo de 9 unidades escolares, compromisso com acessibilidade PCD e inclusão LGBT+, acervo bibliotecário e núcleo de apoio psicológico) com um backend robusto em Node.js com controle de acesso baseado em perfis (**RBAC**) e banco de dados relacional com proteção contra SQL Injection.

---

## 🚀 Tecnologias Utilizadas

### Frontend (100% Vanilla - Sem Frameworks)
- **HTML5 Semântico:** Estruturação acessível com tags semânticas (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).
- **CSS3 Puro:** Variáveis CSS (`:root`), Flexbox, CSS Grid, animações fluidas e design totalmente responsivo (*Mobile-first*).
- **JavaScript Vanilla:** Manipulação da DOM sem dependências, consumo de APIs com `fetch()`, tratamento de erros e gerenciamento de estado.
- **Leaflet.js & OpenStreetMap:** Mapa interativo em tempo real com marcação das 9 unidades escolares e cálculo de geolocalização com fórmula de Haversine.
- **Google Fonts (Poppins) & Font Awesome 6.4.0:** Tipografia institucional e ícones modernos.

### Backend & Banco de Dados
- **Node.js & Express.js:** API REST modularizada com roteamento desacoplado.
- **SQLite3 / SQL Padrão:** Banco de dados relacional com **Prepared Statements** (parâmetros posicionais `?` para prevenção de SQL Injection).
- **JWT (JSON Web Token):** Autenticação stateless com verificação de perfil RBAC.
- **Bcryptjs:** Criptografia de senhas com salting.
- **Cors & Body-Parser:** Tratamento de requisições cross-origin e payloads JSON.

---

## 📂 Estrutura de Diretórios

```text
projeto-escola/
├── database/
│   ├── schema.sql           # DDL: Criação das tabelas (users, grades, answer_keys, etc.)
│   └── seed.sql             # DML: Massa de dados de teste (usuários, notas, gabaritos)
├── backend/
│   ├── server.js            # Inicialização do Express e middlewares
│   ├── db/
│   │   └── index.js         # Conexão SQLite e abstração de Prepared Statements
│   ├── middleware/
│   │   └── auth.js          # Middlewares de autenticação JWT e validação RBAC
│   ├── controllers/         # Regras de negócio desacopladas
│   │   ├── authController.js
│   │   ├── gradesController.js
│   │   ├── keysController.js
│   │   ├── announcementsController.js
│   │   ├── contactController.js
│   │   └── studentsController.js
│   └── routes/              # Roteadores modulares da API REST
│       ├── auth.js
│       ├── grades.js
│       ├── keys.js
│       ├── announcements.js
│       ├── contact.js
│       └── students.js
├── frontend/
│   ├── css/
│   │   ├── styles.css       # Estilos globais, tipografia Poppins, mapa e modais
│   │   └── dashboard.css    # Estilos do Hub restrito, tabelas de notas e abas
│   ├── js/
│   │   ├── api.js           # Cliente HTTP fetch (suporte a API e fallback estático)
│   │   ├── auth.js          # Autenticação, sessão (localStorage) e login
│   │   ├── main.js          # Mapa Leaflet, geolocalização e formulários públicos
│   │   └── hub.js           # Lógica do painel restrito, abas de bimestres e modais
│   ├── index.html           # Landing page institucional pública
│   ├── login.html           # Página de login centralizada com preenchimento de teste
│   └── hub.html             # Painel restrito dinâmico por perfil (SPA Vanilla)
├── .gitignore               # Arquivos ignorados para versionamento Git
├── package.json             # Dependências e scripts do Node.js
└── README.md                # Documentação do projeto
```

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 16.x ou superior recomendada)
- **npm** (gerenciador de pacotes)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU-USUARIO/liana_Gportal.git
   cd liana_Gportal/projeto-escola
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```
   *(Ou utilize `npm run dev` para desenvolvimento com reload automático).*

4. **Acesse no navegador:**
   - **Landing Page Pública:** [http://localhost:3000](http://localhost:3000)
   - **Página de Login:** [http://localhost:3000/login.html](http://localhost:3000/login.html)
   - **Hub Restrito:** [http://localhost:3000/hub.html](http://localhost:3000/hub.html)

> 💡 **Nota:** O banco de dados SQLite (`database/escola.db`) é auto-gerado e populado na primeira inicialização a partir dos arquivos `schema.sql` e `seed.sql`. Não requer instalação prévia de SGBDs externos.

---

## 👥 Credenciais de Teste (Perfis RBAC)

A senha padrão para todas as contas no banco inicial é **`senha123`**:

| Perfil | E-mail | Senha | Funcionalidades no Hub |
| :--- | :--- | :--- | :--- |
| **Aluno** | `aluno.lucas@escola.com` | `senha123` | Boletim por bimestre, calendário, livros em PDF, acervo e empréstimo de livros, apoio psicológico, contato com professores e gabaritos. |
| **Professor** | `prof.carlos@escola.com` | `senha123` | Lançar e editar notas, visão de turmas/alunos com médias e publicação de novos gabaritos oficiais. |
| **Responsável** | `maria.mae@escola.com` | `senha123` | Acompanhamento das notas do filho (Lucas), avisos pedagógicos e canal direto com a coordenação. |
| **Visitante** | *(Sem autenticação)* | - | Navegação pública, história, diretoras, mapa das 9 unidades, tabela de mensalidades e pré-matrícula. |

*(Na tela de login há botões de "Preenchimento Rápido" para testar qualquer perfil com apenas um clique).*

---

## 🌐 Instruções de Deploy via GitHub Pages

Como o **GitHub Pages** é uma plataforma de hospedagem de arquivos puramente estáticos (não executa o runtime do Node.js/Express diretamente no servidor), o nosso arquivo `api.js` foi programado com **suporte híbrido inteligente**: ele detecta automaticamente quando está rodando no GitHub Pages e ativa um modo de demonstração funcional (*Mock Fallback*), garantindo que a página inicial, mapa, geolocalização, login e o Hub do aluno abram perfeitamente sem falhas de rede.

### Passo a Passo para o Deploy no GitHub Pages:

1. **Inicialize o repositório Git localmente:**
   ```bash
   git init
   git add .
   git commit -m "feat: portal completo Escola Liana Gourlart com RBAC e Leaflet"
   ```

2. **Crie o repositório no GitHub:**
   - Acesse o GitHub e crie um novo repositório (ex: `liana-goulart-portal`).

3. **Vincule o repositório remoto e faça o push:**
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/liana-goulart-portal.git
   git branch -M main
   git push -u origin main
   ```

4. **Configurar o GitHub Pages:**
   - No GitHub, entre nas configurações do repositório (**Settings**).
   - No menu lateral esquerdo, clique em **Pages**.
   - Na seção **Build and deployment**:
     - Em **Source**, selecione **Deploy from a branch**.
     - Em **Branch**, selecione a branch `main` e a pasta onde se encontram os arquivos estáticos (se a raiz tiver a pasta `/frontend`, você pode apontar para a raiz ou mover os arquivos estáticos para o branch de deploy `gh-pages`).
   - Clique em **Save**.
   - O GitHub irá gerar o link público da sua aplicação (ex: `https://seu-usuario.github.io/liana-goulart-portal/frontend/`).

5. **Para Hospedar a API Completa com Backend Node.js (Full-Stack Gratuito):**
   - Caso queira a API Express e o banco de dados rodando em nuvem com persistência real, faça o deploy gratuito do backend em serviços como **Render**, **Railway** ou **Fly.io** e aponte o `API_BASE_URL` em `frontend/js/api.js` para a URL do seu servidor em nuvem.

---

## 🛡️ Segurança e Padrões de Código

- **SQL Injection Prevention:** 100% das queries utilizam Prepared Statements.
- **XSS Prevention:** Sanitização de strings em renderizações dinâmicas da DOM (`escapeHTML`).
- **Clean Architecture:** Separação estrita de responsabilidades (Rotas $\to$ Controladores $\to$ Banco $\to$ Frontend).
- **Sem Dependências Inline:** Sem tags `<script>` ou `<style>` poluindo o HTML semântico.
