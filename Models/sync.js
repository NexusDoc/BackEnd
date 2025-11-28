const sequelize = require("../Config/db");
require("./index"); // importa os modelos e relacionamentos

async function syncSchema() {
  try {
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Tabelas sincronizadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao sincronizar tabelas:", error);
    process.exit(1);
  }
}

module.exports = syncSchema;