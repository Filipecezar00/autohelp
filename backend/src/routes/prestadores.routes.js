const express = require("express");
const router = express.Router();
const prestadoresController = require("../controllers/prestadores.controller.js");

router.get("/", prestadoresController.listar);
router.get("/:id", prestadoresController.buscarPorId);
router.post("/", prestadoresController.criar);

module.exports = router;
