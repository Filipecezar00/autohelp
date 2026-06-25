export default function TelaCarregando({ mensagem }) {
  return (
    <div
      style={{
        color: "#e8f0ff",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ padding: "30px 46px" }}>
        <div />
        <p style={{ color: "#e8f0ff" }}>{mensagem}</p>
      </div>
    </div>
  );
}
