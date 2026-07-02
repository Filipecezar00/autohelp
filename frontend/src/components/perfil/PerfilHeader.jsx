import { FaUser } from "react-icons/fa";

export function PerfilHeader({ perfil }) {
  const inicialNome = perfil?.nome ? perfil.nome.charAt(0).toUpperCase() : "?";
  return (
    <div>
      <div>
        <span>
          <FaUser size={24} />
        </span>
        <div>
          <h2>{perfil.nome}</h2>
          <p>{perfil.tipo}</p>
        </div>
        {perfil.tipo === "prestador" && (
          <p>Especialidade: {perfil.tipo_servico}</p>
        )}
      </div>
    </div>
  );
}
