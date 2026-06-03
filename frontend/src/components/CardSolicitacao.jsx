import styles from "../CardSolicitacao.module.css";
import { IoMdClose } from "react-icons/io";

export default function CardSolicitacao({
  solicitacao,
  cancelando,
  onCancelar,
}) {
  const { id, status, descricao, criado_em, tipo_servico, nome_prestador } =
    solicitacao;

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardAlinhamento}>
        {status === "pendente" && (
          <button
            onClick={onCancelar}
            disabled={cancelando}
            className={styles.btnDeletar}
            title="Cancelar Solicitacao"
          >
            {cancelando ? "..." : <IoMdClose size={18} />}
          </button>
        )}
        <div className={styles.infoGrupo}>
          <strong className={styles.nomePrincipal}>
            {nome_prestador || `Prestador ${solicitacao.prestador_id}`}
          </strong>
          <span className={styles.badgeTipo}>{tipo_servico}</span>
        </div>
        <p className={styles.descricaoTexto}>{descricao}</p>

        <div className={styles.rodapeCard}>
          <span className={`${styles.statusBadge} ${styles[status]}`}>
            {status.toUpperCase()}
          </span>
          <small className={styles.dataTexto}>
            {new Date(criado_em).toLocaleDateString("pt-BR")}
          </small>
        </div>
      </div>
    </div>
  );
}
