import { useEffect, useState } from "react";
import api from "../services/api.js";
import TelaCarregando from "../components/TelaCarregando.jsx";
import TelaErro from "../components/TelaErro.jsx";
import CardSolicitacao from "../components/CardSolicitacao.jsx";
import { useNavigate } from "react-router-dom";

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

      setSolicitacoes(
        solicitacoes.map((solicitacao) => {
          if (solicitacao.id === id) {
            return { ...solicitacao, status: "cancelada" };
          }
          return solicitacao;
        }),
      );
    } catch {
      setErro("Não foi possivel cancelar");
    } finally {
      setCancelando(null);
    }
  }

  if (carregando) {
    return <TelaCarregando />;
  }
  if (erro) {
    return <TelaErro />;
  }

  return (
    <div>
      <h1>Historico de Solicitações</h1>
      {solicitacoes.length === 0 ? (
        <div>
          <p>Você ainda não realizou nenhuma solicitação</p>
          <button onClick={buscarPrestadores}>Buscar Prestadores</button>
        </div>
      ) : (
        solicitacoes.map((solicitacao) => {
          return (
            <CardSolicitacao
              key={solicitacao.id}
              solicitacao={solicitacao}
              cancelando={cancelando === solicitacao.id}
              onCancelar={() => cancelarSolicitacao(solicitacao.id)}
            />
          );
        })
      )}
    </div>
  );
}
