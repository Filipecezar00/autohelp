import { useNavigate } from "react-router-dom";
import styles from "../../src/Sidebar.module.css";

export function SidebarItem({ item, ativo, onClick }) {
  const navigate = useNavigate();

  const IconeComponente = item.icone;

  const handleClick = () => {
    navigate(item.path);
    onClick();
  };
  return (
    <li className={ativo ? styles.itemativo : styles.item}>
      <button onClick={handleClick} className={styles.botaoItem}>
        <span className={styles.icone}>
          <IconeComponente size={20} />
        </span>
        <span className={styles.label}>{item.label}</span>
      </button>
      {ativo && <div className={styles.indicadorativo} />}
    </li>
  );
}
