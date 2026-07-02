const express = require("express");
const router = express.Router();
const perfilController = require("../controllers/perfil.controller");
const autenticarToken = require("../middlewares/authMiddleware.js");

router.get("/", autenticarToken, perfilController.buscarPerfil);
router.patch("/senha", autenticarToken, perfilController.trocarSenha);
router.delete("/", autenticarToken, perfilController.deletarConta);
router.put("/", autenticarToken, perfilController.atualizarDados);

module.exports = router;
