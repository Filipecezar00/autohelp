export type StatusSolicitacao =
  | "pendente"
  | "aceita"
  | "recusada"
  | "concluida"
  | "cancelada";

export interface Mensagem {
  id: number;
  conversaId: number;
  conversa_id: number;
  remetenteId: number;
  remetente_id: number;
  remetenteNome: string;
  texto: string;
  criadoEm: string;
}

export interface EventosServidor {
  nova_mensagem: (mensagem: Mensagem) => void;
  notificacao_mensagem: (dados: {
    conversaId: number;
    remetenteNome: string;
    texto: string;
  }) => void;
  status_atualizado: (dados: {
    conversaId: number;
    status: StatusSolicitacao;
  }) => void;
  erro: (mensagem: string) => void;
}

export interface EventosCliente {
  entrar_sala: (conversaId: number) => void;
  enviar_mensagem: (dados: { texto: string; conversaId: number }) => void;
  sair_sala: (conversaId: number) => void;
}
