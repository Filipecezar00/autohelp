import cron from "node-cron";
import processarExpiracaoEmLote from "../services/expirarSolicitacoes";

export async function iniciarTodosOsCronJobs(io_global) {
  cron.schedule("* * * * *", async () => {
    console.log("Iniciando varredura de solicitações vencidas...");

    await processarExpiracaoEmLote(io_global);
  });
}
