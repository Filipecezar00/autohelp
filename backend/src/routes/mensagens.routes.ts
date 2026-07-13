const express = require("express");
const router = express.Router();
const mensagemController = require("../controllers/mensagens.controller");
const autenticarToken = require("../middlewares/authMiddleware");

router.get(
  "/mensagens/:solicitacaoId",
  autenticarToken,
  mensagemController.buscarMensagens,
);

module.exports = router;
