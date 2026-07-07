const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware.js");
const solicitacoesController = require("../controllers/solicitacoes.controller.js");

const router = express.Router();

router.use(autenticarToken);

router.post("/", solicitacoesController.criarSolicitacao);
router.get("/minhas", solicitacoesController.listarSolicitacoesDoCliente);
router.get("/recebidas", solicitacoesController.listarSolicitacoesDoPrestador);
router.delete("/:id", solicitacoesController.cancelarSolicitacao);
router.patch("/:id/status", solicitacoesController.atualizarStatus);
router.put("/:id/esconder", solicitacoesController.esconderSolicitacao);

module.exports = router;
