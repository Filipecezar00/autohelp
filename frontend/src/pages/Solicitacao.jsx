import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  FiAlertCircle,
  FiMapPin,
  FiPhone,
  FiTool,
  FiSend,
} from "react-icons/fi";
import TelaCarregando from "../components/TelaCarregando";
import TelaErro from "../components/TelaErro";
import { useNavigate } from "react-router-dom";
import { GiConfirmed } from "react-icons/gi";
import styles from "../../src/Solicitacao.module.css";

import api from "../services/api";

const LABEL_TIPO = {
  mecanico: "Mecânico",
  borracheiro: "Borracheiro",
  guincho: "Guincho",
};

export default function Solicitacao() {
  const { prestadorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dadosVindosDoMapa = location.state;

  const [prestador, setPrestador] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDadosPrestador() {
      try {
        const resposta = await api.get(`/prestadores/${prestadorId}`);
        setPrestador(resposta.data);
      } catch (err) {
        setErro("Prestador não encontrado");
      } finally {
        setCarregando(false);
      }
    }
    carregarDadosPrestador();
  }, [prestadorId]);

  const feedBackTexto = (e) => {
    setDescricao(e.target.value);
  };

  const IrParaHistorico = () => {
    navigate("/historico");
  };

  const IrParaMapa = () => {
    navigate("/mapa");
  };

  async function handleSubmit() {
    if (!descricao.trim()) {
      setErro("Descreva o Problema para continuar");
      return;
    }
    if (descricao.trim().length < 10) {
      setErro("Descrição muito curta - detalhe um Pouco mais");
      return;
    }

    try {
      setEnviando(true);
      setErro(null);

      await api.post("/solicitacoes", {
        prestador_id: prestadorId,
        descricao: descricao.trim(),
      });

      setSucesso(true);
    } catch (erro) {
      if (erro.response && erro.response?.status === 409) {
        setErro("Você já tem uma solicitação ativa com esse prestador.");
      } else {
        setErro("Erro ao enviar solicitação. Tente novamente");
      }
    } finally {
      setEnviando(false);
    }
  }
  if (carregando) {
    return <TelaCarregando mensagem="Carregando dados do prestador..." />;
  }
  if (erro && !prestador) {
    return (
      <TelaErro
        message="Prestador não encontrado"
        onTentar={() => navigate("/mapa")}
      />
    );
  }

  if (sucesso) {
    return (
      <div className={styles.tela}>
        <div className={styles.cardSucesso}>
          <div className={styles.iconeSucesso}>
            <GiConfirmed size={48} />
          </div>
          <h2 className={styles.tituloSucesso}>Solicitação enviada!</h2>
          <p className={styles.textoSucesso}>
            O Prestador foi notificado e entrará em contato em breve.
          </p>
          <div className={styles.botoesRow}>
            <button
              className={styles.btnSecundario}
              onClick={() => navigate("/mapa")}
            >
              Voltar ao Mapa
            </button>
            <button
              className={styles.btnPrimario}
              onClick={() => navigate("/historico")}
            >
              Ver Solicitações
            </button>
          </div>
        </div>
      </div>
    );
  }

  const nomePrestador = dadosVindosDoMapa?.nome || `Prestador ${prestador?.id}`;
  const caracteresRestantes = 500 - descricao.length;
  const podeEnviar = !enviando && descricao.trim().length >= 10;

  return (
    <div className={styles.tela}>
      <div className={styles.card}>
        <div className={styles.cabecalho}>
          <h1 className={styles.titulo}>Solicitar Serviço</h1>
          <p className={styles.subtitulo}>
            Confirme os dados e descreva o problema
          </p>
        </div>

        {prestador && (
          <div className={styles.cardPrestador}>
            <div className={styles.prestadorNome}>
              <span className={styles.avatar}>
                <div>
                  <strong className={styles.nome}>{nomePrestador}</strong>
                  <span className={styles.badgeTipo}>
                    {LABEL_TIPO[prestador.tipo_servico] ??
                      prestador.tipo_servico}
                  </span>
                </div>
              </span>
            </div>
          </div>
        )}
        <div className={styles.prestadorInfo}>
          {prestador.telefone && (
            <span className={styles.infoItem}>
              <FiPhone size={13} /> {prestador.telefone}
            </span>
          )}
          {dadosVindosDoMapa?.distancia && (
            <span className={styles.infoItem}>
              <FiMapPin size={13} />
              {dadosVindosDoMapa.distancia} km de você
            </span>
          )}
          {prestador.descricao && (
            <span className={styles.infoItem}>
              <FiTool size={13} /> {prestador.descricao}
            </span>
          )}

          <div className={styles.formulario}>
            <label className={styles.label} htmlFor="descricao">
              Descreva o Problema
            </label>
            <textarea
              id="descricao"
              className={styles.textarea}
              placeholder="Ex: pneu furado na Rua das Flores, próximo ao mercado novo."
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                if (erro) setErro(null);
              }}
              maxLength={500}
              rows={4}
            ></textarea>

            <div className={styles.contadorRow}>
              <span className={styles.contador}>{descricao.length} / 500</span>
              {descricao.length >= 450 && (
                <span className={styles.contadorAlerta}>
                  {caracteresRestantes} restantes
                </span>
              )}
            </div>
            {erro && (
              <div className={styles.erroBadge}>
                <FiAlertCircle size={14} />
                <span>{erro}</span>
              </div>
            )}
            <button
              className={`${styles.btnEnviar} ${!podeEnviar ? styles.btnDesabilitado : styles.btnAtivo}`}
              onClick={handleSubmit}
              disabled={!podeEnviar}
              aria-disabled={!podeEnviar}
            >
              {enviando ? (
                <>
                  <span className={styles.spinner}>Enviando...</span>
                </>
              ) : (
                <>
                  <FiSend size={16} />
                  {podeEnviar ? "Enviar Solicitação" : "Preencha o campo acima"}
                </>
              )}
            </button>
            {descricao.trim().length < 10 && descricao.length > 0 && (
              <p className={styles.dica}>
                Mínimo 10 caracteres - {10 - descricao.trim().length} restantes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
