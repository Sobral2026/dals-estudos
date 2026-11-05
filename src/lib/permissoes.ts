import type { Papel, StatusEditorial } from "./types";

export const PAPEIS: { id: Papel; rotulo: string; descricao: string }[] = [
  { id: "estudante", rotulo: "Estudante", descricao: "Estuda, baixa materiais autorizados e envia material." },
  { id: "colaborador", rotulo: "Colaborador", descricao: "Estudante com envios creditados (ex.: monitores)." },
  { id: "revisor", rotulo: "Revisor acadêmico", descricao: "Faz a revisão acadêmica e aprova ou devolve." },
  { id: "editor", rotulo: "Editor", descricao: "Triagem, publicação, retirada, trilhas e Jornal." },
  { id: "administrador", rotulo: "Administrador", descricao: "Tudo, inclusive usuários, permissões e auditoria." },
];

const NIVEL: Record<Papel, number> = { estudante: 0, colaborador: 1, revisor: 2, editor: 3, administrador: 4 };

export function rotuloPapel(p: Papel) {
  return PAPEIS.find((x) => x.id === p)?.rotulo ?? p;
}

export function temNivel(papel: Papel | undefined, minimo: Papel) {
  return papel !== undefined && NIVEL[papel] >= NIVEL[minimo];
}

export const podeAcessarPainel = (p?: Papel) => temNivel(p, "revisor");
export const podeEditarJornal = (p?: Papel) => temNivel(p, "editor");
export const podeVerAuditoria = (p?: Papel) => temNivel(p, "administrador");

export const ROTULO_STATUS: Record<StatusEditorial, string> = {
  triagem: "Em triagem editorial",
  revisao_academica: "Em revisão acadêmica",
  aprovado: "Aprovado (aguardando publicação)",
  publicado: "Publicado",
  devolvido: "Devolvido para correção",
  retirado: "Retirado",
};

export type AcaoFluxo = "encaminhar" | "aprovar" | "publicar" | "devolver" | "retirar" | "reenviar";

interface Transicao {
  acao: AcaoFluxo;
  rotulo: string;
  de: StatusEditorial;
  para: StatusEditorial;
  minimo: Papel;
  exigeComentario: boolean;
}

/** Envio → Triagem → Revisão acadêmica → Aprovação → Publicação. Devolução e retirada sempre com justificativa. */
export const TRANSICOES: Transicao[] = [
  { acao: "encaminhar", rotulo: "Encaminhar para revisão acadêmica", de: "triagem", para: "revisao_academica", minimo: "editor", exigeComentario: false },
  { acao: "devolver", rotulo: "Devolver para correção", de: "triagem", para: "devolvido", minimo: "editor", exigeComentario: true },
  { acao: "aprovar", rotulo: "Aprovar", de: "revisao_academica", para: "aprovado", minimo: "revisor", exigeComentario: false },
  { acao: "devolver", rotulo: "Devolver para correção", de: "revisao_academica", para: "devolvido", minimo: "revisor", exigeComentario: true },
  { acao: "publicar", rotulo: "Publicar", de: "aprovado", para: "publicado", minimo: "editor", exigeComentario: false },
  { acao: "retirar", rotulo: "Retirar publicação", de: "publicado", para: "retirado", minimo: "editor", exigeComentario: true },
  // O próprio autor reenvia a versão corrigida; volta para a triagem.
  { acao: "reenviar", rotulo: "Reenviar versão corrigida", de: "devolvido", para: "triagem", minimo: "estudante", exigeComentario: false },
];

/** Ações editoriais disponíveis para um papel num status (o reenvio é só do autor e fica fora daqui). */
export function acoesDisponiveis(status: StatusEditorial, papel?: Papel) {
  return TRANSICOES.filter((t) => t.de === status && t.acao !== "reenviar" && temNivel(papel, t.minimo));
}

export function transicao(status: StatusEditorial, acao: AcaoFluxo) {
  return TRANSICOES.find((t) => t.de === status && t.acao === acao);
}
