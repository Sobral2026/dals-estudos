import type { AreaEnamed, Assunto, CompetenciaEnamed, HabilidadeEnamed } from "@/lib/types";

/**
 * Enquanto for false, a UI avisa que a classificação é de EXEMPLO.
 * Vira true só quando a grade oficial da FMC e a matriz oficial do ENAMED (INEP)
 * forem cadastradas e validadas pelo DALS.
 */
export const TAXONOMIA_VALIDADA = false;

// ---------- Modelo A — FMC: assuntos e subassuntos (exemplo) ----------

export const ASSUNTOS: Assunto[] = [
  { id: "anat-ms", disciplina: "anatomia", nome: "Membro superior" },
  { id: "anat-ms-plexo", disciplina: "anatomia", nome: "Nervos do plexo braquial", pai: "anat-ms" },
  { id: "anat-neuro", disciplina: "anatomia", nome: "Neuroanatomia" },
  { id: "anat-neuro-meninges", disciplina: "anatomia", nome: "Meninges e vascularização", pai: "anat-neuro" },
  { id: "fisio-cardio", disciplina: "fisiologia", nome: "Fisiologia cardiovascular" },
  { id: "fisio-cardio-pa", disciplina: "fisiologia", nome: "Potencial de ação cardíaco", pai: "fisio-cardio" },
  { id: "fisio-resp", disciplina: "fisiologia", nome: "Fisiologia respiratória" },
  { id: "fisio-resp-acido", disciplina: "fisiologia", nome: "Equilíbrio ácido-básico", pai: "fisio-resp" },
  { id: "bioq-carbo", disciplina: "bioquimica", nome: "Metabolismo de carboidratos" },
  { id: "bioq-carbo-pentoses", disciplina: "bioquimica", nome: "Via das pentoses", pai: "bioq-carbo" },
  { id: "farm-tox", disciplina: "farmacologia", nome: "Toxicologia" },
  { id: "farm-cardio", disciplina: "farmacologia", nome: "Fármacos cardiovasculares" },
  { id: "micro-bact", disciplina: "microbiologia", nome: "Bacteriologia" },
  { id: "micro-bact-entericas", disciplina: "microbiologia", nome: "Bactérias entéricas", pai: "micro-bact" },
  { id: "pato-geral", disciplina: "patologia", nome: "Patologia geral" },
  { id: "pato-geral-necrose", disciplina: "patologia", nome: "Lesão e morte celular", pai: "pato-geral" },
  { id: "cardio-sca", disciplina: "cardiologia", nome: "Síndromes coronarianas" },
  { id: "cardio-ic", disciplina: "cardiologia", nome: "Insuficiência cardíaca" },
  { id: "pneumo-trauma", disciplina: "pneumologia", nome: "Trauma torácico" },
  { id: "endo-dm", disciplina: "endocrinologia", nome: "Diabetes mellitus" },
  { id: "endo-tireoide", disciplina: "endocrinologia", nome: "Tireoide" },
  { id: "infecto-ist", disciplina: "infectologia", nome: "Infecções sexualmente transmissíveis" },
  { id: "infecto-snc", disciplina: "infectologia", nome: "Infecções do sistema nervoso" },
  { id: "ped-imuno", disciplina: "pediatria", nome: "Imunizações" },
  { id: "go-has", disciplina: "ginecologia-obstetricia", nome: "Síndromes hipertensivas da gestação" },
];

export function nomeAssunto(id?: string) {
  return ASSUNTOS.find((a) => a.id === id)?.nome ?? "";
}

// ---------- Modelo B — ENAMED (EXEMPLO: sem códigos oficiais) ----------

export const AREAS_ENAMED: AreaEnamed[] = [
  { id: "area-basicas", nome: "Ciências básicas aplicadas (exemplo)" },
  { id: "area-clinica", nome: "Clínica médica (exemplo)" },
  { id: "area-cirurgia", nome: "Cirurgia e urgência (exemplo)" },
  { id: "area-materno", nome: "Saúde materno-infantil (exemplo)" },
  { id: "area-coletiva", nome: "Saúde coletiva (exemplo)" },
];

export const COMPETENCIAS_ENAMED: CompetenciaEnamed[] = [
  { id: "comp-fundamentos", area: "area-basicas", descricao: "Aplicar fundamentos biológicos ao raciocínio clínico (exemplo)" },
  { id: "comp-diagnostico", area: "area-clinica", descricao: "Formular hipóteses diagnósticas (exemplo)" },
  { id: "comp-terapeutica", area: "area-clinica", descricao: "Propor conduta terapêutica (exemplo)" },
  { id: "comp-urgencia", area: "area-cirurgia", descricao: "Conduzir atendimento de urgência (exemplo)" },
  { id: "comp-materno", area: "area-materno", descricao: "Cuidar da gestante e da criança (exemplo)" },
  { id: "comp-prevencao", area: "area-coletiva", descricao: "Promover saúde e prevenir agravos (exemplo)" },
];

export const HABILIDADES_ENAMED: HabilidadeEnamed[] = [
  { id: "hab-correlacao-anatomica", competencia: "comp-fundamentos", descricao: "Correlacionar anatomia e quadro clínico (exemplo)" },
  { id: "hab-mecanismo", competencia: "comp-fundamentos", descricao: "Explicar mecanismos fisiopatológicos (exemplo)" },
  { id: "hab-exames", competencia: "comp-diagnostico", descricao: "Interpretar exames complementares (exemplo)" },
  { id: "hab-agente", competencia: "comp-diagnostico", descricao: "Identificar agente etiológico provável (exemplo)" },
  { id: "hab-farmaco", competencia: "comp-terapeutica", descricao: "Selecionar tratamento farmacológico (exemplo)" },
  { id: "hab-emergencia", competencia: "comp-urgencia", descricao: "Priorizar intervenções imediatas (exemplo)" },
  { id: "hab-obstetrica", competencia: "comp-materno", descricao: "Manejar intercorrências obstétricas (exemplo)" },
  { id: "hab-vacinas", competencia: "comp-prevencao", descricao: "Aplicar o calendário vacinal (exemplo)" },
];

export function nomeArea(id?: string) {
  return AREAS_ENAMED.find((a) => a.id === id)?.nome ?? "";
}

export function nomeCompetencia(id?: string) {
  return COMPETENCIAS_ENAMED.find((c) => c.id === id)?.descricao ?? "";
}

export function nomeHabilidade(id?: string) {
  return HABILIDADES_ENAMED.find((h) => h.id === id)?.descricao ?? "";
}

export const ROTULO_DIFICULDADE = { facil: "Fácil", media: "Média", dificil: "Difícil" } as const;
