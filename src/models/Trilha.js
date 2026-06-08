class TrilhaModel {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return this.db
      .prepare("SELECT * FROM trilhas ORDER BY created_at DESC")
      .all();
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM trilhas WHERE id = ?").get(id);
  }

  create({ nome, descricao, nivel, duracao_horas }) {
    if (!nome) throw new Error("Nome é obrigatório");
    const stmt = this.db.prepare(
      "INSERT INTO trilhas (nome, descricao, nivel, duracao_horas) VALUES (?, ?, ?, ?)",
    );
    const result = stmt.run(
      nome,
      descricao,
      nivel || "iniciante",
      duracao_horas,
    );
    return this.findById(result.lastInsertRowid);
  }

  update(id, { nome, descricao, nivel, duracao_horas }) {
    const existing = this.findById(id);
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE trilhas SET nome=?, descricao=?, nivel=?, duracao_horas=? WHERE id=?",
      )
      .run(
        nome || existing.nome,
        descricao ?? existing.descricao,
        nivel || existing.nivel,
        duracao_horas ?? existing.duracao_horas,
        id,
      );
    return this.findById(id);
  }

  delete(id) {
    const existing = this.findById(id);
    if (!existing) return false;
    this.db.prepare("DELETE FROM trilhas WHERE id = ?").run(id);
    return true;
  }

  findCursos(id) {
    return this.db.prepare("SELECT * FROM cursos WHERE trilha_id = ?").all(id);
  }
}

module.exports = TrilhaModel;
