export type Letra = "A" | "B" | "C" | "D" | "E";
export type Confianca = 1 | 2 | 3;
export type ModoSimulado = "tutor" | "prova";
export type Ciclo = "basico" | "clinico";

export interface Disciplina {
  id: string;
  nome: string;
  ciclo: Ciclo;
}

export interface Alternativa {
  letra: Letra;
  texto: string;
  comentario: string;
}

export interface Questao {
  id: string;
  disciplina: string;
  enunciado: string;
  alternativas: Alternativa[];
  correta: Letra;
  explicacao: string;
  referencia?: string;
  fonte: string;
  ano: number;
  dificuldade: "facil" | "media" | "dificil";
  /** % de acerto da turma. Hoje é um valor de exemplo; com banco de dados passa a ser calculado. */
  acertoTurma: number;
}

export interface RegistroResposta {
  questaoId: string;
  letra: Letra;
  acertou: boolean;
  confianca: Confianca;
  em: string;
}

export interface EstadoRevisao {
  acertosSeguidos: number;
  intervaloDias: number;
  proxima: string;
}

export interface RespostaSimulado {
  letra: Letra;
  confianca: Confianca;
}

export interface Simulado {
  id: string;
  titulo: string;
  modo: ModoSimulado;
  questoes: string[];
  respostas: Record<string, RespostaSimulado>;
  atual: number;
  finalizado: boolean;
  inicio: string;
  fim?: string;
}

export interface Reporte {
  questaoId: string;
  motivo: string;
  detalhe: string;
  em: string;
}

export interface BlocoTrilha {
  id: string;
  titulo: string;
  disciplinas: string[];
}

export interface Trilha {
  id: string;
  nome: string;
  descricao: string;
  blocos: BlocoTrilha[];
}
