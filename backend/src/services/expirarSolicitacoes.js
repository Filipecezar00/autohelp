import cron from "node-cron";
import pool from "../config/database";

export async function iniciarJob() {
  const frequenciaCron = "*/5 * * * *";

  cron.schedule(frequenciaCron, async () => {
    try {
      const [resultado] = await pool.query(
        `UPDATE solicitacoes SET status = 'expirado'
             WHERE status = 'pendente' AND data_criacao <= 
             NOW() - INTERVAL 30 MINUTE  `,
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
