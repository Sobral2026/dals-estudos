export type Letra = "A" | "B" | "C" | "D" | "E";
export type Confianca = 1 | 2 | 3;
export type ModoSimulado = "tutor" | "prova";
export type Ciclo = "basico" | "clinico";

export interface Disciplina {
  id: string;
  nome: string;
  ciclo: Ciclo;
  /** Período da FMC. Valor de exemplo até a grade oficial ser cadastrada. */
  periodo: number;
}

/** Modelo A (FMC): assunto e subassunto pertencem a uma disciplina. */
export interface Assunto {
  id: string;
  disciplina: string;
  nome: string;
  /** Preenchido quando é subassunto. */
  pai?: string;
}

/** Modelo B (ENAMED). `codigoOficial` fica vazio até ser preenchido a partir do documento oficial do INEP. */
export interface AreaEnamed {
  id: string;
  nome: string;
  codigoOficial?: string;
}

export interface CompetenciaEnamed {
  id: string;
  area: string;
  descricao: string;
  codigoOficial?: string;
}

export interface HabilidadeEnamed {
  id: string;
  competencia: string;
  descricao: string;
  codigoOficial?: string;
}

export interface ClassificacaoEnamed {
  area: string;
  competencia: string;
  habilidade?: string;
  temaClinico?: string;
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
  /** Modelo A (FMC): a disciplina fica em `disciplina`; assunto e subassunto, aqui. */
  assunto: string;
  subassunto?: string;
  /** Modelo B (ENAMED). A mesma questão pertence às duas classificações, sem duplicação. */
  enamed: ClassificacaoEnamed;
  autoria: string;
  versao: number;
  atualizadaEm: string;
  licenca: string;
  /** Só questões autorizadas para reprodução entram no PDF. */
  permiteDownload: boolean;
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
  status?: "aberto" | "procedente" | "improcedente";
}

// ---------- Acesso (protótipo: sessão de demonstração, sem senha) ----------

export type Papel = "estudante" | "colaborador" | "revisor" | "editor" | "administrador";

export interface Sessao {
  nome: string;
  papel: Papel;
  periodo: number;
}

// ---------- Fluxo editorial (Biblioteca) ----------

/** Envio → Triagem editorial → Revisão acadêmica → Aprovação → Publicação (+ devolução e retirada). */
export type StatusEditorial = "triagem" | "revisao_academica" | "aprovado" | "publicado" | "devolvido" | "retirado";

export type TipoMaterial = "resumo" | "mapa_mental" | "questao_autoral" | "roteiro_revisao";

export interface EventoFluxo {
  de?: StatusEditorial;
  para: StatusEditorial;
  ator: string;
  papel: Papel;
  comentario?: string;
  em: string;
}

export interface VersaoMaterial {
  numero: number;
  conteudo: string;
  arquivoNome?: string;
  referencias: string;
  notas: string;
  em: string;
  /** Quem escreveu esta versão (ausente nas versões antigas = autor original). */
  autor?: string;
}

/** Proposta de melhoria de um material publicado, feita por outro estudante. Passa pelo fluxo editorial. */
export interface Contribuicao {
  id: string;
  autor: string;
  papel: Papel;
  conteudo: string;
  referencias: string;
  notas: string;
  /** Versão do material sobre a qual a proposta foi escrita. */
  baseVersao: number;
  status: StatusEditorial;
  eventos: EventoFluxo[];
  declaracao: DeclaracaoAutoria;
  em: string;
}

export interface DeclaracaoAutoria {
  autoria: boolean;
  autorizaPublicacao: boolean;
  semConteudoProibido: boolean;
  em: string;
}

export interface Material {
  id: string;
  tipo: TipoMaterial;
  titulo: string;
  descricao: string;
  palavrasChave: string[];
  periodo?: number;
  disciplina?: string;
  assunto?: string;
  autor: string;
  status: StatusEditorial;
  permiteDownload: boolean;
  versoes: VersaoMaterial[];
  eventos: EventoFluxo[];
  declaracao: DeclaracaoAutoria;
  atualizadoEm: string;
  /** Coautores que tiveram contribuições publicadas. */
  colaboradores?: string[];
  contribuicoes?: Contribuicao[];
}

// ---------- Vídeos (YouTube incorporado; o DALS não hospeda o arquivo) ----------

export interface DeclaracaoVideo {
  /** Vídeo público no YouTube, com incorporação permitida pelo autor. */
  publicoEIncorporavel: boolean;
  /** Não é gravação de aula/professor sem autorização nem expõe pacientes. */
  semConteudoProibido: boolean;
  em: string;
}

export interface Video {
  id: string;
  youtubeId: string;
  titulo: string;
  canal: string;
  descricao: string;
  palavrasChave: string[];
  periodo?: number;
  disciplina?: string;
  assunto?: string;
  sugeridoPor: string;
  status: StatusEditorial;
  eventos: EventoFluxo[];
  declaracao: DeclaracaoVideo;
  atualizadoEm: string;
}

// ---------- Jornal DALS ----------

export type CategoriaPost = "noticia" | "entrevista" | "reportagem" | "projeto" | "evento" | "pesquisa" | "institucional";

export interface Post {
  id: string;
  slug: string;
  categoria: CategoriaPost;
  titulo: string;
  resumo: string;
  /** Texto simples; parágrafos separados por linha em branco (sem HTML). */
  corpo: string;
  autor: string;
  status: "rascunho" | "publicado" | "arquivado";
  publicadoEm?: string;
  atualizadoEm: string;
}

// ---------- Auditoria ----------

export interface EventoAuditoria {
  acao: string;
  alvo: string;
  detalhe?: string;
  ator: string;
  papel: Papel | "anonimo";
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
