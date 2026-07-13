interface Mensagem {
  id: number;
  solicitacaoId: number;
  remetenteId: number;
  remetenteNome: string;
  texto: string;
  criadoEm: string;
}

type StatusSolicitacao =
  | "pendente"
  | "aceita"
  | "recusada"
  | "concluida"
  | "cancelada";

interface EventosServidor {
  nova_mensagem: (mensagem: Mensagem) => void;
  status_atualizado: (dados: {
    solicitacaoId: number;
    status: StatusSolicitacao;
  }) => void;
  erro: (mensagem: string) => void;
}

interface EventosCliente {
  entrar_sala: (solicitacaoId: number) => void;
  enviar_mensagem: (dados: { texto: string; solicitacaoId: number }) => void;
  sair_sala: (solicitacaoId: number) => void;
}
