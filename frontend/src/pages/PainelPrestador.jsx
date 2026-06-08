import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardSolicitacao from "../components/CardSolicitacao";
export function PainelPrestador() {
  const { usuario } = useContext(AuthContext);

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(null);

  const navigate = useNavigate();
  if (usuario.tipo !== "prestador") {
    return navigate("/mapa");
  }

  useEffect(() => {
    buscarSolicitacao();
  });

  async function buscarSolicitacao() {
    try {
      setCarregando(true);
      const resposta = await api.get("/solicitacoes/recebidas");
      setSolicitacoes(resposta.dados);
    } catch {
      setErro("Erro ao realizar busca de solicações dos clientes");
    } finally {
      setCarregando(false);
    }
  }

  async function atualizarStatus(id, novoStatus) {
    try {
      setAtualizando(id);
      await api.patch("/solicitacoes/" + id + "/status", {
        status: novoStatus,
      });
      setSolicitacoes(
        solicitacoes.map((solicitacao) => {
          if (solicitacao.id === id) {
            status: novoStatus;
          }
        }),
      );
    } catch {
      setErro("Erro ao atualizar status");
      alert("Erro ao Atualizar status");
    } finally {
      setAtualizando(null);
    }

    const pendentesFiltradas = solicitacoes.filter(
      (s) => s.status === "pendente",
    );
    const aceitasFiltradas = solicitacoes.filter((s) => s.status === "aceita");
    const concluidasFiltradas = solicitacoes.filter(
      (s) => s.status === "concluida",
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.cabecalho}>
        <h1 className={styles.titulo}>Painel do Prestador</h1>
        <p className={styles.badge}>{solicitacoes.pendentes}</p>
      </div>
      <div className={styles.cardresposta}>
        <div className={styles.pendentesfiltradas}>
          {solicitacoes.map((solicitacao) => {
            <div className={styles.statusbtns}>
              <CardSolicitacao />
              <button onClick={atualizarStatus(id, "aceita")}>Aceitar</button>
              <button onClick={atualizarStatus(id, "recusada")}>Recusar</button>
            </div>;
          })}
        </div>
      </div>
      <div className={styles.cardemandamento}>
        <div className={styles.solicitacoesemandamento}>
          {solicitacoes.map((solicitacao) => {
            <div className={styles.concluir}>
              <CardSolicitacao />
              <button onClick={atualizarStatus(id, "concluida")}>
                Marcar como concluido
              </button>
            </div>;
          })}
        </div>
      </div>
      <div className={styles.cardhistorico}>
        <div className={styles.historico}>
          {solicitacoes.map((solicitacao) => {
            <CardSolicitacao />;
          })}
        </div>
      </div>
    </div>
  );
}
