import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../frontend/src/contexts/AuthContext";
import api from "../services/api";
import TelaCarregando from "../components/TelaCarregando";
import TelaErro from "../components/TelaErro";
import styles from "../Perfil.module.css";
import { PerfilHeader } from "../components/perfil/PerfilHeader";
import { PerfilDados } from "../components/perfil/PerfilDados";
import { PerfilSenha } from "../components/perfil/PerfilSenha";
import { ZonaPerigo } from "../components/ZonaPerigo";

export function Perfil({ handleDeletar }) {
  const { usuario, setUsuario, logout } = useContext(AuthContext);

  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modoEdicao, setmodoEdicao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarDelecao, setmostrarDelecao] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    descricao: "",
  });

  useEffect(() => {
    async function buscarDadosDoPerfil() {
      try {
        const resposta = await api.get("/perfil");
        console.log("DADOS QUE CHEGARAM DA API:", resposta.data);
        setPerfil(resposta.data);

        setForm({
          nome: resposta.data.nome,
          telefone: resposta.data.telefone ?? "",
          descricao: resposta.data.descricao ?? "",
        });
      } catch (error) {
        setErro("ERRO AO CARREGAR PERFIL");
        console.error("Erro ao buscar dados do perfil", error);
      } finally {
        setCarregando(false);
      }
    }
    buscarDadosDoPerfil();
  }, []);

  async function handleSalvar() {
    if (form.nome.trim().length < 2) {
      setErro("Nome muito curto");
      return;
    }
    try {
      setSalvando(true);
      setErro(null);

      const resposta = await api.put("/perfil", form);

      setPerfil(resposta.data.usuario);

      const usuarioAtualizado = {
        ...usuario,
        nome: form.nome,
      };

      setUsuario(usuarioAtualizado);
      localStorage.setItem("user", JSON.stringify(usuarioAtualizado));

      setmodoEdicao(false);
      setSucesso("Perfil atualizado com sucesso!");

      setTimeout(() => {
        setSucesso(null);
      }, 3000);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setErro("Erro ao salvar as alterações");
    } finally {
      setSalvando(false);
    }
  }

  async function handleCancelar() {
    setForm({
      nome: perfil.nome,
      telefone: perfil.telefone ?? "",
      descricao: perfil.descricao ?? "",
    });
    setmodoEdicao(false);
    setErro(null);
  }
  if (carregando) {
    return <div>Carregando dados do perfil...</div>;
  }

  if (erro && !perfil) {
    return <div>Erro ao carregar o perfil.Tente recarregar a página</div>;
  }

  return (
    <div className={styles.containerPerfil}>
      <PerfilHeader perfil={perfil} />
      {sucesso && (
        <div className={styles.alertaSucesso}>
          <p>{sucesso}</p>
        </div>
      )}
      {erro && (
        <div className={styles.alertaErro}>
          <p>{erro}</p>
        </div>
      )}
      <PerfilDados
        perfil={perfil}
        form={form}
        modoEdicao={modoEdicao}
        salvando={salvando}
        onEditar={() => setmodoEdicao(true)}
        onCancelar={handleCancelar}
        onSalvar={handleSalvar}
        onChange={(campo, valor) => setForm({ ...form, [campo]: valor })}
      />

      {usuario.tipo === "prestador" && <PerfilPrestador perfil={perfil} />}
      {!modoEdicao && (
        <PerfilSenha
          aberta={mostrarSenha}
          onToggle={() => setMostrarSenha(!mostrarSenha)}
        />
      )}

      {!modoEdicao && (
        <ZonaPerigo
          aberta={mostrarDelecao}
          onToggle={() => setmostrarDelecao(!mostrarDelecao)}
          onConfirmar={handleDeletar}
        />
      )}
    </div>
  );
}
