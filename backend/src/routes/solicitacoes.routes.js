const express = require("express");
const autenticarToken = require("../middlewares/authMiddleware.js");
const solicitacoesController = require("../controllers/solicitacoes.controller.js");

const router = express.Router();

router.use(autenticarToken);

router.post("/", autenticarToken, solicitacoesController.criarSolicitacao);
router.get(
  "/minhas",
  autenticarToken,
  solicitacoesController.listarSolicitacoesDoCliente,
);
router.get(
  "/recebidas",
  autenticarToken,
  solicitacoesController.listarSolicitacoesDoPrestador,
);
router.delete(
  "/:id",
  autenticarToken,
  solicitacoesController.cancelarSolicitacao,
);
router.patch(
  "/:id/status",
  autenticarToken,
  solicitacoesController.atualizarStatus,
);
router.put(
  "/:id/esconder",
  autenticarToken,
  solicitacoesController.esconderSolicitacao,
);
module.exports = router;
