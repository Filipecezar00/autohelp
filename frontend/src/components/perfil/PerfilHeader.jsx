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

  async function marcarTodasComoLidas() {
    try {
      const requisicao = await api.patch(
        `http://localhost:3001/api/notificacoes/usuario/${perfil.usuario.id}/marcar-todas`,
      );

      if (requisicao) {
        setNotificacoes([]);
      }
    } catch (error) {
      console.error("Erro ao executar função", error);
    }
  }

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
    BuscarNotificacoes(perfil.usuario.id);

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
        <CiBellOn size={24} className={styles.sino} />
        {naolidaCount.length > 0 && (
          <span className={styles.badge}>{naolidaCount.length}</span>
        )}
      </span>
      <div className={styles.listaNotificacoes}>
        {menuAberto === true && (
          <div>
            <header className={styles.cabecalho}>
              <h3 className={styles.tituloCabecalho}>Notificações</h3>
              <button
                className={styles.btn_marcarTodas}
                onClick={() => marcarTodasComoLidas()}
              >
                Marcar Todas
              </button>
            </header>
            {notificacoes.length === 0 ? (
              <small>Nenhuma notificação pendente</small>
            ) : (
              <ul className={styles.lista}>
                {Array.isArray(notificacoes) &&
                  notificacoes.map((item) => (
                    <li key={item.id} className={styles.notificacao}>
                      <h4 className={styles.titulo}>{item.titulo}</h4>
                      <p className={styles.mensagem}>{item.mensagem}</p>
                      <button
                        onClick={() => marcarComoLida(item.id)}
                        className={styles.btn_marcarLida}
                      >
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
        <span className={styles.iconeUser} title="Ver notificações">
          <FaUser size={24} />
        </span>
      </div>
      <div className={styles.headerPerfil}>
        <h2 className={styles.nome}>{perfil.usuario?.nome}</h2>
        <p className={styles.tipo}>{perfil.usuario.tipo}</p>
      </div>
      {perfil.usuario.tipo === "prestador" && (
        <span className={styles.badgePrestador}>
          <p className={styles.tipoPrestador}>{perfil.usuario?.tipo_servico}</p>
        </span>
      )}
    </div>
  );
}
