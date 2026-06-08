const express = require("express");
const cors = require("cors");
const { initSQL, createDatabaseSync } = require("./database");
const createRoutes = require("./routes");
const OportunidadeModel = require("./models/Oportunidade");
const TrilhaModel = require("./models/Trilha");
const CursoModel = require("./models/Curso");
const createOportunidadeController = require("./controllers/oportunidadeController");
const createTrilhaController = require("./controllers/trilhaController");
const createCursoController = require("./controllers/cursoController");

async function createApp() {
  await initSQL();
  const db = createDatabaseSync();

  const app = express();
  app.use(cors());
  app.use(express.json());

  const oportunidadeModel = new OportunidadeModel(db);
  const trilhaModel = new TrilhaModel(db);
  const cursoModel = new CursoModel(db);

  const controllers = {
    oportunidade: createOportunidadeController(oportunidadeModel),
    trilha: createTrilhaController(trilhaModel),
    curso: createCursoController(cursoModel),
  };

  app.use("/api", createRoutes(controllers));
  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.db = db;
  return app;
}

module.exports = createApp;
