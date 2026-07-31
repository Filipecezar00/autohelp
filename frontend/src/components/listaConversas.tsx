import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "../../src/Chat.module.css";

export function ListaConversas() {
  const [conversas, setConversas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function reqApi() {
      try {
        const resposta = await api.get("/conversas/minhas");
        setConversas(resposta.data);
      } catch (error) {
        console.error("Erro ao buscar conversas", error);
      } finally {
        setCarregando(false);
      }
    }
    reqApi();
  }, []);

  return (
    <div className={styles.container_lista}>
      <h2 className={styles.lista}>Sua lista de conversa</h2>
      {carregando ? (
        <p>Carregando conversas....</p>
      ) : (
        <div className={styles.cards}>
          {conversas.map((conversa: any) => (
            <div
              key={conversa.conversa_id}
              onClick={() => navigate(`/chat/${conversa.conversa_id}`)}
              className={styles.conversa}
            >
              {" "}
              <h3>{conversa.nome_outro_usuario}</h3>
              <p>{conversa.ultima_mensagem || "Nenhuma mensagem"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
