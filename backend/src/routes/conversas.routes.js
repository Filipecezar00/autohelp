import express from "express";
import autenticarToken from "../middlewares/authMiddleware";
import { buscarOuCriarConversa } from "../controllers/conversas.controller.ts";

const router = express.Router();

router.post("/", autenticarToken, buscarOuCriarConversa);

export const conversaRoutes = router;
