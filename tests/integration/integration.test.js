const request = require("supertest");
const createApp = require("../../src/app");

describe("Testes de Integração - Interação entre módulos", () => {
  let app;

  beforeEach(async () => {
    app = await createApp();
  });
  afterEach(() => app.db.close());

  describe("Oportunidade + Cursos", () => {
    test("deve criar oportunidade e vincular cursos a ela", async () => {
      const op = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev Node", empresa: "TechCorp", tipo: "remoto" });
      expect(op.status).toBe(201);

      const curso = await request(app)
        .post("/api/cursos")
        .send({ titulo: "Node Avançado", oportunidade_id: op.body.id });
      expect(curso.status).toBe(201);

      const cursos = await request(app).get(
        `/api/oportunidades/${op.body.id}/cursos`,
      );
      expect(cursos.body).toHaveLength(1);
      expect(cursos.body[0].titulo).toBe("Node Avançado");
    });

    test("ao deletar oportunidade, cursos perdem referência mas continuam existindo", async () => {
      const op = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev", empresa: "X" });
      await request(app)
        .post("/api/cursos")
        .send({ titulo: "Curso A", oportunidade_id: op.body.id });

      await request(app).delete(`/api/oportunidades/${op.body.id}`);

      const cursos = await request(app).get("/api/cursos");
      expect(cursos.body).toHaveLength(1);
      expect(cursos.body[0].titulo).toBe("Curso A");
    });
  });

  describe("Trilha + Cursos", () => {
    test("deve criar trilha e vincular múltiplos cursos", async () => {
      const trilha = await request(app)
        .post("/api/trilhas")
        .send({ nome: "Fullstack JS", nivel: "intermediario" });
      expect(trilha.status).toBe(201);

      await request(app)
        .post("/api/cursos")
        .send({ titulo: "React Básico", trilha_id: trilha.body.id });
      await request(app)
        .post("/api/cursos")
        .send({ titulo: "Express API", trilha_id: trilha.body.id });

      const cursos = await request(app).get(
        `/api/trilhas/${trilha.body.id}/cursos`,
      );
      expect(cursos.body).toHaveLength(2);
    });
  });

  describe("Oportunidade + Trilha + Curso (relação completa)", () => {
    test("curso conectado a oportunidade e trilha simultaneamente", async () => {
      const op = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Fullstack Dev", empresa: "StartupX" });
      const trilha = await request(app)
        .post("/api/trilhas")
        .send({ nome: "Fullstack Path" });

      const curso = await request(app)
        .post("/api/cursos")
        .send({
          titulo: "JavaScript Moderno",
          trilha_id: trilha.body.id,
          oportunidade_id: op.body.id,
        });

      expect(curso.body.trilha_id).toBe(trilha.body.id);
      expect(curso.body.oportunidade_id).toBe(op.body.id);

      // aparece nos dois endpoints de relação
      const cursosOp = await request(app).get(
        `/api/oportunidades/${op.body.id}/cursos`,
      );
      const cursosTrilha = await request(app).get(
        `/api/trilhas/${trilha.body.id}/cursos`,
      );
      expect(cursosOp.body).toHaveLength(1);
      expect(cursosTrilha.body).toHaveLength(1);
    });
  });
});
