import styles from "../CardSolicitacao.module.css";
import { FiX, FiClock, FiTool, FiUser } from "react-icons/fi";
import { FaTrashAlt } from "react-icons/fa";
import api from "../services/api.js";
import { useState, useEffect } from "react";
import { CiClock1 } from "react-icons/ci";

const CONFIG_STATUS = {
  pendente: { label: "Aguardando", classe: "pendente" },
  aceita: { label: "Aceita", classe: "aceita" },
  recusada: { label: "Recusada", classe: "recusada" },
  concluida: { label: "Concluida", classe: "concluida" },
  cancelada: { label: "Cancelada", classe: "cancelada" },
};

const LABEL_TIPO = {
  mecanico: "Mecânico",
  borracheiro: "Borracheiro",
  guincho: "Guincho",
};

function formatarData(dataString) {
  const data = new Date(dataString);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (data.toDateString() === hoje.toDateString()) return "Hoje";
  if (data.toDateString() === ontem.toDateString()) return "Ontem";

  return data.toLocaleDateString("pt-br", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CardSolicitacao({
  solicitacao,
  cancelando,
  onCancelar,
  setSolicitacoes,
}) {
  const {
    status,
    descricao,
    criado_em,
    tipo_servico,
    nome_prestador,
    cliente_nome,
    prestador_id,
  } = solicitacao;

  const [estaExpirado, setEstaExpirado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(() => {
    return CalcularTempoRestante(criado_em);
  });
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const temporizador = setInterval(() => {
      setTempoRestante((tempoAnterior) => {
        if (tempoAnterior > 1) {
          return tempoAnterior - 1;
        } else {
          setEstaExpirado(true);
          clearInterval(temporizador);

          setSolicitacoes((listaAnterior) => {
            listaAnterior.filter((item) => item.id !== solicitacao.id);
          });
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(temporizador);
  }, [solicitacao.id, setSolicitacoes]);

  function CalcularTempoRestante(dataDeCriacaoDaSolicitacao) {
    if (
      !dataDeCriacaoDaSolicitacao ||
      isNaN(new Date(dataDeCriacaoDaSolicitacao).getTime())
    ) {
      return 1800;
    }
    const horaDaCriacao = new Date(dataDeCriacaoDaSolicitacao).getTime();
    const horaDeAgora = new Date().getTime();

    const diferencaMilissegundos = Math.floor(horaDeAgora - horaDaCriacao);
    const segundosPassados = Math.trunc(diferencaMilissegundos / 1000);

    const limiteMaximoSegundos = 30 * 60;
    const segundosRestantes = limiteMaximoSegundos - segundosPassados;

    if (segundosRestantes > 0) {
      return segundosRestantes;
    } else {
      return 0;
    }
  }

  async function deletarSolicitacoes() {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        "/solicitacoes/" + solicitacao.id + "/esconder",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSolicitacoes((listaAnterior) =>
        listaAnterior.filter((item) => item.id !== solicitacao.id),
      );
    } catch (error) {
      setErro("Não foi possível remover esse item do histórico.");
    }
  }

  const configStatus = CONFIG_STATUS[status] ?? CONFIG_STATUS.pendente;
  const labelTipo = LABEL_TIPO[tipo_servico] ?? tipo_servico;
  const nomePrestador = nome_prestador ?? `Prestador ${prestador_id}`;
  const podeCancelar = status === "pendente" && !cancelando;
  const nomeExibido =
    solicitacao.nome_cliente ||
    solicitacao.nome_prestador ||
    "Usuário Desconhecido";

  const FormatarParaMinutosESegundos = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;

    return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
  };
  const corDoCronometro = (totalSegundos) => {
    const minutos = Math.floor(totalSegundos / 60);

    if (minutos > 20) {
      return "cronometro-verde";
    } else if (minutos > 10) {
      return "cronometro-amarelo";
    } else {
      return "cronometro-vermelho";
    }
  };

  const classeCor = styles[corDoCronometro(tempoRestante)];

  return (
    <div className={styles.card}>
      <div className={styles.cabecalho}>
        <div className={styles.prestadorInfo}>
          <span className={styles.avatarIcone}>
            <FiUser size={14} />
          </span>
          <div className={styles.containerHeader}>
            <strong className={styles.nomePrestador}>{nomeExibido}</strong>
            <span className={styles.badgeTipo}>
              <FiTool size={10} />
              {labelTipo}
            </span>
          </div>
        </div>
        {solicitacao.status === "pendente" && (
          <button
            className={`${styles.btnCancelar} ${!podeCancelar ? styles.btnCancelarDesabilitado : ""}`}
            onClick={onCancelar}
            disabled={!podeCancelar}
            title="Cancelar Solicitação"
            aria-label="Cancelar solicitação"
          >
            {cancelando ? (
              <span className={styles.spinnerPequeno} />
            ) : (
              <FiX size={16} />
            )}
          </button>
        )}
        <button
          className={styles.containerDelete}
          onClick={deletarSolicitacoes}
        >
          <FaTrashAlt className={styles.btn_excluir} size={16} />
        </button>
      </div>
      <p className={styles.descricao}>{descricao}</p>

      <div className={styles.rodape}>
        <span
          className={`${styles.badgeStatus} ${styles[configStatus.classe]}`}
        >
          {configStatus.label}
        </span>
        <span className={styles.data}>
          <FiClock size={11} />
          {formatarData(criado_em)}
        </span>
        <span className={`${styles.cronometro} ${classeCor}`}>
          {estaExpirado === true ? null : (
            <>
              <CiClock1 style={{}} />{" "}
              {FormatarParaMinutosESegundos(tempoRestante)}
            </>
          )}
        </span>
      </div>
    </div>
  );
}
