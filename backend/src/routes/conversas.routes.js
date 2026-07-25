import express from "express";
import autenticarToken from "../middlewares/authMiddleware";
import {
  buscarOuCriarConversa,
  buscarMensagens,
} from "../controllers/conversas.controller.ts";

const router = express.Router();

router.post("/", autenticarToken, buscarOuCriarConversa);
router.get("/:conversaId/mensagens", autenticarToken, buscarMensagens);

export const conversaRoutes = router;
