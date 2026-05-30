import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import TelaCarregando from "../components/TelaCarregando";
import TelaErro from "../components/TelaErro";
import { useNavigate } from "react-router-dom";
import { GiConfirmed } from "react-icons/gi";
import styles from "../../src/Solicitacao.module.css";

import api from "../services/api";
export default function Solicitacao() {
  const { prestadorId } = useParams();

  const [prestador, setPrestador] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const dadosVindosDoMapa = location.state;

  useEffect(() => {
    async function carregarDadosPrestador() {
      try {
        const resposta = await api.get(`/prestadores/${prestadorId}`);
        console.log("DADOS REAIS DO PRESTADOR VINDO DO BACKEND");
        console.log(resposta.data);
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
    if (descricao.length < 10) {
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
      if (erro.response && erro.response.status === 409) {
        setErro("Você já tem uma solicitação ativa com esse prestador.");
      } else {
        setErro("Erro ao enviar solicitação. Tente novamente");
      }
    } finally {
      setEnviando(false);
    }
  }
  if (carregando) {
    return <TelaCarregando />;
  }
  if (erro && prestador === null) {
    return <TelaErro message={"Prestador não encontrado"} />;
  }

  if (sucesso) {
    return (
      <div>
        <GiConfirmed />
        <p>Solicitação enviada com Sucesso!</p>
        <p>O Prestador foi notificado e entrará em contato.</p>
        <button onClick={IrParaHistorico}>Ver minhas solicitações</button>
        <button onClick={IrParaMapa}>Voltar ao Mapa</button>
      </div>
    );
  } else {
    return (
      <div className={styles.cardPrestador}>
        {prestador && (
          <div>
            <h1>{dadosVindosDoMapa?.nome || `Prestador ${prestador.id}`}</h1>
            <p>Especialidade: {prestador.tipo_servico}</p>
            <p>Telefone: {prestador.telefone}</p>
            <p>Descrição: {prestador.descricao}</p>
            {dadosVindosDoMapa?.distancia && (
              <p>Distância: {dadosVindosDoMapa.distancia} km</p>
            )}
          </div>
        )}
        <textarea
          placeholder="Ex: pneu furado na rua X, próximo ao Y"
          onChange={feedBackTexto}
          value={descricao}
          required
        >
          Descreva com detalhes seu Problema
        </textarea>
        <small>Caracteres Digitados:{descricao.length}</small>
        {erro && <p>{erro}</p>}
        <button
          disabled={enviando || descricao.trim().length < 10}
          onClick={handleSubmit}
        >
          {enviando ? "Enviando" : "Enviar Solicitação"}
        </button>
      </div>
    );
  }
}
