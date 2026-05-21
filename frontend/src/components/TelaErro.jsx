export default function TelaErro({ mensagem, onTentar }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-6 max-w-sm">
        <p className="text-red-500 text-sm mb-4">{mensagem}</p>
        {onTentar && (
          <button
            onClick={onTentar}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
}
