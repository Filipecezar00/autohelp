import { FaUser } from "react-icons/fa";
import styles from "../../Perfil.module.css";

export function PerfilHeader({ perfil }) {
  return (
    <div className={styles.containerHeader}>
      <div className={styles.containerUser}>
        <span className={styles.iconeUser}>
          <FaUser size={24} />
        </span>
        <div className={styles.headerPerfil}>
          <h2>{perfil.nome}</h2>
          <p>{perfil.tipo}</p>
        </div>
        {perfil.tipo === "prestador" && (
          <p>Especialidade: {perfil.tipo_servico}</p>
        )}
      </div>
    </div>
  );
}
