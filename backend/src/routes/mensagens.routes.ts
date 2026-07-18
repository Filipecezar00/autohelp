import express from "express";
import { buscarMensagens } from "../controllers/mensagens.controller";
import autenticarToken = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/mensagens/:solicitacaoId", autenticarToken, buscarMensagens);

export const mensagensRoutes = router;
