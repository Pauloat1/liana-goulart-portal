-- ==============================================================================
-- PROJETO ESCOLA LIANA GOULART
-- Arquivo: /database/seed.sql
-- Descrição: Dados iniciais para testes com usuários de cada perfil RBAC
-- Senha padrão para todos os usuários: senha123
-- Hash bcrypt correspondente: $2a$10$0rS4NaQel8CJsYxK6tBUq.X/3lUdFKZDDEIPTWqTfhyZ5ZmloUJ12
-- ==============================================================================

-- Limpeza preventiva (respeitando integridade referencial)
DELETE FROM contact_messages;
DELETE FROM announcements;
DELETE FROM answer_keys;
DELETE FROM grades;
DELETE FROM parent_students;
DELETE FROM users;

-- ------------------------------------------------------------------------------
-- 1. Inserção de Usuários
-- ------------------------------------------------------------------------------
-- 1: Professor
INSERT INTO users (id, nome, email, senha, role, telefone, turma) VALUES
(1, 'Prof. Carlos Eduardo', 'prof.carlos@escola.com', '$2a$10$0rS4NaQel8CJsYxK6tBUq.X/3lUdFKZDDEIPTWqTfhyZ5ZmloUJ12', 'teacher', '(11) 98765-4321', '9º Ano A');

-- 2: Aluno Principal
INSERT INTO users (id, nome, email, senha, role, telefone, turma) VALUES
(2, 'Lucas Mendes Goulart', 'aluno.lucas@escola.com', '$2a$10$0rS4NaQel8CJsYxK6tBUq.X/3lUdFKZDDEIPTWqTfhyZ5ZmloUJ12', 'student', '(11) 97654-3210', '9º Ano A');

-- 3: Responsável pelo Lucas
INSERT INTO users (id, nome, email, senha, role, telefone, turma) VALUES
(3, 'Maria Clara Mendes', 'maria.mae@escola.com', '$2a$10$0rS4NaQel8CJsYxK6tBUq.X/3lUdFKZDDEIPTWqTfhyZ5ZmloUJ12', 'parent', '(11) 96543-2109', NULL);

-- 4: Aluna Secundária (para testes de turmas)
INSERT INTO users (id, nome, email, senha, role, telefone, turma) VALUES
(4, 'Beatriz Souza Rocha', 'aluna.beatriz@escola.com', '$2a$10$0rS4NaQel8CJsYxK6tBUq.X/3lUdFKZDDEIPTWqTfhyZ5ZmloUJ12', 'student', '(11) 95432-1098', '9º Ano A');

-- ------------------------------------------------------------------------------
-- 2. Vínculo Familiar (Responsável -> Filho)
-- ------------------------------------------------------------------------------
INSERT INTO parent_students (parent_id, student_id, relationship_type) VALUES
(3, 2, 'Mãe / Responsável Legal');

-- ------------------------------------------------------------------------------
-- 3. Inserção de Notas Iniciais (Boletim)
-- ------------------------------------------------------------------------------
-- Notas do Aluno Lucas (id 2)
INSERT INTO grades (student_id, teacher_id, subject, grade, bimester, status, observations) VALUES
(2, 1, 'Matemática', 8.5, 1, 'Aprovado', 'Excelente raciocínio lógico e participação em aula.'),
(2, 1, 'Língua Portuguesa', 9.0, 1, 'Aprovado', 'Ótima interpretação de texto e redação impecável.'),
(2, 1, 'História', 5.5, 1, 'Em Recuperação', 'Necessário reforçar o estudo do conteúdo sobre o Brasil Colonial.'),
(2, 1, 'Ciências Naturais', 7.5, 1, 'Aprovado', 'Bom desempenho nos relatórios de laboratório.'),
(2, 1, 'Geografia', 8.0, 1, 'Aprovado', 'Participativo nos seminários sobre urbanização.');

-- Notas da Aluna Beatriz (id 4)
INSERT INTO grades (student_id, teacher_id, subject, grade, bimester, status, observations) VALUES
(4, 1, 'Matemática', 9.5, 1, 'Aprovado', 'Desempenho exemplar nas olimpíadas de cálculo.'),
(4, 1, 'Língua Portuguesa', 8.0, 1, 'Aprovado', 'Leitura constante e boa argumentação.');

-- ------------------------------------------------------------------------------
-- 4. Inserção de Gabaritos Oficiais
-- ------------------------------------------------------------------------------
INSERT INTO answer_keys (teacher_id, title, class_name, subject, file_url, content) VALUES
(1, 'Gabarito Oficial - Simulado Geral 1º Bimestre', '9º Ano A', 'Multidisciplinar', '#', '1-A | 2-C | 3-B | 4-D | 5-E | 6-A | 7-B | 8-C | 9-D | 10-E. Resolução e critérios de pontuação disponíveis na coordenação.'),
(1, 'Gabarito da Avaliação Bimestral de Matemática', '9º Ano A', 'Matemática', '#', '1-B | 2-D | 3-A | 4-C | 5-B | 6-C | 7-A | 8-E. Todas as equações quadráticas requerem discriminação do Delta.'),
(1, 'Espelho de Correção - Redação e Leitura', '9º Ano A', 'Língua Portuguesa', '#', 'Critérios de coerência textual, regência verbal e ortografia conforme norma culta atualizada.');

-- ------------------------------------------------------------------------------
-- 5. Mural de Avisos e Comunicados
-- ------------------------------------------------------------------------------
INSERT INTO announcements (teacher_id, title, content, category, target_role) VALUES
(1, 'Reunião de Pais e Mestres do 1º Bimestre', 'Prezados familiares, convidamos todos para o alinhamento pedagógico deste sábado, dia 25/04, às 09h00 no auditório da escola. Sua presença é fundamental para o sucesso acadêmico de nossos alunos.', 'Institucional', 'parent'),
(1, 'Plantão de Dúvidas Semanal de Matemática', 'O plantão de reforço ocorrerá todas as terças e quintas-feiras, das 14h00 às 15h30, na Sala 04. Tragam suas listas de exercícios!', 'Acadêmico', 'student'),
(1, 'Inscrições Abertas: Feira de Ciências e Tecnologia 2026', 'Estão abertas as inscrições de grupos para a nossa tradicional Feira Científica. Os temas deste ano englobam sustentabilidade, robótica e biotecnologia. Procure a secretaria até sexta-feira.', 'Eventos', 'all');

-- ------------------------------------------------------------------------------
-- 6. Mensagens de Contato
-- ------------------------------------------------------------------------------
INSERT INTO contact_messages (user_id, sender_name, sender_email, subject, message, status) VALUES
(3, 'Maria Clara Mendes', 'maria.mae@escola.com', 'Dúvida sobre horário do plantão de recuperação', 'Gostaria de confirmar se haverá transporte escolar disponível no horário do contraturno para o plantão de história.', 'Pendente');
