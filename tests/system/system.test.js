const request = require("supertest");
const createApp = require("../../src/app");

describe("Testes de Sistema / Caixa Preta - API end-to-end", () => {
  let app;

  beforeEach(async () => {
    app = await createApp();
  });
  afterEach(() => app.db.close());

  describe("Validação de entrada - Oportunidades", () => {
    test("POST com dados válidos → 201", async () => {
      const res = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev", empresa: "Corp" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.titulo).toBe("Dev");
    });

    test("POST sem titulo → 400", async () => {
      const res = await request(app)
        .post("/api/oportunidades")
        .send({ empresa: "Corp" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    test("POST sem empresa → 400", async () => {
      const res = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev" });
      expect(res.status).toBe(400);
    });

    test("POST body vazio → 400", async () => {
      const res = await request(app).post("/api/oportunidades").send({});
      expect(res.status).toBe(400);
    });

    test("GET id existente → 200", async () => {
      const created = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev", empresa: "A" });
      const res = await request(app).get(
        `/api/oportunidades/${created.body.id}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe("Dev");
    });

    test("GET id inexistente → 404", async () => {
      const res = await request(app).get("/api/oportunidades/9999");
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    test("PUT id existente → 200", async () => {
      const created = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev", empresa: "A" });
      const res = await request(app)
        .put(`/api/oportunidades/${created.body.id}`)
        .send({ titulo: "Senior Dev" });
      expect(res.status).toBe(200);
      expect(res.body.titulo).toBe("Senior Dev");
    });

    test("PUT id inexistente → 404", async () => {
      const res = await request(app)
        .put("/api/oportunidades/9999")
        .send({ titulo: "X" });
      expect(res.status).toBe(404);
    });

    test("DELETE id existente → 204", async () => {
      const created = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev", empresa: "A" });
      const res = await request(app).delete(
        `/api/oportunidades/${created.body.id}`,
      );
      expect(res.status).toBe(204);
    });

    test("DELETE id inexistente → 404", async () => {
      const res = await request(app).delete("/api/oportunidades/9999");
      expect(res.status).toBe(404);
    });
  });

  describe("Validação de entrada - Trilhas", () => {
    test("POST válido → 201", async () => {
      const res = await request(app)
        .post("/api/trilhas")
        .send({ nome: "Backend" });
      expect(res.status).toBe(201);
      expect(res.body.nome).toBe("Backend");
    });

    test("POST sem nome → 400", async () => {
      const res = await request(app).post("/api/trilhas").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("Validação de entrada - Cursos", () => {
    test("POST válido → 201", async () => {
      const res = await request(app)
        .post("/api/cursos")
        .send({ titulo: "Curso X" });
      expect(res.status).toBe(201);
    });

    test("POST sem titulo → 400", async () => {
      const res = await request(app).post("/api/cursos").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("Cenário: Usuário busca oportunidades e encontra cursos", () => {
    test("deve listar oportunidades e ver cursos relacionados", async () => {
      const op1 = await request(app)
        .post("/api/oportunidades")
        .send({
          titulo: "Backend Developer",
          empresa: "Google",
          tipo: "remoto",
          salario: 15000,
        });
      const op2 = await request(app)
        .post("/api/oportunidades")
        .send({
          titulo: "Frontend Developer",
          empresa: "Meta",
          tipo: "hibrido",
          salario: 12000,
        });

      await request(app)
        .post("/api/cursos")
        .send({ titulo: "Node.js Masterclass", oportunidade_id: op1.body.id });
      await request(app)
        .post("/api/cursos")
        .send({ titulo: "SQL Avançado", oportunidade_id: op1.body.id });
      await request(app)
        .post("/api/cursos")
        .send({ titulo: "React do Zero", oportunidade_id: op2.body.id });

      const ops = await request(app).get("/api/oportunidades");
      expect(ops.status).toBe(200);
      expect(ops.body).toHaveLength(2);

      const cursos = await request(app).get(
        `/api/oportunidades/${op1.body.id}/cursos`,
      );
      expect(cursos.body).toHaveLength(2);
      expect(cursos.body.map((c) => c.titulo)).toContain("Node.js Masterclass");
    });

    test("oportunidade sem cursos → array vazio", async () => {
      const op = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Dev", empresa: "A" });
      const res = await request(app).get(
        `/api/oportunidades/${op.body.id}/cursos`,
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("oportunidade inexistente/cursos → 404", async () => {
      const res = await request(app).get("/api/oportunidades/9999/cursos");
      expect(res.status).toBe(404);
    });
  });

  describe("Cenário: Usuário explora trilha com cursos", () => {
    test("deve navegar trilha e ver cursos ordenados", async () => {
      const trilha = await request(app)
        .post("/api/trilhas")
        .send({
          nome: "DevOps Engineer",
          nivel: "avancado",
          duracao_horas: 120,
        });

      await request(app)
        .post("/api/cursos")
        .send({ titulo: "Docker", trilha_id: trilha.body.id });
      await request(app)
        .post("/api/cursos")
        .send({ titulo: "Kubernetes", trilha_id: trilha.body.id });
      await request(app)
        .post("/api/cursos")
        .send({ titulo: "CI/CD", trilha_id: trilha.body.id });

      const trilhas = await request(app).get("/api/trilhas");
      expect(trilhas.body[0].nome).toBe("DevOps Engineer");

      const cursos = await request(app).get(
        `/api/trilhas/${trilha.body.id}/cursos`,
      );
      expect(cursos.body).toHaveLength(3);
    });
  });

  describe("Cenário: CRUD completo de oportunidade", () => {
    test("criar → atualizar → deletar → não encontrar", async () => {
      const created = await request(app)
        .post("/api/oportunidades")
        .send({ titulo: "Junior Dev", empresa: "StartupY", salario: 5000 });
      expect(created.status).toBe(201);

      const updated = await request(app)
        .put(`/api/oportunidades/${created.body.id}`)
        .send({ titulo: "Pleno Dev", salario: 10000 });
      expect(updated.body.titulo).toBe("Pleno Dev");
      expect(updated.body.salario).toBe(10000);

      const deleted = await request(app).delete(
        `/api/oportunidades/${created.body.id}`,
      );
      expect(deleted.status).toBe(204);

      const notFound = await request(app).get(
        `/api/oportunidades/${created.body.id}`,
      );
      expect(notFound.status).toBe(404);
    });
  });

  describe("Cenário: Curso conectado a oportunidade E trilha", () => {
    test("deve vincular curso aos dois recursos", async () => {
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
    });
  });

  test("Health check", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
