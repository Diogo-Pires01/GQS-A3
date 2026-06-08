const { initSQL, createDatabaseSync } = require("../../src/database");
const OportunidadeModel = require("../../src/models/Oportunidade");
const TrilhaModel = require("../../src/models/Trilha");
const CursoModel = require("../../src/models/Curso");

describe("Testes Unitários / Caixa Branca - Models", () => {
  let db, oportunidadeModel, trilhaModel, cursoModel;

  beforeAll(async () => {
    await initSQL();
  });

  beforeEach(() => {
    db = createDatabaseSync();
    oportunidadeModel = new OportunidadeModel(db);
    trilhaModel = new TrilhaModel(db);
    cursoModel = new CursoModel(db);
  });

  afterEach(() => db.close());

  describe("OportunidadeModel", () => {
    test("deve criar uma oportunidade com campos obrigatórios", () => {
      const op = oportunidadeModel.create({
        titulo: "Dev Node",
        empresa: "Empresa X",
      });
      expect(op.titulo).toBe("Dev Node");
      expect(op.empresa).toBe("Empresa X");
      expect(op.id).toBeDefined();
    });

    test('deve aplicar tipo padrão "remoto" quando não informado', () => {
      const result = oportunidadeModel.create({ titulo: "A", empresa: "B" });
      expect(result.tipo).toBe("remoto");
    });

    test("deve usar tipo fornecido", () => {
      const result = oportunidadeModel.create({
        titulo: "A",
        empresa: "B",
        tipo: "presencial",
      });
      expect(result.tipo).toBe("presencial");
    });

    test("deve falhar sem titulo", () => {
      expect(() => oportunidadeModel.create({ empresa: "X" })).toThrow(
        "Titulo e empresa são obrigatórios",
      );
    });

    test("deve falhar sem empresa", () => {
      expect(() => oportunidadeModel.create({ titulo: "Dev" })).toThrow(
        "Titulo e empresa são obrigatórios",
      );
    });

    test("deve falhar com titulo vazio", () => {
      expect(() =>
        oportunidadeModel.create({ titulo: "", empresa: "B" }),
      ).toThrow();
    });

    test("deve falhar com empresa vazia", () => {
      expect(() =>
        oportunidadeModel.create({ titulo: "A", empresa: "" }),
      ).toThrow();
    });

    test("deve listar todas as oportunidades", () => {
      oportunidadeModel.create({ titulo: "Dev 1", empresa: "A" });
      oportunidadeModel.create({ titulo: "Dev 2", empresa: "B" });
      expect(oportunidadeModel.findAll()).toHaveLength(2);
    });

    test("deve buscar por id existente", () => {
      const created = oportunidadeModel.create({ titulo: "Dev", empresa: "A" });
      const found = oportunidadeModel.findById(created.id);
      expect(found.titulo).toBe("Dev");
    });

    test("deve retornar undefined para id inexistente", () => {
      expect(oportunidadeModel.findById(999)).toBeUndefined();
    });

    test("deve atualizar campos fornecidos e manter os demais", () => {
      const op = oportunidadeModel.create({
        titulo: "Dev",
        empresa: "X",
        salario: 5000,
      });
      const updated = oportunidadeModel.update(op.id, { titulo: "Senior Dev" });
      expect(updated.titulo).toBe("Senior Dev");
      expect(updated.empresa).toBe("X");
      expect(updated.salario).toBe(5000);
    });

    test("deve manter valor existente quando campo é null (nullish coalescing)", () => {
      const op = oportunidadeModel.create({
        titulo: "Dev",
        empresa: "X",
        descricao: "Desc original",
      });
      const updated = oportunidadeModel.update(op.id, { descricao: null });
      expect(updated.descricao).toBe("Desc original");
    });

    test("deve retornar null ao atualizar id inexistente", () => {
      expect(oportunidadeModel.update(999, { titulo: "X" })).toBeNull();
    });

    test("deve deletar oportunidade existente", () => {
      const created = oportunidadeModel.create({ titulo: "Dev", empresa: "A" });
      expect(oportunidadeModel.delete(created.id)).toBe(true);
      expect(oportunidadeModel.findById(created.id)).toBeUndefined();
    });

    test("deve retornar false ao deletar id inexistente", () => {
      expect(oportunidadeModel.delete(999)).toBe(false);
    });
  });

  describe("TrilhaModel", () => {
    test('deve criar trilha com nivel padrão "iniciante"', () => {
      const t = trilhaModel.create({ nome: "Backend Node.js" });
      expect(t.nome).toBe("Backend Node.js");
      expect(t.nivel).toBe("iniciante");
    });

    test("deve usar nivel fornecido", () => {
      const t = trilhaModel.create({ nome: "Test", nivel: "avancado" });
      expect(t.nivel).toBe("avancado");
    });

    test("deve falhar sem nome", () => {
      expect(() => trilhaModel.create({})).toThrow("Nome é obrigatório");
    });

    test("deve listar trilhas", () => {
      trilhaModel.create({ nome: "Trilha 1" });
      trilhaModel.create({ nome: "Trilha 2" });
      expect(trilhaModel.findAll()).toHaveLength(2);
    });

    test("deve deletar trilha existente", () => {
      const t = trilhaModel.create({ nome: "Trilha" });
      expect(trilhaModel.delete(t.id)).toBe(true);
    });

    test("deve retornar null ao atualizar id inexistente", () => {
      expect(trilhaModel.update(999, { nome: "X" })).toBeNull();
    });

    test("deve retornar false ao deletar id inexistente", () => {
      expect(trilhaModel.delete(999)).toBe(false);
    });
  });

  describe("CursoModel", () => {
    test("deve criar um curso", () => {
      const c = cursoModel.create({ titulo: "Intro Node.js" });
      expect(c.titulo).toBe("Intro Node.js");
    });

    test("deve criar curso sem trilha nem oportunidade (nulls)", () => {
      const c = cursoModel.create({ titulo: "Solo Course" });
      expect(c.trilha_id).toBeNull();
      expect(c.oportunidade_id).toBeNull();
    });

    test("deve falhar sem titulo", () => {
      expect(() => cursoModel.create({})).toThrow("Titulo é obrigatório");
    });

    test("deve vincular curso a oportunidade", () => {
      const op = oportunidadeModel.create({ titulo: "Dev", empresa: "A" });
      cursoModel.create({ titulo: "Curso 1", oportunidade_id: op.id });
      expect(cursoModel.findByOportunidade(op.id)).toHaveLength(1);
    });

    test("deve vincular curso a trilha", () => {
      const trilha = trilhaModel.create({ nome: "Backend" });
      cursoModel.create({ titulo: "Curso 1", trilha_id: trilha.id });
      expect(cursoModel.findByTrilha(trilha.id)).toHaveLength(1);
    });

    test("findByOportunidade sem resultados retorna array vazio", () => {
      expect(cursoModel.findByOportunidade(999)).toHaveLength(0);
    });

    test("findByTrilha sem resultados retorna array vazio", () => {
      expect(cursoModel.findByTrilha(999)).toHaveLength(0);
    });

    test("deve retornar null ao atualizar id inexistente", () => {
      expect(cursoModel.update(999, { titulo: "X" })).toBeNull();
    });
  });
});
