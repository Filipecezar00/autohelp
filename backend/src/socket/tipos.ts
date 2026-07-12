export type StatusSolicitacao = {
  pendente: "pendente";
  aceita: "aceita";
  recusada: "recusada";
  concluida: "concluida";
  cancelada: "cancelada";
};

export interface Mensagem {
  id: number;
  solicitacaoId: number;
  remetenteId: number;
  remetenteNome: string;
  texto: string;
  criadoEm: string;
}

export interface EventosServidor {
  nova_mensagem: (mensagem: Mensagem) => void;
  status_atualizado: (dados: {
    solicitacaoId: number;
    status: StatusSolicitacao;
  }) => void;
  erro: (mensagem: string) => void;
}

export interface EventosCliente {
  entrar_sala: (solicitacaoId: number) => void;
  enviar_mensagem: (dados: { texto: string; solicitacaoId: number }) => void;
  sair_sala: (solicitacaoId: number) => void;
}
