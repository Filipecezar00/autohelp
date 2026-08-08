import { FaUser } from "react-icons/fa";
import styles from "../../Perfil.module.css";
import { CiBellOn } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { useEffect, useState } from "react";
import socket from "../../services/socket";
import api from "../../services/api";
import { toast } from "react-toastify";
export function PerfilHeader({ perfil }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);

  const naolidaCount = notificacoes.filter((notificacao) => {
    return notificacao.lida === false;
  });

  function toggleNotificacoes() {
    setMenuAberto(!menuAberto);
  }
  useEffect(() => {
    async function BuscarNotificacoes(id) {
      try {
        const req = await api.get(
          `http://localhost:3001/api/notificacoes/${id}`,
        );
        if (Array.isArray(req.data)) {
          setNotificacoes(req.data);
        } else {
          setNotificacoes([]);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações,", error);
        setNotificacoes([]);
      }
    }
    BuscarNotificacoes(perfil.id);

    const tratarNotificacao = (novaNotificacao) => {
      toast.success(novaNotificacao.mensagem);
      setNotificacoes((listaAnterior) => [novaNotificacao, ...listaAnterior]);
    };

    socket.on("status_atualizado", tratarNotificacao);

    return () => {
      socket.off("status_atualizado", tratarNotificacao);
    };
  }, []);

  async function marcarComoLida(idNotificacao) {
    try {
      await api.patch(
        `http://localhost:3001/api/notificacoes/${idNotificacao}/lida`,
      );
      setNotificacoes((listaAnterior) =>
        listaAnterior.filter((item) => item.id !== idNotificacao),
      );
    } catch (error) {
      console.error("ERRO AO MARCAR COMO LIDA:", error);
    }
  }
  return (
    <div className={styles.containerHeader}>
      <span
        className={styles.headerNotificacoes}
        onClick={() => toggleNotificacoes()}
      >
        {naolidaCount.length > 0 &&
          `Notificações não lidas:${naolidaCount.length}`}
        <CiBellOn size={24} />
      </span>
      <div className={styles.listaNotificacoes}>
        {menuAberto === true && (
          <div>
            <header>Notificações</header>
            {notificacoes.length === 0 ? (
              <small>Nenhuma notificação pendente</small>
            ) : (
              <ul>
                {Array.isArray(notificacoes) &&
                  notificacoes.map((item) => (
                    <li key={item.id}>
                      <h3>{item.titulo}</h3>
                      <p>{item.mensagem}</p>
                      <button onClick={() => marcarComoLida(item.id)}>
                        marcar como lida <FaCheck size={24} />
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </div>

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
