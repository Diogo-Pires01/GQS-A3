const initSqlJs = require("sql.js");

let SQL = null;

async function initSQL() {
  if (!SQL) SQL = await initSqlJs();
  return SQL;
}

function createDatabaseSync() {
  if (!SQL) throw new Error("SQL.js not initialized. Call initSQL() first.");
  const db = new SQL.Database();
  setupTables(db);
  return wrapDatabase(db);
}

function setupTables(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS oportunidades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      empresa TEXT NOT NULL,
      descricao TEXT,
      localizacao TEXT,
      tipo TEXT DEFAULT 'remoto',
      salario REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS trilhas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      nivel TEXT DEFAULT 'iniciante',
      duracao_horas INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      url TEXT,
      duracao_horas INTEGER,
      trilha_id INTEGER,
      oportunidade_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trilha_id) REFERENCES trilhas(id),
      FOREIGN KEY (oportunidade_id) REFERENCES oportunidades(id)
    )
  `);
}

function sanitizeParams(params) {
  return params.map((p) => (p === undefined ? null : p));
}

function wrapDatabase(db) {
  return {
    prepare(sql) {
      return {
        all(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(sanitizeParams(params));
          const results = [];
          while (stmt.step()) results.push(stmt.getAsObject());
          stmt.free();
          return results;
        },
        get(...params) {
          const stmt = db.prepare(sql);
          stmt.bind(sanitizeParams(params));
          const result = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return result;
        },
        run(...params) {
          db.run(sql, sanitizeParams(params));
          return {
            lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]
              .values[0][0],
          };
        },
      };
    },
    close() {
      db.close();
    },
    _raw: db,
  };
}

module.exports = { initSQL, createDatabaseSync };
