import type { DeclaracaoAutoria, Material, Post } from "@/lib/types";

/**
 * Conteúdo de EXEMPLO para demonstrar a Biblioteca e o Jornal no protótipo.
 * Não descreve fatos, eventos ou pessoas reais da FMC.
 */

const DECLARACAO: DeclaracaoAutoria = {
  autoria: true,
  autorizaPublicacao: true,
  semConteudoProibido: true,
  em: "2026-10-20T12:00:00.000Z",
};

const EQUIPE = "Equipe DALS (exemplo)";

function publicado(
  base: Omit<Material, "status" | "eventos" | "declaracao" | "versoes" | "atualizadoEm">,
  conteudo: string,
  referencias: string,
): Material {
  const em = "2026-10-22T12:00:00.000Z";
  return {
    ...base,
    status: "publicado",
    declaracao: DECLARACAO,
    atualizadoEm: em,
    versoes: [{ numero: 1, conteudo, referencias, notas: "Versão inicial", em: "2026-10-20T12:00:00.000Z" }],
    eventos: [
      { para: "triagem", ator: base.autor, papel: "colaborador", em: "2026-10-20T12:00:00.000Z" },
      { de: "triagem", para: "revisao_academica", ator: "Editor (exemplo)", papel: "editor", em: "2026-10-21T09:00:00.000Z" },
      { de: "revisao_academica", para: "aprovado", ator: "Revisor (exemplo)", papel: "revisor", em: "2026-10-21T15:00:00.000Z" },
      { de: "aprovado", para: "publicado", ator: "Editor (exemplo)", papel: "editor", em },
    ],
  };
}

export const MATERIAIS_INICIAIS: Material[] = [
  publicado(
    {
      id: "m-exemplo-1",
      tipo: "resumo",
      titulo: "Necrose: tipos e onde aparecem",
      descricao: "Resumo de uma página com os padrões de necrose e os exemplos clássicos de cada um.",
      palavrasChave: ["necrose", "coagulação", "liquefativa", "caseosa"],
      periodo: 4,
      disciplina: "patologia",
      assunto: "pato-geral",
      autor: EQUIPE,
      permiteDownload: true,
    },
    `Coagulação — a arquitetura do tecido é preservada por alguns dias. Padrão da isquemia em órgãos sólidos (coração, rim, baço).

Liquefativa — o tecido vira uma massa líquida por ação enzimática. Típica do infarto cerebral e dos abscessos.

Caseosa — aspecto esbranquiçado e friável, com granuloma ao redor. Associada à tuberculose.

Gordurosa — ação de lipases sobre o tecido adiposo, com saponificação. Pancreatite aguda.

Fibrinoide — depósito de material semelhante à fibrina na parede dos vasos. Vasculites e hipertensão maligna.

Dica de prova: pergunte-se "qual órgão?" e "qual mecanismo?". O órgão costuma entregar o tipo de necrose.`,
    "Material autoral da equipe DALS, elaborado a partir de livros-texto de patologia geral.",
  ),
  publicado(
    {
      id: "m-exemplo-2",
      tipo: "roteiro_revisao",
      titulo: "Roteiro de revisão: intoxicações e antídotos",
      descricao: "Checklist rápido de antídotos para revisar antes do plantão ou da prova.",
      palavrasChave: ["toxicologia", "antídoto", "urgência"],
      periodo: 4,
      disciplina: "farmacologia",
      assunto: "farm-tox",
      autor: EQUIPE,
      permiteDownload: true,
    },
    `Paracetamol → N-acetilcisteína (melhor nas primeiras 8 horas).

Opioides → naloxona.

Benzodiazepínicos → flumazenil (cuidado com dependentes crônicos e risco de convulsão).

Organofosforados → atropina (± pralidoxima).

Metanol e etilenoglicol → fomepizol ou etanol.

Sulfato de magnésio → gluconato de cálcio.

Como usar: cubra a coluna da direita e tente lembrar o antídoto. Depois resolva as questões de toxicologia no banco.`,
    "Material autoral da equipe DALS. Conferir sempre as doses no protocolo vigente do serviço.",
  ),
  publicado(
    {
      id: "m-exemplo-3",
      tipo: "mapa_mental",
      titulo: "Mapa mental: critérios diagnósticos de diabetes",
      descricao: "Os quatro critérios diagnósticos e as faixas de pré-diabetes, organizados em mapa.",
      palavrasChave: ["diabetes", "hba1c", "glicemia", "endocrinologia"],
      periodo: 7,
      disciplina: "endocrinologia",
      assunto: "endo-dm",
      autor: EQUIPE,
      permiteDownload: false,
    },
    `Diabetes mellitus — diagnóstico
• Glicemia de jejum ≥ 126 mg/dL
• HbA1c ≥ 6,5%
• Glicemia de 2 h no TOTG (75 g) ≥ 200 mg/dL
• Glicemia casual ≥ 200 mg/dL + sintomas clássicos

Pré-diabetes
• Jejum 100–125 · HbA1c 5,7–6,4% · TOTG 140–199

Assintomático: confirmar com um segundo exame alterado.`,
    "Baseado nas diretrizes da Sociedade Brasileira de Diabetes. Material autoral; disponível só para leitura online.",
  ),
  {
    id: "m-exemplo-4",
    tipo: "resumo",
    titulo: "Pneumotórax hipertensivo em 5 linhas",
    descricao: "Envio de estudante aguardando triagem (exemplo para demonstrar o fluxo editorial).",
    palavrasChave: ["trauma", "pneumotórax", "urgência"],
    periodo: 6,
    disciplina: "pneumologia",
    assunto: "pneumo-trauma",
    autor: "Estudante (exemplo)",
    status: "triagem",
    permiteDownload: true,
    declaracao: DECLARACAO,
    atualizadoEm: "2026-10-28T18:00:00.000Z",
    versoes: [
      {
        numero: 1,
        conteudo: `Diagnóstico é clínico: dispneia, hipotensão, turgência jugular, desvio de traqueia e murmúrio abolido do lado afetado.

Não espere a radiografia.

Conduta: descompressão imediata e, em seguida, drenagem torácica.`,
        referencias: "Anotações de aula próprias.",
        notas: "Primeiro envio",
        em: "2026-10-28T18:00:00.000Z",
      },
    ],
    eventos: [{ para: "triagem", ator: "Estudante (exemplo)", papel: "estudante", em: "2026-10-28T18:00:00.000Z" }],
  },
];

