import type { Ciclo, Disciplina } from "@/lib/types";

export const CICLOS: { id: Ciclo; nome: string }[] = [
  { id: "basico", nome: "Ciclo básico" },
  { id: "clinico", nome: "Ciclo clínico" },
];

/**
 * EXEMPLO. Disciplinas e períodos NÃO são a grade oficial da FMC.
 * Serão substituídos pelo cadastro validado pelo DALS (painel → taxonomias).
 */
export const DISCIPLINAS: Disciplina[] = [
  { id: "anatomia", nome: "Anatomia", ciclo: "basico", periodo: 1 },
  { id: "bioquimica", nome: "Bioquímica", ciclo: "basico", periodo: 1 },
  { id: "fisiologia", nome: "Fisiologia", ciclo: "basico", periodo: 2 },
  { id: "microbiologia", nome: "Microbiologia", ciclo: "basico", periodo: 3 },
  { id: "farmacologia", nome: "Farmacologia", ciclo: "basico", periodo: 4 },
  { id: "patologia", nome: "Patologia", ciclo: "basico", periodo: 4 },
  { id: "cardiologia", nome: "Cardiologia", ciclo: "clinico", periodo: 6 },
  { id: "pneumologia", nome: "Pneumologia", ciclo: "clinico", periodo: 6 },
  { id: "endocrinologia", nome: "Endocrinologia", ciclo: "clinico", periodo: 7 },
  { id: "infectologia", nome: "Infectologia", ciclo: "clinico", periodo: 7 },
  { id: "pediatria", nome: "Pediatria", ciclo: "clinico", periodo: 9 },
  { id: "ginecologia-obstetricia", nome: "Ginecologia e Obstetrícia", ciclo: "clinico", periodo: 9 },
];

export const PERIODOS = [...new Set(DISCIPLINAS.map((d) => d.periodo))].sort((a, b) => a - b);

export function nomeDisciplina(id: string) {
  return DISCIPLINAS.find((d) => d.id === id)?.nome ?? id;
}

export function periodoDaDisciplina(id: string) {
  return DISCIPLINAS.find((d) => d.id === id)?.periodo;
}
