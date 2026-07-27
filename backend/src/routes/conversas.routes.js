import express from "express";
import autenticarToken from "../middlewares/authMiddleware";
import {
  buscarOuCriarConversa,
  buscarMensagens,
  listarMinhasConversas,
} from "../controllers/conversas.controller.ts";

const router = express.Router();

router.post("/", autenticarToken, buscarOuCriarConversa);
router.get("/:conversaId/mensagens", autenticarToken, buscarMensagens);
router.get("/minhas", autenticarToken, listarMinhasConversas);
export const conversaRoutes = router;
