import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { createServer, METHODS } from "http";
import { iniciarTodosOsCronJobs } from "./src/services/cron.js";
import pool from "./src/config/database.js";
import { Server, Socket } from "socket.io";
import type { novaNotificacao } from "./src/socket/tipos.js";
const jwt = require("jsonwebtoken");
import {
  iniciarJob,
  processarExpiracaoEmLote,
} from "./src/services/expirarSolicitacoes.js";

import type { EventosCliente, EventosServidor } from "./src/socket/tipos.js";

import { registrarEventosChat } from "./src/socket/chat.socket.js";

import prestadoresRoutes from "./src/routes/prestadores.routes.js";
import usuarioRoutes from "./src/routes/usuariosRoutes.js";
import solicitacoesRoutes from "./src/routes/solicitacoes.routes.js";
import perfilRoutes from "./src/routes/perfil.routes.js";
import { conversaRoutes } from "./src/routes/conversas.routes.js";
const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (
      !origin ||
      origin.endsWith(".vercel.app") ||
      origin.includes("localhost")
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Bloqueado pelo CORS`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],

  credentials: true,
};

const io = new Server<EventosCliente, EventosServidor>(httpServer, {
  cors: corsOptions,
});

app.set("io", io);

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Token não fornecido"));
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    const dadosDoToken = jwt.verify(token, JWT_SECRET);

    socket.data.usuario = dadosDoToken;

    next();
  } catch (error) {
    return next(new Error("Token inválido"));
  }
});

app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

app.use("/api/prestadores", prestadoresRoutes);
app.use("/api/auth", usuarioRoutes);
app.use("/api/solicitacoes", solicitacoesRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/conversas", conversaRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API Funcionando!" });
});

io.on("connection", (socket) => {
  const idSeguro = socket.data.usuario.id;
  socket.join("usuario_" + idSeguro);
  console.log("Usuário autenticado entrou na sala!");
});

app.get("/api/notificacoes/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const [notificacoes]: any = await pool.query(
      `SELECT id,titulo,mensagem,criado_em FROM notificacoes WHERE usuario_id = ? AND lida=FALSE ORDER BY criado_em DESC`,
      [usuarioId],
    );

    return res.json({
      sucesso: true,
      totalNaoLidas: notificacoes.length,
      dados: notificacoes,
    });
  } catch (error) {
    console.log("Erro ao realizar busca por notificações", error);
    return res
      .status(500)
      .json({ message: "Erro ao realizar busca por notificações" });
  }
});

app.post("/api/notificacoes", async (req, res) => {
  try {
    const { usuarioId, titulo, mensagem } = req.body;

    const [resultado]: any = await pool.query(
      `INSERT INTO notificacoes (usuario_id,titulo,mensagem,lida)
       VALUES (?,?,?,FALSE)`,
      [usuarioId, titulo, mensagem],
    );

    const [status_solicitacao]: any = await pool.query(
      `SELECT status FROM solicitacoes WHERE cliente_id = ? `,
      [usuarioId],
    );

    const solicitacao = status_solicitacao[0];

    const status = solicitacao.status;

    const novaNotificacao: novaNotificacao = {
      id: resultado.insertId,
      usuarioId: usuarioId,
      status: status,
      titulo: titulo,
      mensagem: mensagem,
      lida: false,
    };

    io.to(`usuario_${usuarioId}`).emit("nova_notificacao", novaNotificacao);

    return res.status(201).json(novaNotificacao);
  } catch (error) {
    console.error("ERRO AO EXECUTAR POST DA API DE NOTIFICAÇÕES", error);
    return res.status(500).json({ message: "ERRO AO CONCLUIR OPERAÇÃO" });
  }
});

app.patch("/api/notificacoes/:id/lida", async (req, res) => {
  try {
    const { id } = req.params;
    const [notificacoesLidas]: any = await pool.query(
      `
      UPDATE notificacoes SET lida = TRUE WHERE id = ?
    `,
      [id],
    );
    if (notificacoesLidas.affectedRows === 0) {
      return res.status(404).json("Notificação não encontrada");
    } else {
      return res
        .status(200)
        .json({ message: "Sucesso ao realizar leitura da mensagem" });
    }
  } catch (error) {
    console.error("ERRO AO REALIZAR LEITURA DA MENSAGEM", error);
    return res
      .status(500)
      .json({ message: "ERRO AO REALIZAR TROCA DE STATUS DA MENSAGEM" });
  }
});

app.patch(`/api/notificacoes/usuario/:id/marcar-todas`, async (req, res) => {
  try {
    const { id } = req.params;

    const [notificacao] = await pool.query(
      `UPDATE notificacoes SET lida = true WHERE usuario_id = ? AND lida=false`,
      [id],
    );
    return res
      .status(200)
      .json({ message: "Todas as notificações foram marcadas como lidas" });
  } catch (error) {
    console.log("ERRO AO REALIZAR A EXECUÇÃO DE MARCAR TODAS:", error);
    return res.status(500).json({ message: "Erro ao marcar todas" });
  }
});

app.get("/api/teste-notificacao/:usuarioId", async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const titulo = "Atualização de Status";
    const mensagem = "Notificação salva no banco e enviada em tempo real!";

    const [resultado]: any = await pool.query(
      `INSERT INTO notificacoes (usuario_id,titulo,mensagem)VALUES(?,?,?)`,
      [usuarioId, titulo, mensagem],
    );
    const novaNotificacao = {
      id: resultado.insertId,
      usuarioId: Number(usuarioId),
      titulo,
      mensagem,
      lida: false,
      criadoEm: new Date(),
    };
    (req as any).io
      .to(`usuario_${usuarioId}`)
      .emit("status_atualizado", novaNotificacao);

    return res.json({
      sucesso: true,
      mensagem: ``,
    });
  } catch (error) {
    console.log("Erro ao salvar historico de notificação", error);
  }
});

registrarEventosChat(io);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Servidor Rodando na porta ${PORT}`);
  iniciarJob();
  iniciarTodosOsCronJobs(io);
  processarExpiracaoEmLote(io);
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
