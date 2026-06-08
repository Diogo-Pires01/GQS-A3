function createCursoController(model) {
  return {
    getAll(req, res) {
      res.json(model.findAll());
    },

    getById(req, res) {
      const item = model.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Curso não encontrado" });
      res.json(item);
    },

    create(req, res) {
      try {
        const item = model.create(req.body);
        res.status(201).json(item);
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    },

    update(req, res) {
      const item = model.update(req.params.id, req.body);
      if (!item) return res.status(404).json({ error: "Curso não encontrado" });
      res.json(item);
    },

    delete(req, res) {
      const deleted = model.delete(req.params.id);
      if (!deleted)
        return res.status(404).json({ error: "Curso não encontrado" });
      res.status(204).send();
    },
  };
}

module.exports = createCursoController;