export const POSTS_INICIAIS: Post[] = [
  {
    id: "p-exemplo-1",
    slug: "conheca-o-dals-estudos",
    categoria: "institucional",
    titulo: "[Exemplo] Conheça o DALS Estudos, a plataforma de estudo do Diretório",
    resumo: "Banco de questões, biblioteca colaborativa e revisão espaçada, de graça e feitos por estudantes para estudantes.",
    corpo: `Esta é uma matéria de exemplo do protótipo do Jornal DALS.

O DALS Estudos reúne, num só lugar, questões comentadas, simulados nos modos tutor e prova, revisão espaçada e uma biblioteca de materiais autorais revisados pela diretoria acadêmica.

A ideia não é só preparar para provas: é fortalecer uma cultura de cooperação e responsabilidade científica entre os estudantes.

O acesso à área de estudos é exclusivo para estudantes da FMC. O Jornal é aberto a todos.`,
    autor: "Redação DALS (exemplo)",
    status: "publicado",
    publicadoEm: "2026-10-25T12:00:00.000Z",
    atualizadoEm: "2026-10-25T12:00:00.000Z",
  },
  {
    id: "p-exemplo-2",
    slug: "como-enviar-material-para-a-biblioteca",
    categoria: "noticia",
    titulo: "[Exemplo] Como enviar seu resumo para a Biblioteca",
    resumo: "Todo material passa por triagem editorial e revisão acadêmica antes de ser publicado. Entenda as etapas.",
    corpo: `Esta é uma matéria de exemplo do protótipo do Jornal DALS.

Qualquer estudante pode enviar resumos, mapas mentais, roteiros de revisão e questões autorais pela opção "Enviar material".

Nada é publicado automaticamente. O fluxo é: envio, triagem editorial, revisão acadêmica, aprovação e publicação. Se algo precisar de ajuste, o material volta para o autor com comentários.

Não é permitido enviar livros, slides de professores, provas internas ou qualquer dado que identifique pacientes.`,
    autor: "Redação DALS (exemplo)",
    status: "publicado",
    publicadoEm: "2026-10-27T12:00:00.000Z",
    atualizadoEm: "2026-10-27T12:00:00.000Z",
  },
  {
    id: "p-exemplo-3",
    slug: "revisao-espacada-por-que-funciona",
    categoria: "pesquisa",
    titulo: "[Exemplo] Revisão espaçada: por que revisar na hora certa funciona",
    resumo: "Revisar pouco antes de esquecer fortalece a memória de longo prazo. Veja como o DALS Estudos aplica a ideia.",
    corpo: `Esta é uma matéria de exemplo do protótipo do Jornal DALS.

A revisão espaçada distribui as revisões no tempo: quanto mais vezes você acerta uma questão com segurança, mais tempo ela demora para voltar.

No DALS Estudos, ao responder, você informa quanta certeza tinha. Errou? A questão volta no mesmo dia. Acertou com certeza? Ela volta em alguns dias, e o intervalo cresce a cada novo acerto.`,
    autor: "Redação DALS (exemplo)",
    status: "publicado",
    publicadoEm: "2026-10-28T12:00:00.000Z",
    atualizadoEm: "2026-10-28T12:00:00.000Z",
  },
];
