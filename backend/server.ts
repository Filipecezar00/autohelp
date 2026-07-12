import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import prestadoresRoutes from "./src/routes/prestadores.routes.js";
import usuarioRoutes from "./src/routes/usuariosRoutes.js";
import solicitacoesRoutes from "./src/routes/solicitacoes.routes.js";
import perfilRoutes from "./src/routes/perfil.routes.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use((req, res, next) => {
  console.log(`requisição recebida: [${req.method}] ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());

app.use("/api/prestadores", prestadoresRoutes);
app.use("/api/auth", usuarioRoutes);
app.use("/api/solicitacoes", solicitacoesRoutes);
app.use("/api/perfil", perfilRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Funcionando!" });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor Rodando na porta ${PORT}`);
  if (app._router && app._router.stack) {
    app._router.stack.forEach((layer: any) => {
      if (layer.route) {
        console.log(
          `[${Object.keys(layer.route.methods).join(", ").toUpperCase()}] ${layer.route.path}`,
        );
      } else if (layer.name === "router") {
        layer.handle.stack.forEach((stackItem: any) => {
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
export { io };
