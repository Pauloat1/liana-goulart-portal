/* /backend/db/index.js */
/**
 * ==============================================================================
 * PROJETO ESCOLA LIANA GOULART
 * Módulo de Conexão e Execução de Banco de Dados
 * Tecnologia: SQLite3 (Compatível com sintaxe SQL padrão / PostgreSQL)
 * Recursos: Prepared Statements (Prevenção de SQL Injection), inicialização automática
 * ==============================================================================
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Caminho do arquivo do banco SQLite
const DB_PATH = path.join(__dirname, '../../database/escola.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');
const SEED_PATH = path.join(__dirname, '../../database/seed.sql');

// Criação da conexão com o banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        console.log('✅ Conexão com SQLite estabelecida com sucesso:', DB_PATH);
        initDatabase();
    }
});

// Ativa chaves estrangeiras
db.run('PRAGMA foreign_keys = ON;');

/**
 * Inicializa as tabelas e dados de teste caso o banco seja novo ou esteja vazio
 */
function initDatabase() {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users';", (err, row) => {
        if (err) {
            console.error('Erro ao verificar estrutura do banco:', err);
            return;
        }

        if (!row) {
            console.log('🔄 Banco de dados virgem detectado. Executando schema.sql e seed.sql...');
            try {
                const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
                const seedSql = fs.readFileSync(SEED_PATH, 'utf-8');

                db.exec(schemaSql, (schemaErr) => {
                    if (schemaErr) {
                        console.error('❌ Erro ao aplicar schema.sql:', schemaErr.message);
                        return;
                    }
                    console.log('✅ Tabelas criadas com sucesso (schema.sql).');

                    db.exec(seedSql, (seedErr) => {
                        if (seedErr) {
                            console.error('❌ Erro ao aplicar seed.sql:', seedErr.message);
                            return;
                        }
                        console.log('✅ Dados de teste inseridos com sucesso (seed.sql).');
                    });
                });
            } catch (fileErr) {
                console.error('❌ Erro ao ler arquivos SQL:', fileErr.message);
            }
        } else {
            console.log('ℹ️ Banco de dados já estruturado e pronto para uso.');
        }
    });
}

/**
 * Executa uma consulta SQL retornando todas as linhas correspondentes (SELECT)
 * Utiliza Prepared Statements para segurança contra SQL Injection
 * @param {string} sql - Query SQL parametrizada com '?'
 * @param {Array} params - Valores dos parâmetros
 * @returns {Promise<Array>}
 */
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Erro na query SQL:', sql, params, err.message);
                return reject(err);
            }
            resolve(rows);
        });
    });
}

/**
 * Executa uma consulta SQL retornando apenas a primeira linha (SELECT)
 * @param {string} sql - Query SQL parametrizada com '?'
 * @param {Array} params - Valores dos parâmetros
 * @returns {Promise<Object|null>}
 */
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Erro na query get SQL:', sql, params, err.message);
                return reject(err);
            }
            resolve(row || null);
        });
    });
}

/**
 * Executa um comando SQL de alteração (INSERT, UPDATE, DELETE)
 * @param {string} sql - Comando SQL parametrizado
 * @param {Array} params - Valores dos parâmetros
 * @returns {Promise<{id: number, changes: number}>}
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Erro no run SQL:', sql, params, err.message);
                return reject(err);
            }
            resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

module.exports = {
    db,
    query,
    get,
    run
};
