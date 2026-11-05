import type { Trilha } from "@/lib/types";

export const TRILHAS: Trilha[] = [
  {
    id: "ciclo-basico",
    nome: "Revisão do Ciclo Básico",
    descricao: "Fundamentos que caem em toda prova: da anatomia à patologia, em blocos curtos.",
    blocos: [
      { id: "b1", titulo: "Anatomia e Fisiologia", disciplinas: ["anatomia", "fisiologia"] },
      { id: "b2", titulo: "Bioquímica e Farmacologia", disciplinas: ["bioquimica", "farmacologia"] },
      { id: "b3", titulo: "Microbiologia e Patologia", disciplinas: ["microbiologia", "patologia"] },
    ],
  },
  {
    id: "ciclo-clinico",
    nome: "Revisão do Ciclo Clínico",
    descricao: "Condutas e diagnósticos das grandes áreas clínicas, pensando em internato e residência.",
    blocos: [
      { id: "b1", titulo: "Cardiologia e Pneumologia", disciplinas: ["cardiologia", "pneumologia"] },
      { id: "b2", titulo: "Endocrinologia e Infectologia", disciplinas: ["endocrinologia", "infectologia"] },
      { id: "b3", titulo: "Materno-infantil", disciplinas: ["pediatria", "ginecologia-obstetricia"] },
    ],
  },
];

export function trilhaPorId(id: string) {
  return TRILHAS.find((t) => t.id === id);
}
