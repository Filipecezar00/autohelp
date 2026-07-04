import { useState } from "react";
import api from "../../services/api.js";
import { FaArrowRight } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import { ImCancelCircle } from "react-icons/im";

import style from "../../../src/Perfil.module.css";

export function PerfilSenha({ aberta, onToggle }) {
  const [form, setForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  function calcularForcaSenha(senha) {
    let pontos = 0;
    if (form.novaSenha.length >= 6) pontos++;
    if (form.novaSenha.length >= 10) pontos++;
    if (/[A-Z]/.test(senha)) pontos++;
    if (/[0-9!@#$%]/.test(senha)) pontos++;
    return pontos;
  }

  const forca = calcularForcaSenha(form.novaSenha);
  const forcaLabel = ["", "Fraca", "Regular", "Boa", "Forte"][forca];
  const cor = ["", "#993c1d", "#854f0b", "#185fa5", "#0f6e56"][forca];

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
    setErro(null);
  };

  const handlePassword = () => {
    setShowPassword(!showPassword);
  };

  async function handleSubmit() {
    if (form.novaSenha !== form.confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }
    if (form.novaSenha.length < 6) {
      setErro("Nova senha deve conter pelo menos 6 caracteres");
      return;
    }
    if (form.senhaAtual === form.novaSenha) {
      setErro("A nova senha deve ser diferente da atual");
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      await api.patch("/perfil/senha", {
        senhaAtual: form.senhaAtual,
        novaSenha: form.novaSenha,
      });

      setSucesso(true);
      setForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message || "Erro ao trocar senha";
      setErro(mensagemErro);
      console.error("Erro ao redefinir senha:", error);
    } finally {
      setSalvando(false);
    }
  }
  return (
    <div>
      <button onClick={onToggle} className={style.btns_header}>
        Trocar Senha <FaArrowRight />
      </button>
      {sucesso ? (
        <div className={style.containerSuccess}>
          <p className={style.messageSuccess}>Senha alterada com sucesso</p>
          <span className={style.icone_fechar}>
            <ImCancelCircle
              onClick={() => {
                setSucesso(false);
                onToggle();
              }}
            />
          </span>
        </div>
      ) : (
        <div>
          <label className={style.labels}>
            Senha Atual:{" "}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha Atual"
              value={form.senhaAtual}
              onChange={handleChange("senhaAtual")}
              className={style.inputs}
            />
          </label>
          <label className={style.labels}>
            Nova Senha :{" "}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nova Senha"
              value={form.novaSenha}
              onChange={handleChange("novaSenha")}
              className={style.inputs}
            />
          </label>
          {form.novaSenha.length > 0 && (
            <div className={style.forcaContainer}>
              <div className={style.forcaBar}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{ background: i <= forca ? cor : "#1a1d24" }}
                    className={style.forcaSegmento}
                  ></div>
                ))}
              </div>
              <p style={{ color: cor }} className={style.hint}>
                {forcaLabel}
              </p>
            </div>
          )}
          <label className={style.labels}>
            Confirmar Nova Senha:{" "}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar Senha"
              value={form.confirmarSenha}
              onChange={handleChange("confirmarSenha")}
              className={style.inputs}
            />
            <span className={style.containerPassword}>
              {showPassword ? (
                <IoEyeSharp onClick={handlePassword} size={18} />
              ) : (
                <FaEyeSlash onClick={handlePassword} size={18} />
              )}
            </span>
          </label>

          {erro && <p>Erro: {erro}</p>}
          <button
            disabled={salvando}
            onClick={handleSubmit}
            className={style.btns_header}
          >
            {salvando ? "Trocando..." : "Confirmar troca"}
          </button>
        </div>
      )}
    </div>
  );
}
