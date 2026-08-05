import { FaUser } from "react-icons/fa";
import styles from "../../Perfil.module.css";
import { CiBellOn } from "react-icons/ci";
import { FaCheck } from "react-icons/fa";
import { useState } from "react";

export function PerfilHeader({ perfil }) {
  const [notificacoes, setNotificacoes] = useState([]);

  async function BuscarNotificacoes() {
    const req = await api.get("http://localhost:3001/api/notificacoes/5");
    const resposta = req.data;
    setNotificacoes(resposta);

    BuscarNotificacoes();

    socket.on("status_atualizado", (novaNotificacao) => {
      toast.success(novaNotificacao.mensagem);
      setNotificacoes((listaAnterior) => [novaNotificacao, ...listaAnterior]);
    });
  }

  async function marcarComoLida(idNotificacao) {
    await api.patch(
      `http://localhost:3001/api/notificacoes/${idNotificacao}/lida`,
    );
    setNotificacoes((listaAnterior) =>
      listaAnterior.filter((item) => item.id !== idNotificacao),
    );
    const filtragem = req.filter((id) => id === idNotificacao);

    setNotificacoes(filtragem);
  }
  return (
    <div className={styles.containerHeader}>
      <span className={styles.headerNotificacoes}>
        <CiBellOn size={24} />
        {notificacoes.length}
      </span>
      <div className={styles.listaNotificacoes}>
        {notificacoes.length === 0 ? (
          <small>Nenhuma notificação pendente</small>
        ) : (
          <ul>
            {notificacoes.map((item) => (
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
