require("dotenv").config();
const crypto = require("crypto");

const ambiente = process.env.AMBIENTE || "desenvolvimento";

const CHAVE_JWT =
  process.env.CHAVE_JWT || crypto.randomBytes(32).toString("hex");

const config = {
  porta: process.env.PORTA || 5000,
  ambiente,
  banco: {
    host: ambiente === "producao" ? process.env.PROD_HOST : process.env.DEV_HOST,
    usuario: ambiente === "producao" ? process.env.PROD_USER : process.env.DEV_USER,
    senha: ambiente === "producao" ? process.env.PROD_PASSWD : process.env.DEV_PASSWD,
    nome: ambiente === "producao" ? process.env.PROD_DB : process.env.DEV_DB,
  },
  jwt: {
    chave: CHAVE_JWT,
  },
};

module.exports = config;