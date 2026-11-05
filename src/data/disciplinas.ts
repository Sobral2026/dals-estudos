import type { Ciclo, Disciplina } from "@/lib/types";

export const CICLOS: { id: Ciclo; nome: string }[] = [
  { id: "basico", nome: "Ciclo básico" },
  { id: "clinico", nome: "Ciclo clínico" },
];

export const DISCIPLINAS: Disciplina[] = [
  { id: "anatomia", nome: "Anatomia", ciclo: "basico" },
  { id: "fisiologia", nome: "Fisiologia", ciclo: "basico" },
  { id: "bioquimica", nome: "Bioquímica", ciclo: "basico" },
  { id: "farmacologia", nome: "Farmacologia", ciclo: "basico" },
  { id: "microbiologia", nome: "Microbiologia", ciclo: "basico" },
  { id: "patologia", nome: "Patologia", ciclo: "basico" },
  { id: "cardiologia", nome: "Cardiologia", ciclo: "clinico" },
  { id: "pneumologia", nome: "Pneumologia", ciclo: "clinico" },
  { id: "endocrinologia", nome: "Endocrinologia", ciclo: "clinico" },
  { id: "infectologia", nome: "Infectologia", ciclo: "clinico" },
  { id: "pediatria", nome: "Pediatria", ciclo: "clinico" },
  { id: "ginecologia-obstetricia", nome: "Ginecologia e Obstetrícia", ciclo: "clinico" },
];

export function nomeDisciplina(id: string) {
  return DISCIPLINAS.find((d) => d.id === id)?.nome ?? id;
}
