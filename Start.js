const app = require("./Config/express");
const config = require("./Config/env");
const syncSchema = require("./Models/sync");

const PORTA = config.porta;

(async () => {
  try {
    await syncSchema();

    app.listen(PORTA, () => {
      console.log(`Servidor rodando na porta ${PORTA}`);
      console.log(`Ambiente atual: ${config.ambiente}`);
      console.log(`Banco usado: ${config.banco.nome}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar a API:", error);
  }
})();