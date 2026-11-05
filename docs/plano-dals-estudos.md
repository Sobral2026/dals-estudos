# DALS Questões → DALS Estudos: diagnóstico e plano de evolução

> Data: 29/10/2026 · Escopo: análise do código atual em `dals-questoes/` e plano. **Nenhum arquivo de código foi alterado.**
> Convenções: ✅ existe e funciona · ⚠️ existe com limitação · ❌ não existe · ❓ depende de informação que ainda não temos.

---

## 1. Diagnóstico do código atual

### 1.1 Stack e estrutura

| Item | Estado |
|---|---|
| Framework | Next.js 15.5.4 (App Router), React 19.1, TypeScript estrito, Tailwind v4 |
| Renderização | **Todas as páginas são Client Components** (`"use client"`). Sem Server Components, Server Actions ou Route Handlers |
| Dados de conteúdo | Arquivos TS estáticos: `src/data/questoes.ts` (18 questões), `disciplinas.ts` (12, em 2 ciclos), `trilhas.ts` (2 trilhas) |
| Persistência | `localStorage` (chave `dals-questoes:v1`) via `src/lib/store.ts` + `useSyncExternalStore` |
| Lógica pura | `src/lib/revisao.ts` (agendamento espaçado) e `src/lib/estatisticas.ts` (agregações), sem dependência de React ou de storage |
| UI | `AppShell` (sidebar/drawer), `ui.tsx` (primitivas), `PlayerSimulado.tsx` (351 linhas: player, cartão, modal de reporte) |
| Qualidade | `npm run lint` e `npm run build` passam sem avisos. **Não há testes.** |
| Versionamento | ⚠️ O repositório git tem **só o commit inicial do create-next-app**. Todo o protótipo está fora do controle de versão |

### 1.2 Pontos fortes (preservar)

1. **Fronteira de persistência única.** As telas só falam com `store.ts` (`registrarResposta`, `criarSimulado`, `responderNoSimulado`, `finalizarSimulado`, `reportarErro`…). Isso permite trocar o armazenamento sem reescrever telas.
2. **Regras de negócio puras e testáveis** (`proximoEstadoRevisao`, `situacaoRevisao`, `resumirQuestoes`). Podem rodar igual no cliente e no servidor.
3. **Fluxos completos e validados no navegador:** montar simulado → resolver (tutor/prova) → resultado → revisão → desempenho → trilhas, no desktop e no mobile.
4. **Identidade visual** consolidada em tokens (`--color-dals-*`, `ok/alerta/erro/info`, Oswald + Nunito Sans).

### 1.3 Problemas e dívidas técnicas encontrados

| # | Problema | Onde | Gravidade |
|---|---|---|---|
| D1 | **Gabarito vai inteiro para o navegador.** `correta`, `comentario` e `explicacao` estão no bundle JS. No modo prova, qualquer aluno vê as respostas pelo DevTools. É aceitável num protótipo, mas inviabiliza simulado sério ou ranking. | `data/questoes.ts`, `PlayerSimulado` | Alta (para "prova") |
| D2 | Protótipo inteiro sem commit. | git | Alta (risco de perda) |
| D3 | Questão tem **uma única** classificação (`disciplina`). Não há período FMC, área/competência ENAMED, tags, autoria, status editorial nem versão. | `types.ts` | Alta (bloqueia requisitos) |
| D4 | "Média da turma" (`acertoTurma`) é **valor fixo de exemplo**, não dado real. | `questoes.ts`, `estatisticas.ts` | Média (precisa ficar claro na UI até ser real) |
| D5 | Reportes de erro **não chegam a ninguém**: ficam no localStorage do aluno. | `store.ts` | Média |
| D6 | O progresso não sincroniza entre dispositivos e se perde ao limpar o navegador. | `store.ts` | Média (esperado no protótipo) |
| D7 | Lógica de confirmar resposta duplicada (clique × atalho de teclado). | `PlayerSimulado.tsx` | Baixa |
| D8 | Alternativas são `<button>` soltos, sem `role="radiogroup"`/`aria-checked`. Feedback só por cor em alguns pontos. | `PlayerSimulado.tsx` | Média (acessibilidade) |
| D9 | No mobile, a lista numerada de questões some, e só dá para navegar por anterior/próxima. | `PlayerSimulado.tsx` | Baixa |
| D10 | Sem versionamento de questão: se uma questão for corrigida, o histórico antigo passa a apontar para o texto novo. | modelo | Média (ao ir para o banco) |
| D11 | `icon.png` com cerca de 630 KB (logo original). | `src/app/icon.png` | Baixa |
| D12 | O `localStorage` não tem versionamento de schema nem migração (o `JSON.parse` só faz merge raso). | `store.ts` | Baixa agora, alta quando o schema mudar |
| D13 | `.claude/launch.json` duplicado (pasta pai e projeto). | raiz | Baixa |

