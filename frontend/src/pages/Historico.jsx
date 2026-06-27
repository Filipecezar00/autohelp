import { useEffect, useState } from "react";
import { FiClock, FiMap } from "react-icons/fi";
import api from "../services/api.js";
import TelaCarregando from "../components/TelaCarregando.jsx";
import TelaErro from "../components/TelaErro.jsx";
import CardSolicitacao from "../components/CardSolicitacao.jsx";
import { useNavigate } from "react-router-dom";
import styles from "../Historico.module.css";

export default function Historico() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    buscarSolicitacoes();
  }, []);

  function buscarPrestadores() {
    navigate("/mapa");
  }

  async function buscarSolicitacoes() {
    try {
      setCarregando(true);
      setErro(null);
      const resposta = await api.get("/solicitacoes/minhas");
      setSolicitacoes(resposta.data);
    } catch {
      setErro("Erro ao carregar historico");
    } finally {
      setCarregando(false);
    }
  }

  async function cancelarSolicitacao(id) {
    const confirmado = window.confirm(
      "Tem certeza que deseja cancelar a solicitação?",
    );
    if (!confirmado) {
      return;
    }

    try {
      setCancelando(id);
      await api.patch("/solicitacoes/" + id + "/status", {
        status: "cancelada",
      });

      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "cancelada" } : s)),
      );
    } catch {
      alert("Não foi possivel cancelar a solicitação. Tente novamente");
    } finally {
      setCancelando(null);
    }
  }

  if (carregando) {
    return <TelaCarregando mensagem="Carregando seu histórico..." />;
  }
  if (erro) {
    return <TelaErro mensagem={erro} onTentar={buscarSolicitacoes} />;
  }

  return (
    <div className={styles.tela}>
      <div className={styles.card}>
        <div className={styles.cabecalho}>
          <h1 className={styles.titulo}>Historico de Solicitações</h1>
          <p className={styles.subtitulo}>
            {solicitacoes.length === 0
              ? "Nenhuma solicitação ainda"
              : `${solicitacoes.length} solicitaç${solicitacoes.length > 1 ? "ões" : ""} encontrada${solicitacoes.length > 1 ? "s" : ""}`}
          </p>
        </div>
        {solicitacoes.length === 0 ? (
          <div className={styles["estado-vazio"]}>
            <p className={styles["estado-vazio-titulo"]}>
              Você ainda não realizou nenhuma solicitação
            </p>
            <button
              className={`${styles.btn} ${styles["btn-primario"]}`}
              onClick={() => navigate("/mapa")}
            >
              <FiMap size={16} />
              Buscar Prestadores
            </button>
          </div>
        ) : (
          <div className={styles.lista}>
            {solicitacoes.map((solicitacao) => (
              <CardSolicitacao
                key={solicitacao.id}
                solicitacao={solicitacao}
                nomeExibido={solicitacao.prestador_nome}
                cancelando={cancelando === solicitacao.id}
                onCancelar={() => cancelarSolicitacao(solicitacao.id)}
              />
            ))}
          </div>
        )}
        <div className={styles.rodape}>
          <button
            className={`${styles.btn} ${styles["btn-secundario"]}`}
            onClick={() => navigate("/mapa")}
          >
            <FiMap size={15} />
            Retornar para Mapa
          </button>
          <button
            className={`${styles.btn} ${styles["btn-primario"]}`}
            onClick={() => navigate("/")}
          >
            <FiClock size={15} />
            Retornar para o Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
