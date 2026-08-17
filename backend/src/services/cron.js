import cron from "node-cron";
import { processarExpiracaoEmLote } from "../services/expirarSolicitacoes.js";

export async function iniciarTodosOsCronJobs(io_global) {
  cron.schedule("* * * * *", async () => {
    await processarExpiracaoEmLote(io_global);
  });
}
