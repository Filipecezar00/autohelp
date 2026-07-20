import express from "express";
import { buscarMensagens } from "../controllers/mensagens.controller";
import autenticarToken = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/:prestadorId", autenticarToken, buscarMensagens);
console.log("Mensagens.routes carregado");
export const mensagensRoutes = router;
