# DALS Questões — protótipo

Banco de questões de exemplo do **Diretório Acadêmico Luiz Sobral — Medicina FMC**.
Este é um **protótipo**, não o site definitivo. O modelo funcional foi inspirado na análise do
Lecturio (`../engenharia-reversa-lecturio.md`), mas a identidade visual e as questões são próprias do DALS.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Telas

| Rota | O que faz |
|---|---|
| `/` | Início: concluído, sua nota, média da turma, revisão do dia, trilhas e pontos fracos |
| `/questoes` | Monta simulado (disciplinas, status, modo tutor/prova, quantidade) e lista seus simulados |
| `/simulado/[id]` | Resolução: lista numerada, alternativas, confiança 😟/😐/😄, gabarito comentado, reportar erro |
| `/simulado/[id]/resultado` | Nota, comparação com a turma, revisão questão por questão, refazer erradas |
| `/revisao` | Revisão espaçada: para hoje / atrasadas / muito atrasadas e nível de domínio |
| `/desempenho` | Acerto por disciplina × turma, revisão adaptativa, refazer erradas |
| `/trilhas` | Trilhas em blocos com progresso |

Atalhos na resolução: **A–E** escolhe, **1/2/3** confirma, **← →** navega.

## Armazenamento (protótipo)

Não há banco de dados nem login.

- **Conteúdo** (questões, disciplinas e trilhas) fica em arquivos TypeScript:
  - `src/data/questoes.ts`: as 18 questões de exemplo
  - `src/data/disciplinas.ts`: árvore de disciplinas por ciclo
  - `src/data/trilhas.ts`: trilhas e blocos
- **Progresso do aluno** (respostas, revisão espaçada, simulados e reportes de erro) fica no
  **localStorage do navegador**, na chave `dals-questoes:v1`. Toda a leitura e escrita passa por
  `src/lib/store.ts`.
  - Cada navegador tem o próprio progresso, que não é compartilhado entre dispositivos.
  - Limpar os dados do navegador apaga o progresso. Também há o botão "Apagar meu progresso" em `/revisao`.
  - Os reportes de erro ficam salvos só localmente. No site definitivo, eles vão para o painel da diretoria.
- **Média da turma** usa o campo `acertoTurma` de cada questão, que hoje é um valor de exemplo.

### Para o site definitivo

Trocar `src/lib/store.ts` por chamadas a um banco (ex.: Supabase) mantendo as mesmas funções
(`registrarResposta`, `criarSimulado`, `responderNoSimulado`, `finalizarSimulado`, `reportarErro`…).
Mover as questões para tabelas, com um painel `/admin` para cadastro, e calcular a média da turma
a partir das respostas reais.

## Adicionar uma questão

Copie um bloco em `src/data/questoes.ts`, troque o `id` (ex.: `q19`) e preencha `disciplina`
(um id de `disciplinas.ts`), `enunciado`, as 5 `alternativas` com `comentario`, `correta`,
`explicacao` e, se houver, `referencia`.
