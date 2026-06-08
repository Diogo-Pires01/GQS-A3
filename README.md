# A3 GQS - API CapacitaPro

API REST para gerenciamento de oportunidades de emprego, trilhas de aprendizagem e cursos, conectando capacitação profissional às demandas do mercado de trabalho.

## Tecnologias

- Node.js + Express
- SQLite in-memory (sql.js)
- Jest + Supertest (testes)

## Instalação

```bash
npm install
```

## Executar

```bash
npm start        # produção (porta 3000)
npm run dev      # desenvolvimento
```

## Testes

```bash
npm test                  # todos + coverage
npm run test:unit         # unitários (caixa branca)
npm run test:integration  # integração entre módulos
npm run test:system       # sistema (caixa preta)
```

## Endpoints

### Oportunidades

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/oportunidades | Listar todas |
| GET | /api/oportunidades/:id | Buscar por id |
| POST | /api/oportunidades | Criar |
| PUT | /api/oportunidades/:id | Atualizar |
| DELETE | /api/oportunidades/:id | Remover |
| GET | /api/oportunidades/:id/cursos | Cursos vinculados |

**Body (POST/PUT):**
```json
{
  "titulo": "Backend Developer",
  "empresa": "TechCorp",
  "descricao": "Vaga para dev backend",
  "localizacao": "São Paulo",
  "tipo": "remoto | presencial | hibrido",
  "salario": 15000
}
```

### Trilhas

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/trilhas | Listar todas |
| GET | /api/trilhas/:id | Buscar por id |
| POST | /api/trilhas | Criar |
| PUT | /api/trilhas/:id | Atualizar |
| DELETE | /api/trilhas/:id | Remover |
| GET | /api/trilhas/:id/cursos | Cursos da trilha |

**Body (POST/PUT):**
```json
{
  "nome": "DevOps Engineer",
  "descricao": "Trilha completa de DevOps",
  "nivel": "iniciante | intermediario | avancado",
  "duracao_horas": 120
}
```

### Cursos

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/cursos | Listar todos |
| GET | /api/cursos/:id | Buscar por id |
| POST | /api/cursos | Criar |
| PUT | /api/cursos/:id | Atualizar |
| DELETE | /api/cursos/:id | Remover |

**Body (POST/PUT):**
```json
{
  "titulo": "Node.js Masterclass",
  "descricao": "Curso avançado de Node",
  "url": "https://exemplo.com/curso",
  "duracao_horas": 40,
  "trilha_id": 1,
  "oportunidade_id": 1
}
```

## Estrutura do Projeto

```
src/
  app.js                    # Factory da aplicação Express
  server.js                 # Entry point
  database/index.js         # Inicialização SQLite (sql.js)
  models/                   # Oportunidade, Trilha, Curso
  controllers/              # Lógica dos endpoints
  routes/index.js           # Definição de rotas
tests/
  unit/models.test.js       # Unitários + Caixa Branca
  integration/              # Integração entre módulos
  system/                   # Sistema + Caixa Preta
```

## Tipos de Teste

| Tipo | Arquivo | O que testa |
|------|---------|-------------|
| Unitário + Caixa Branca | `tests/unit/models.test.js` | Lógica interna dos models, cobertura de branches e caminhos |
| Integração | `tests/integration/integration.test.js` | Interação entre módulos (routes + controllers + models + DB) |
| Sistema + Caixa Preta | `tests/system/system.test.js` | Cenários e2e do usuário, validação de entrada/saída via HTTP |
