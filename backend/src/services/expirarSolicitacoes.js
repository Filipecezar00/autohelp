import cron from "node-cron";
import pool from "../config/database";
import { io } from "../../server";

export async function iniciarJob() {
  const frequenciaCron = "*/1 * * * *";

  cron.schedule(frequenciaCron, async () => {
    try {
      const [resultado] = await pool.query(
        `UPDATE solicitacoes SET status = 'expirado'
             WHERE status = 'pendente' AND criado_em <= 
             NOW() - INTERVAL 1 MINUTE  `,
      );
      if (resultado.affectedRows > 0) {
        console.log(
          "CRON JOB: " +
            resultado.affectedRows +
            " solicitacoes foram marcadas como expiradas",
        );
      }
    } catch (error) {
      console.log("ERRO AO EXECUTAR CRON:", error);
    }
  });
}

export async function processarExpiracaoEmLote(io) {
  try {
    const [pendentesVencidas] = await pool.query(
      `SELECT id,cliente_id,prestador_id FROM solicitacoes
       WHERE status = 'pendente' AND criado_em <=NOW() - INTERVAL 30 MINUTE`,
    );
    if (pendentesVencidas.length === 0) {
      return;
    }
    const listaDeIds = pendentesVencidas.map((item) => item.id);

    await pool.query(
      `UPDATE solicitacoes SET status='expirado' WHERE id IN(?)`,
      [listaDeIds],
    );

    pendentesVencidas.forEach((item) => {
      const informacaoEvento = {
        solicitacaoId: item.id,
        status: "Expirado",
        mensagem: "A solicitação expirou por tempo limite",
      };

      const canalCliente = "usuario_" + item.cliente_id;
      io.to(canalCliente).emit("solicitacao_expirada", informacaoEvento);
      if (item.prestador_id != null) {
        const canalPrestador = "usuario_" + item.prestador_id;
        io.to(canalPrestador).emit("solicitacao_expirada", informacaoEvento);
      }
    });
    console.log("Notificações de expiração enviadas com sucesso!");
  } catch (error) {
    console.error("ERRO AO PROCESSAR SOLICITAÇÕES EXPIRADAS:", error);
  }
}
