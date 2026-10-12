-- ==============================================================================
-- PROJETO ESCOLA LIANA GOULART
-- Arquivo: /database/schema.sql
-- Descrição: Estrutura do banco de dados relacional (Compatível com SQLite / PostgreSQL)
-- ==============================================================================

-- Habilita chaves estrangeiras no SQLite
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- Tabela: users (Controle de Usuários e Perfis RBAC)
-- Perfis: 'student' (Aluno), 'parent' (Responsável), 'teacher' (Professor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'parent', 'teacher')),
    telefone VARCHAR(20),
    turma VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Tabela: parent_students (Vínculo entre Responsável e Aluno)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    relationship_type VARCHAR(50) DEFAULT 'Responsável Legal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(parent_id, student_id)
);

-- ------------------------------------------------------------------------------
-- Tabela: grades (Lançamento e Consulta de Notas do Boletim)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    teacher_id INTEGER,
    subject VARCHAR(100) NOT NULL,
    grade DECIMAL(4, 2) NOT NULL,
    bimester INTEGER NOT NULL DEFAULT 1 CHECK (bimester IN (1, 2, 3, 4)),
    status VARCHAR(50) NOT NULL,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- Tabela: answer_keys (Repositório de Gabaritos para Download/Visualização)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answer_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER,
    title VARCHAR(200) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    file_url VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- Tabela: announcements (Mural de Avisos e Comunicados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'Geral',
    target_role VARCHAR(20) DEFAULT 'all' CHECK (target_role IN ('all', 'student', 'parent', 'teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------------------------------------------------------------
-- Tabela: contact_messages (Mensagens do Fale Conosco e Canal Direto de Pais)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    sender_name VARCHAR(150) NOT NULL,
    sender_email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Análise', 'Respondida')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para otimização de consultas frequentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_teacher ON grades(teacher_id);
CREATE INDEX IF NOT EXISTS idx_parent_students ON parent_students(parent_id, student_id);
CREATE INDEX IF NOT EXISTS idx_answer_keys_class ON answer_keys(class_name);
