import { useState } from "react";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { Outlet } from "react-router-dom";
import styles from "../../src/Layout.module.css";
import { Sidebar } from "../components/Sidebar";

export function Layout() {
  const [sidebarAberta, setsidebarAberta] = useState(false);

  const toggleSidebar = () => {
    setsidebarAberta(!sidebarAberta);
  };

  const fecharSidebar = () => {
    setsidebarAberta(false);
  };

  return (
    <div className={styles.container}>
      {sidebarAberta && (
        <div className={styles.overlay} onClick={fecharSidebar} />
      )}
      <Sidebar aberta={sidebarAberta} onFechar={fecharSidebar} />
      <div className={styles.areaPrincipal}>
        <div className={styles.topbar}>
          {sidebarAberta ? (
            <button onClick={fecharSidebar} className={styles.menuButton}>
              <IoMdClose size={24} />
            </button>
          ) : (
            <button onClick={toggleSidebar} className={styles.menuButton}>
              <CiMenuBurger size={24} />
            </button>
          )}
        </div>
        <div className={styles.conteudo}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
