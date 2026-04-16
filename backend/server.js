require("dotenv").config();
const express = require("express");
const cors = require("cors");

const prestadoresRoutes = require("./src/routes/prestadores.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/prestadores", prestadoresRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Funcionando!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Rodando na porta ${PORT}`);
});
