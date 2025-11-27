const app = require("./Config/express");
const config = require("./Config/env");

const PORTA = config.porta;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
  console.log(`Ambiente atual: ${config.ambiente}`);
  console.log(`Banco usado: ${config.banco.nome}`);
});