export default function TelaCarregando({ mensagem }) {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-500 text-sm">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>{mensagem}</p>
      </div>
    </div>
  );
}
