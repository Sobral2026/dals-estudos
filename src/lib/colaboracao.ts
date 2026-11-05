import { versaoAtual } from "./biblioteca";
import type { Contribuicao, EventoFluxo, Material, StatusEditorial } from "./types";

export const STATUS_PENDENTES: StatusEditorial[] = ["triagem", "revisao_academica", "aprovado"];

/** Pode receber sugestão de melhoria: material publicado. */
export function aceitaContribuicao(m: Material) {
  return m.status === "publicado";
}

export function contribuicoesPendentes(m: Material) {
  return (m.contribuicoes ?? []).filter((c) => STATUS_PENDENTES.includes(c.status));
}

/** Validação da proposta antes de entrar na triagem. */
export function validarProposta(m: Material, conteudo: string, notas: string, autor?: string): string | null {
  if (!autor) return "Entre para sugerir melhorias.";
  if (!aceitaContribuicao(m)) return "Só materiais publicados recebem sugestões.";
  if (!notas.trim()) return "Explique o que você melhorou.";
  if (conteudo.trim() === versaoAtual(m).conteudo.trim()) return "O texto não mudou em relação à versão atual.";
  if ((m.contribuicoes ?? []).some((c) => c.autor === autor && STATUS_PENDENTES.includes(c.status)))
    return "Você já tem uma sugestão em análise para este material.";
  return null;
}

/**
 * Move a contribuição no fluxo. Ao ser publicada, vira a nova versão do material
 * e o autor da contribuição passa a constar como colaborador (coautor).
 */
export function aplicarMovimentoContribuicao(m: Material, contribId: string, para: StatusEditorial, evento: EventoFluxo): Material {
  const contribuicoes = (m.contribuicoes ?? []).map((c): Contribuicao => (c.id === contribId ? { ...c, status: para, eventos: [...c.eventos, evento] } : c));
  if (para !== "publicado") return { ...m, contribuicoes };

  const c = contribuicoes.find((x) => x.id === contribId)!;
  const atual = versaoAtual(m);
  const colaboradores = m.colaboradores ?? [];
  return {
    ...m,
    contribuicoes,
    versoes: [
      ...m.versoes,
      {
        numero: atual.numero + 1,
        conteudo: c.conteudo,
        referencias: c.referencias,
        notas: `Contribuição de ${c.autor}: ${c.notas}`,
        autor: c.autor,
        em: evento.em,
      },
    ],
    colaboradores: c.autor === m.autor || colaboradores.includes(c.autor) ? colaboradores : [...colaboradores, c.autor],
    atualizadoEm: evento.em,
  };
}
