import cron from "node-cron";
import { processarExpiracaoEmLote } from "../services/expirarSolicitacoes.js";
import "dotenv/config";

export async function iniciarTodosOsCronJobs(io_global) {
  cron.schedule("* * * * *", async () => {
    await processarExpiracaoEmLote(io_global);
  });
}