---

## 2. Lacunas em relação ao DALS Estudos

| Requisito | Hoje | Lacuna |
|---|---|---|
| Exclusivo para estudantes da FMC | ❌ sem login | Autenticação, verificação de vínculo, perfis |
| Biblioteca colaborativa moderada | ❌ | Upload, armazenamento de arquivos, fila de moderação, política de direitos autorais |
| Questões por período/disciplina FMC | ⚠️ só disciplina/ciclo genéricos | Taxonomia do currículo **real** da FMC ❓ |
| Questões por área/competência ENAMED | ❌ | Taxonomia baseada na **matriz oficial do INEP** ❓ |
| Simulados tutor e prova | ✅ local | Tornar seguros (D1) e sincronizados |
| Exportação PDF | ❌ | Caderno de questões e gabarito |
| Revisão espaçada | ✅ local | Persistir no servidor |
| Desempenho sincronizado | ⚠️ local | Respostas no banco e média da turma real |
| Autenticação e permissões | ❌ | Papéis + RLS |
| Painel editorial | ❌ | CRUD de questões, workflow de revisão, moderação, reportes, jornal, usuários |
| Jornal DALS público | ❌ | Páginas públicas com SEO, editor de posts |

**Não temos e precisamos obter antes de implementar a taxonomia:**
- (a) a grade curricular oficial da FMC por período: disciplinas ou módulos, e se o curso é por módulos/PBL;
- (b) o documento oficial da **matriz de referência do ENAMED** (INEP), com as áreas e competências exatas. **Não vou inventar essas listas.** Elas entram como dados configuráveis no painel e são importadas a partir do documento oficial.

---

## 3. Arquitetura proposta

### 3.1 Visão geral

```
                    ┌──────────────────────── Vercel ─────────────────────────┐
 Público ──────────▶│  /jornal, /jornal/[slug], /  (SSG/ISR, sem login)        │
                    │                                                         │
 Aluno FMC ────────▶│  /inicio /questoes /simulado /revisao /desempenho       │
 (logado)           │  /trilhas /biblioteca      (Server Components + Actions)│
                    │                                                         │
 Editor/Admin ─────▶│  /painel/*  (middleware: papel ≥ editor)                │
                    └───────────────┬──────────────────────────────┬──────────┘
                                    │ supabase-js (cookie de sessão) │
                    ┌───────────────▼──────────────────────────────▼──────────┐
                    │ Supabase: Postgres + RLS · Auth · Storage · Cron         │
                    └──────────────────────────────────────────────────────────┘
```

**Por que Supabase:** Postgres com RLS (permissões no banco, não só na UI), Auth com Google, Storage para a biblioteca e imagens, e plano gratuito para começar. É a mesma recomendação do relatório anterior. *Alternativa equivalente: Firebase. Não recomendo misturar.*
**Status de integração:** nenhuma conta, projeto ou chave do Supabase foi criada. Tudo abaixo é proposta.

### 3.2 Princípios

1. **Preservar telas e rotas atuais.** `/questoes`, `/simulado/[id]`, `/revisao`, `/desempenho` e `/trilhas` continuam existindo, com o mesmo visual.
2. **Camada de repositório.** `store.ts` vira uma interface (`Repositorio`) com duas implementações:
   - `RepositorioLocal`: o comportamento atual, mantido para modo demo/offline e testes;
   - `RepositorioSupabase`: para alunos logados.

   As telas não mudam a forma de chamar.
3. **Gabarito só no servidor.** O cliente recebe o enunciado e as alternativas sem `correta`, `comentario` e `explicacao`.
   - Tutor: Server Action `responder()` grava a resposta e devolve a correção daquela questão.
   - Prova: a correção só é liberada após `finalizar()`.
4. **Regras puras compartilhadas.** `revisao.ts` e `estatisticas.ts` continuam puros e ganham testes. O servidor usa os mesmos módulos.
5. **Permissão no banco.** Toda tabela tem RLS. A UI esconde o que não pode, mas quem garante é o Postgres.
6. **Nada destrutivo.**
   - Questões são arquivadas, não apagadas.
   - Edições geram nova versão.
   - Progresso local pode ser importado para a conta no primeiro login.

### 3.3 Autenticação e acesso exclusivo FMC ❓

