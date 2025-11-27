const { Sequelize } = require("sequelize");
const config = require("./env");

const sequelize = new Sequelize(
  config.banco.nome,
  config.banco.usuario,
  config.banco.senha,
  {
    host: config.banco.host,
    dialect: "mysql",
    logging: config.ambiente === "desenvolvimento" ? console.log : false,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexão com o banco realizada com sucesso!");
  } catch (error) {
    console.error("❌ Não foi possível conectar ao banco:", error);
  }
})();

module.exports = sequelize;