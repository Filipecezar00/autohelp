import express from "express";
import autenticarToken from "../middlewares/authMiddleware";
import { buscarOuCriarConversa } from "../controllers/conversas.controller.ts";

const router = express.Router();

router.post("/conversas", autenticarToken, buscarOuCriarConversa);

export default router;