Opções, em ordem de preferência. A escolha depende de informação da FMC:

| Opção | Como | Pré-requisito |
|---|---|---|
| A. E-mail institucional | Login Google/Magic link restrito ao domínio institucional dos alunos | ❓ A FMC fornece e-mail institucional a todos os alunos? Qual domínio? |
| B. Login Google + aprovação | Qualquer Google entra como `pendente`; a diretoria aprova conferindo matrícula ou turma | Processo de aprovação na diretoria |
| C. Código de convite por turma | O representante de turma distribui o código; o cadastro fica vinculado ao período | Rotina de rotação de códigos |

Recomendação: **A** se o domínio existir; senão **B + C** (convite acelera, aprovação garante).

### 3.4 Papéis

| Papel | Pode |
|---|---|
| `pendente` | Ver só a tela de "aguardando aprovação" |
| `aluno` | Resolver, simular, revisar, ver desempenho, baixar da biblioteca, enviar material e questões (vão para moderação), reportar erro |
| `colaborador` | Igual ao aluno, com envios priorizados e créditos de autoria (ex.: monitores) |
| `revisor` | Aprovar ou recusar questões e materiais das disciplinas atribuídas a ele |
| `editor` | Tudo de conteúdo: questões, trilhas, biblioteca, taxonomias, reportes |
| `jornalista` | Criar e editar posts do Jornal (publicar exige `editor_jornal` ou `admin`) |
| `admin` | Usuários, papéis, configurações e auditoria |

Implementação: tabela `perfis.papel` + função SQL `tem_papel()` usada nas políticas RLS. Checagem também no `middleware.ts` para as rotas `/painel/*`.

### 3.5 Funcionalidades novas (desenho)

- **Biblioteca colaborativa moderada**
  - Upload para um bucket privado do Storage (PDF/imagem, limite de tamanho e tipo validados no servidor).
  - Entra como `pendente` e só fica visível depois de `aprovado`.
  - Download por URL assinada de curta duração.
  - Campos: título, descrição, período, disciplina, tipo (resumo, mapa mental, lista, prova antiga autorizada…), autor e licença.
  - Termo de responsabilidade no envio, botão "denunciar" e fluxo de remoção.
- **Exportação PDF**
  - Etapa 1: rota `/simulado/[id]/imprimir` com CSS de impressão (caderno de questões; gabarito comentado opcional, só após finalizar). O aluno salva como PDF pelo navegador, sem dependência nova.
  - Etapa 2 (se necessário): geração no servidor (ex.: `@react-pdf/renderer`) com marca d'água do nome do aluno, para desestimular repasse.
- **Desempenho sincronizado**
  - Tabela `respostas` é a fonte da verdade.
  - **Média da turma** = view agregada por questão e por período, recalculada periodicamente (Cron do Supabase).
  - Só é exibida com **N ≥ 10 respostas**, para não expor alunos individualmente.
- **Painel editorial `/painel`**
  - Questões (editor rico, pré-visualização, classificação, workflow `rascunho → em_revisao → publicada → arquivada`)
  - Fila de moderação (questões e materiais enviados por alunos)
  - Reportes de erro
  - Trilhas, taxonomias (períodos, disciplinas, áreas e competências ENAMED), usuários e papéis
  - Jornal
  - Log de auditoria
- **Jornal DALS público**
  - `/jornal` e `/jornal/[slug]` estáticos com revalidação (ISR) e metadados para compartilhamento.
  - Conteúdo em Markdown, **sanitizado** na renderização.
  - Imagens em bucket público.
  - Rascunho → publicado com data agendável.

---

## 4. Modelo de dados (PostgreSQL)

