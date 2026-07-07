import styles from "../CardSolicitacao.module.css";
import { FiX, FiClock, FiTool, FiUser } from "react-icons/fi";
import { FaTrashAlt } from "react-icons/fa";

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
  funcaoDeletar,
}) {
  console.log("A função chegou?", funcaoDeletar);
  const {
    status,
    descricao,
    criado_em,
    tipo_servico,
    nome_prestador,
    cliente_nome,
    prestador_id,
  } = solicitacao;

  const configStatus = CONFIG_STATUS[status] ?? CONFIG_STATUS.pendente;
  const labelTipo = LABEL_TIPO[tipo_servico] ?? tipo_servico;
  const nomePrestador = nome_prestador ?? `Prestador ${prestador_id}`;
  const podeCancelar = status === "pendente" && !cancelando;
  const nomeExibido =
    solicitacao.nome_cliente ||
    solicitacao.nome_prestador ||
    "Usuário Desconhecido";

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
        {status === "pendente" ? (
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
        ) : (
          <button className={styles.containerDelete} onClick={funcaoDeletar}>
            <FaTrashAlt className={styles.btn_excluir} size={16} />
          </button>
        )}
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
      </div>
    </div>
  );
}
