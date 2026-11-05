export interface LinhaDiff {
  tipo: "igual" | "removida" | "adicionada";
  texto: string;
}

/**
 * Comparação linha a linha (maior subsequência comum), para o revisor ver o que a contribuição mudou.
 * Os resumos são curtos, então o custo O(n·m) é aceitável.
 */
export function diffLinhas(antes: string, depois: string): LinhaDiff[] {
  const a = antes.split("\n");
  const b = depois.split("\n");
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const resultado: LinhaDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      resultado.push({ tipo: "igual", texto: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      resultado.push({ tipo: "removida", texto: a[i++] });
    } else {
      resultado.push({ tipo: "adicionada", texto: b[j++] });
    }
  }
  while (i < a.length) resultado.push({ tipo: "removida", texto: a[i++] });
  while (j < b.length) resultado.push({ tipo: "adicionada", texto: b[j++] });
  return resultado;
}

export function contarMudancas(diff: LinhaDiff[]) {
  return {
    adicionadas: diff.filter((l) => l.tipo === "adicionada").length,
    removidas: diff.filter((l) => l.tipo === "removida").length,
  };
}