```sql
-- Pessoas e acesso
perfis (id uuid PK = auth.users.id, nome, email, periodo_atual smallint,
        papel text CHECK (papel IN ('pendente','aluno','colaborador','revisor','editor','jornalista','admin')),
        aprovado_por uuid, aprovado_em timestamptz, criado_em)
convites (codigo PK, periodo smallint, expira_em, usos_max, usos)

-- Taxonomias (dados configuráveis no painel, sem listas fixas no código)
periodos (numero smallint PK, nome)                        -- 1º..12º, conforme a FMC ❓
disciplinas_fmc (id PK, nome, periodo smallint FK, ciclo, ativa bool)
enamed_areas (id PK, nome, ordem)                          -- da matriz oficial INEP ❓
enamed_competencias (id PK, area_id FK, codigo, descricao)

-- Questões com versionamento
questoes (id uuid PK, status text CHECK (status IN ('rascunho','em_revisao','publicada','arquivada')),
          autor_id FK perfis, versao_atual_id FK, fonte, ano, dificuldade,
          criado_em, atualizado_em)
questao_versoes (id uuid PK, questao_id FK, numero int, enunciado, imagem_path, imagem_credito,
                 explicacao, referencia, correta char(1), editado_por FK, criado_em)
alternativas (id uuid PK, versao_id FK, letra char(1), texto, comentario)
questao_disciplinas (questao_id, disciplina_id)            -- N:N
questao_competencias (questao_id, competencia_id)          -- N:N (a área vem da competência)
questao_revisoes (id, questao_id, revisor_id, decisao, comentario, criado_em)

-- Estudo do aluno
simulados (id uuid PK, aluno_id FK, titulo, modo, filtros jsonb, inicio, fim, finalizado bool)
simulado_itens (simulado_id, ordem, questao_id, versao_id, letra, confianca, respondido_em)
respostas (id PK, aluno_id FK, questao_id FK, versao_id FK, letra, acertou bool,
           confianca smallint, origem text, simulado_id FK NULL, tempo_ms int, criado_em)
revisao_estado (aluno_id, questao_id, acertos_seguidos, intervalo_dias, proxima, PRIMARY KEY (aluno_id, questao_id))
trilhas (id, nome, descricao, ordem, publicada)
trilha_blocos (id, trilha_id, titulo, ordem)
bloco_filtros (bloco_id, disciplina_id NULL, competencia_id NULL)

-- Qualidade e moderação
reportes (id, questao_id, aluno_id, motivo, detalhe, status ('aberto','procedente','improcedente','corrigido'), tratado_por, criado_em)
materiais (id, enviado_por, titulo, descricao, tipo, periodo, disciplina_id, arquivo_path, tamanho, mime,
           licenca, status ('pendente','aprovado','recusado','removido'), moderado_por, motivo_moderacao, criado_em)
denuncias (id, material_id, aluno_id, motivo, status, criado_em)

-- Jornal
posts (id, slug UNIQUE, titulo, resumo, corpo_md, capa_path, autor_id, status ('rascunho','agendado','publicado','arquivado'),
       publicado_em, atualizado_em)

-- Transversal
auditoria (id, ator_id, acao, entidade, entidade_id, antes jsonb, depois jsonb, criado_em)
media_turma_por_questao (view materializada: questao_id, periodo, n, pct_acerto)  -- exibir só se n ≥ 10
```

**RLS (resumo):**
- `respostas`, `simulados` e `revisao_estado`: o aluno lê e escreve só as próprias linhas.
- `questao_versoes.correta` e `alternativas.comentario`: nunca saem para o cliente antes da correção. Leitura via função `SECURITY DEFINER` chamada pela Server Action.
- `materiais`: `aprovado` é legível por qualquer `aluno`+; o resto só pelo autor e por `revisor`+.
- `posts`: `publicado` é legível pelo público (anon); o resto só por `jornalista`+.
- `auditoria`: só `admin`.

**Migração dos dados atuais:**
- As 18 questões de `questoes.ts` viram seed (versão 1, status `publicada`), mantendo o mesmo `id` lógico (`q01…q18`) num campo `codigo`.
- O histórico local do aluno (`dals-questoes:v1`) pode ser importado para a conta uma única vez, com confirmação.
- **O localStorage nunca é apagado automaticamente.**

---

## 5. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| **Direitos autorais na biblioteca** (PDFs de livros, slides de professores, provas internas) | Alto: jurídico e institucional | Moderação prévia obrigatória, termo no envio, tipos permitidos, canal de denúncia e remoção rápida, proibir livros e material de terceiros sem autorização |
| **Provas internas da FMC** como fonte de questões | Alto | Usar só com autorização documentada do docente ou coordenação; campo `fonte` obrigatório |
| **LGPD** (dados de desempenho de estudantes) | Alto | Coletar o mínimo, política de privacidade, consentimento no cadastro, exportação e exclusão a pedido, média só com N ≥ 10, sem pixels de anúncio, responsável definido pelo DA |
| **RLS mal configurada** ou chave `service_role` exposta | Alto | Chave de serviço só no servidor, testes automatizados de política (aluno A não lê dados do aluno B), revisão de segurança por etapa |
| Gabarito vazado (D1) | Médio | Correção só no servidor (princípio 3) |
| XSS no Jornal ou na biblioteca | Médio | Markdown sanitizado, sem HTML livre, CSP |
| Upload malicioso | Médio | Validar MIME e tamanho no servidor, bucket privado, URL assinada; o Supabase não faz antivírus, avaliar varredura externa se o volume crescer |
| **Exatidão médica** do conteúdo | Alto | Workflow com revisor por disciplina, reportes visíveis no painel, versionamento |
| Taxonomia ENAMED/FMC incorreta | Médio | Importar dos documentos oficiais (❓) e deixar editável no painel |
| **Continuidade da gestão do DA** (troca anual) | Médio | Contas (Vercel, Supabase, domínio) em e-mail institucional do DA, não pessoal; documentação; mais de um admin |
| Limites do plano gratuito (armazenamento, inatividade) | Médio | Monitorar uso; limites de upload; conferir os limites vigentes do plano na contratação (não verificados aqui) |
| Perda do protótipo (D2) | Alto | Commit inicial antes de qualquer etapa |

