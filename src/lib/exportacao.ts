import { questaoPorId } from "@/data/questoes";
import type { Questao } from "./types";

export type FormatoPdf = "questoes" | "gabarito" | "comentado";

export const FORMATOS_PDF: { id: FormatoPdf; rotulo: string; descricao: string }[] = [
  { id: "questoes", rotulo: "Só questões", descricao: "Lista para resolver no papel, sem respostas." },
  { id: "gabarito", rotulo: "Com gabarito separado", descricao: "Questões e, na última página, só as letras corretas." },
  { id: "comentado", rotulo: "Com gabarito comentado", descricao: "Questões, gabarito e a justificativa de cada alternativa." },
];

/** Só entram no PDF questões autorizadas para reprodução; as demais são listadas como omitidas. */
export function separarParaPdf(ids: string[]) {
  const incluidas: Questao[] = [];
  const omitidas: string[] = [];
  for (const id of ids) {
    const q = questaoPorId(id);
    if (!q) continue;
    if (q.permiteDownload) incluidas.push(q);
    else omitidas.push(id);
  }
  return { incluidas, omitidas };
}
