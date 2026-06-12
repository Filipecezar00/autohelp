require("dotenv").config();
const express = require("express");
const cors = require("cors");

const prestadoresRoutes = require("./src/routes/prestadores.routes");
const usuarioRoutes = require("./src/routes/usuariosRoutes");
const solicitacoesRoutes = require("./src/routes/solicitacoes.routes");

const app = express();
app.use((req, res, next) => {
  console.log(`requisição recebida: [${req.method}] ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/prestadores", prestadoresRoutes);
app.use("/api/auth", usuarioRoutes);
app.use("/api/solicitacoes", solicitacoesRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Funcionando!" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Rodando na porta ${PORT}`);
  if (app._router && app._router.stack) {
    app._router.stack.forEach((layer) => {
      if (layer.route) {
        console.log(
          `[${Object.keys(layer.route.methods).join(", ").toUpperCase()}] ${layer.route.path}`,
        );
      } else if (layer.name === "router") {
        layer.handle.stack.forEach((stackItem) => {
          if (stackItem.route) {
            console.log(
              `[${Object.keys(stackItem.route.methods).join(", ").toUpperCase()}] ${stackItem.route.path}`,
            );
          }
        });
      }
    });
  }
});
