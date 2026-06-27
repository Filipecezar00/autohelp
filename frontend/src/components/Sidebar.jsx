import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { TbDoorExit } from "react-icons/tb";
import styles from "../../src/Sidebar.module.css";
import { SidebarItem } from "./SidebarItem";
import { FaMap, FaHistory, FaUser, FaTachometerAlt } from "react-icons/fa";

const MENUS_POR_PERFIL = {
  cliente: [
    { label: "Mapa", path: "/mapa", icone: FaMap },
    { label: "Histórico", path: "/historico", icone: FaHistory },
    { label: "Perfil", path: "/perfil", icone: FaUser },
  ],

  prestador: [
    { label: "Painel", path: "/painelPrestador", icone: FaTachometerAlt },
    { label: "Mapa", path: "/mapa", icone: FaMap },
    { label: "Histórico", path: "/historico", icone: FaHistory },
    { label: "Perfil", path: "/perfil", icone: FaUser },
  ],
};

export const Sidebar = ({ aberta, onFechar }) => {
  const { usuario, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const itensDoMenu = MENUS_POR_PERFIL[usuario?.tipo] ?? [];

  function handleLogout() {
    logout();
    navigate("/login");
    onFechar();
  }

  return (
    <nav className={aberta ? styles.sidebaraberta : styles.sidebarfechada}>
      <div className={styles.headerSidebar}>
        <div className={styles.avatar}>
          {usuario?.nome_usuario?.charAt(0).toUpperCase()}
        </div>
        <div className={styles.info}>
          <strong className={styles.nomeUsuario}>
            {usuario?.nome_usuario}
          </strong>
          <span className={styles.tipoUsuario}>{usuario?.tipo}</span>
        </div>
      </div>

      <ul className={styles.listaMenu}>
        {itensDoMenu.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            ativo={location.pathname === item.path}
            onClick={onFechar}
          />
        ))}
      </ul>
      <button onClick={handleLogout} className={styles.btn_logout}>
        <TbDoorExit /> Sair
      </button>
    </nav>
  );
};
