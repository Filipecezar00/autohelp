import { useState } from "react";
import { IoMdClose } from "react-icons/io";

export default function CardSolicitacao(prestador) {
  const [control, setControl] = useState(false);

  const handleControl = () => {
    setControl(true);
  };

  return (
    <div
      style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          margin: "10px 0",
        }}
      >
        {status === "pendente" && <IoMdClose onClick={handleControl} />}
        <p>{prestador.nome}</p>
        <p>{prestador.tipo_servico}</p>
        <p>{prestador.status}</p>
        <p>{prestador.data}</p>
        <p>{prestador.descricao}</p>
      </div>
    </div>
  );
}
