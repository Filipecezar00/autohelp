import { FaUser } from "react-icons/fa";
import styles from "../../Perfil.module.css";

export function PerfilHeader({ perfil }) {
  return (
    <div className={styles.containerHeader}>
      <div className={styles.containerUser}>
        <span className={styles.iconeUser}>
          <FaUser size={24} />
        </span>
      </div>
      <div className={styles.headerPerfil}>
        <h2 className={styles.nome}>{perfil.usuario.nome}</h2>
        <p className={styles.tipo}>{perfil.usuario.tipo}</p>
      </div>
      {perfil.usuario.tipo === "prestador" && (
        <span className={styles.badgePrestador}>
          <p className={styles.tipoPrestador}>{perfil.usuario.tipo_servico}</p>
        </span>
      )}
    </div>
  );
}
