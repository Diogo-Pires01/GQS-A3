class CursoModel {
  constructor(db) {
    this.db = db;
  }

  findAll() {
    return this.db
      .prepare("SELECT * FROM cursos ORDER BY created_at DESC")
      .all();
  }

  findById(id) {
    return this.db.prepare("SELECT * FROM cursos WHERE id = ?").get(id);
  }

  create({
    titulo,
    descricao,
    url,
    duracao_horas,
    trilha_id,
    oportunidade_id,
  }) {
    if (!titulo) throw new Error("Titulo é obrigatório");
    const stmt = this.db.prepare(
      "INSERT INTO cursos (titulo, descricao, url, duracao_horas, trilha_id, oportunidade_id) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const result = stmt.run(
      titulo,
      descricao,
      url,
      duracao_horas,
      trilha_id,
      oportunidade_id,
    );
    return this.findById(result.lastInsertRowid);
  }

  update(
    id,
    { titulo, descricao, url, duracao_horas, trilha_id, oportunidade_id },
  ) {
    const existing = this.findById(id);
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE cursos SET titulo=?, descricao=?, url=?, duracao_horas=?, trilha_id=?, oportunidade_id=? WHERE id=?",
      )
      .run(
        titulo || existing.titulo,
        descricao ?? existing.descricao,
        url ?? existing.url,
        duracao_horas ?? existing.duracao_horas,
        trilha_id ?? existing.trilha_id,
        oportunidade_id ?? existing.oportunidade_id,
        id,
      );
    return this.findById(id);
  }

  delete(id) {
    const existing = this.findById(id);
    if (!existing) return false;
    this.db.prepare("DELETE FROM cursos WHERE id = ?").run(id);
    return true;
  }

  findByOportunidade(oportunidadeId) {
    return this.db
      .prepare("SELECT * FROM cursos WHERE oportunidade_id = ?")
      .all(oportunidadeId);
  }

  findByTrilha(trilhaId) {
    return this.db
      .prepare("SELECT * FROM cursos WHERE trilha_id = ?")
      .all(trilhaId);
  }
}

module.exports = CursoModel;