---

## 6. Plano por etapas

Cada etapa termina com build e lint verdes, testes e as telas existentes funcionando como antes.

| Etapa | Entrega | Critério de aceite | Depende de |
|---|---|---|---|
| **0. Base segura** | Commit do protótipo; Vitest + testes de `revisao.ts` e `estatisticas.ts`; CI (lint/build/test); corrigir D7, D8, D9, D11, D13 | Testes cobrem as regras de revisão; nenhuma mudança visual além das correções de acessibilidade e mobile | — |
| **1. Camada de repositório** | `Repositorio` (interface) + `RepositorioLocal` (comportamento atual); versionamento do schema local (D12) | Todas as telas funcionam igual; progresso existente no navegador continua lá | 0 |
| **2. Taxonomia** | Tipos e dados para período FMC, disciplina FMC, área e competência ENAMED (N:N); filtros em `/questoes` | As 18 questões reclassificadas; filtros combináveis | ❓ grade FMC, ❓ matriz ENAMED |
| **3. Supabase + Auth + papéis** | Projeto Supabase, schema e RLS de `perfis`/`convites`, login, aprovação, `middleware`, `RepositorioSupabase` para progresso, importação do localStorage | Aluno não aprovado não acessa; aluno A não lê dados de B (teste); progresso sincroniza entre dois navegadores | 1, ❓ domínio/forma de acesso, contas do DA |
| **4. Questões no banco + painel editorial** | Tabelas de questões, versões e taxonomias; seed das 18; `/painel/questoes` com workflow; `/painel/reportes` | Editor publica uma questão sem deploy; reporte do aluno aparece no painel; edição gera nova versão | 2, 3 |
| **5. Simulados seguros + desempenho real** | Correção via Server Actions; gabarito fora do bundle; média da turma real (N ≥ 10) | No modo prova, o gabarito não aparece no JS do cliente (verificado); média da turma vem do banco | 4 |
| **6. Exportação PDF** | `/simulado/[id]/imprimir` com CSS de impressão (com/sem gabarito) | PDF legível em A4; gabarito só após finalizar | 5 |
| **7. Biblioteca moderada** | Upload, fila de moderação, download assinado, denúncia | Material só aparece após aprovação; arquivo inválido é recusado no servidor | 3, política de direitos autorais aprovada pelo DA |
| **8. Jornal DALS público** | `/jornal`, editor no painel, agendamento, SEO | Post publicado é visível sem login; rascunho não é | 3 |
| **9. Endurecimento e lançamento** | Política de privacidade e termos, auditoria, backups, testes E2E (Playwright), deploy em domínio do DA, rebrand "DALS Estudos" | Checklist de segurança e LGPD revisado; piloto com uma turma | todas |

A renomeação para **DALS Estudos** entra na etapa 9, para não confundir o piloto. Ela troca textos e metadados e mantém identidade visual e rotas.

---

## 7. Decisões que precisam do DA antes de começar

1. **Acesso:** a FMC tem e-mail institucional para alunos? Se não, aprovação manual, convite por turma ou ambos?
2. **Grade curricular** oficial por período (documento) e quem no DA valida.
3. **Matriz ENAMED:** confirmar a versão oficial do INEP a ser usada.
4. **Contas:** criar Vercel, Supabase e domínio num e-mail **institucional do DA**. Quem será admin?
5. **Equipe editorial:** quem revisa cada área (monitores, professores parceiros?).
6. **Política da biblioteca:** o que pode e o que não pode ser enviado (texto para o termo).
7. **Fontes de questões:** haverá autorização de professores para usar provas antigas?

Com a resposta da decisão 4 e o "ok" para a Etapa 0, a implementação pode começar sem depender das demais. As etapas 0 e 1 não precisam de nenhuma conta externa.
