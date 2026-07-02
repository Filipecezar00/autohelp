import { FaUser } from "react-icons/fa";

export function PerfilHeader({ perfil }) {
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
