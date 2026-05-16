const express = require("express");
const router = express.Router();
const prestadoresController = require("../controllers/prestadores.controller.js");
const {
  buscarPrestadoresPorDistancia,
} = require("../controllers/usuarioController.js");

router.get("/", prestadoresController.listar);
router.post("/", prestadoresController.criar);
router.get("/proximos", buscarPrestadoresPorDistancia);
router.get("/:id", prestadoresController.buscarPorId);

module.exports = router;
