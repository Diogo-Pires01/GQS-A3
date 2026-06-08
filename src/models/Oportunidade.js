class OportunidadeModel {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return this.db
      .prepare("SELECT * FROM oportunidades ORDER BY created_at DESC")
      .all();
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM oportunidades WHERE id = ?").get(id);
  }

  create({ titulo, empresa, descricao, localizacao, tipo, salario }) {
    if (!titulo || !empresa)
      throw new Error("Titulo e empresa são obrigatórios");
    const stmt = this.db.prepare(
      "INSERT INTO oportunidades (titulo, empresa, descricao, localizacao, tipo, salario) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const result = stmt.run(
      titulo,
      empresa,
      descricao,
      localizacao,
      tipo || "remoto",
      salario,
    );
    return this.findById(result.lastInsertRowid);
  }

  update(id, { titulo, empresa, descricao, localizacao, tipo, salario }) {
    const existing = this.findById(id);
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE oportunidades SET titulo=?, empresa=?, descricao=?, localizacao=?, tipo=?, salario=? WHERE id=?",
      )
      .run(
        titulo || existing.titulo,
        empresa || existing.empresa,
        descricao ?? existing.descricao,
        localizacao ?? existing.localizacao,
        tipo || existing.tipo,
        salario ?? existing.salario,
        id,
      );
    return this.findById(id);
  }

  delete(id) {
    const existing = this.findById(id);
    if (!existing) return false;
    this.db.prepare("DELETE FROM oportunidades WHERE id = ?").run(id);
    return true;
  }

  findCursos(id) {
    return this.db
      .prepare("SELECT * FROM cursos WHERE oportunidade_id = ?")
      .all(id);
  }
}

module.exports = OportunidadeModel;
