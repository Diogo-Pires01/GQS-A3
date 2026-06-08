const { Router } = require("express");

function createRoutes(controllers) {
  const router = Router();
  const { oportunidade, trilha, curso } = controllers;

  router.get("/oportunidades", oportunidade.getAll);
  router.get("/oportunidades/:id", oportunidade.getById);
  router.post("/oportunidades", oportunidade.create);
  router.put("/oportunidades/:id", oportunidade.update);
  router.delete("/oportunidades/:id", oportunidade.delete);
  router.get("/oportunidades/:id/cursos", oportunidade.getCursos);

  router.get("/trilhas", trilha.getAll);
  router.get("/trilhas/:id", trilha.getById);
  router.post("/trilhas", trilha.create);
  router.put("/trilhas/:id", trilha.update);
  router.delete("/trilhas/:id", trilha.delete);
  router.get("/trilhas/:id/cursos", trilha.getCursos);

  router.get("/cursos", curso.getAll);
  router.get("/cursos/:id", curso.getById);
  router.post("/cursos", curso.create);
  router.put("/cursos/:id", curso.update);
  router.delete("/cursos/:id", curso.delete);

  return router;
}

module.exports = createRoutes;
