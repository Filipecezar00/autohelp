import express from "express";
import autenticarToken from "../middlewares/authMiddleware";
import {
  criarSolicitacao,
  listarSolicitacoesDoCliente,
  listarSolicitacoesDoPrestador,
  atualizarStatus,
  cancelarSolicitacao,
} from "../controllers/solicitacoes.controller.js";

const router = express.Router();

router.use(autenticarToken);

router.post("/", criarSolicitacao);
router.get("/minhas", listarSolicitacoesDoCliente);
router.get("/recebidas", listarSolicitacoesDoPrestador);
router.delete("/:id", cancelarSolicitacao);
router.patch("/:id/status", atualizarStatus);

export default router;
