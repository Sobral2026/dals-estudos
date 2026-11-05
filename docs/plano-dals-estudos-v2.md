# DALS Estudos — Etapa 1: auditoria, diagnóstico e plano técnico

> **Versão 2** · 29/10/2026 · Substitui a v1 (`plano-dals-estudos.md`, mantida como histórico), agora alinhada ao prompt "Evolução do DALS Questões para DALS Estudos".
> **Nenhum arquivo de código foi alterado nesta etapa.** Aguardando aprovação para iniciar a Etapa 2.
> Legenda: ✅ verificado · ⚠️ existe com limitação · ❌ não existe · ❓ depende de informação externa.

---

## Sumário executivo

- O DALS Questões é um **protótipo funcional só de front-end**:
  - Next.js 15.5.4, React 19, Tailwind 4;
  - conteúdo em arquivos TypeScript;
  - progresso no `localStorage`.
- **Não há:** banco de dados, autenticação, servidor de API, armazenamento de arquivos nem testes.
- **Vale preservar:** a identidade visual, as 7 telas, os fluxos de estudo e a lógica de revisão espaçada. A arquitetura facilita a evolução, porque toda a persistência passa por um único arquivo (`src/lib/store.ts`).
- **Riscos críticos atuais:**
  - o **gabarito é enviado ao navegador**, o que invalida o modo prova;
  - o **protótipo não está versionado no git**;
  - a **"média da turma" é fictícia**.
- **Recomendação de infraestrutura:** PostgreSQL gerenciado com Auth, Storage privado e Row Level Security. A proposta principal é o Supabase, com a alternativa avaliada na seção 2.3. **Nada disso está instalado ou contratado.**
- **Bloqueios externos ❓:**
  - grade curricular oficial da FMC;
  - documento oficial da matriz do ENAMED;
  - forma de verificar o vínculo com a FMC;
  - contas institucionais do DALS.

---

## 1. Auditoria do projeto (Etapa 1)

### 1.1 Dependências e infraestrutura (verificado em `package.json` e na árvore do projeto)

| Item | Resultado |
|---|---|
| Dependências de produção | `next 15.5.4`, `react 19.1.0`, `react-dom 19.1.0`. **Nenhuma outra.** |
| Dev | TypeScript 5, Tailwind 4, ESLint 9 (`eslint-config-next`) |
| Scripts | `dev`, `build`, `start`, `lint`. **Não existe script de teste.** |
| Banco / ORM | ❌ Nenhum (sem Supabase, Prisma, Drizzle ou `.env`) |
| Autenticação | ❌ Nenhuma |
| `middleware.ts`, rotas `api/`, Server Actions | ❌ Nenhum |
| Armazenamento de arquivos | ❌ Nenhum (só `public/dals-emblema.png`) |
| Testes | ❌ Nenhum framework nem arquivo de teste |
| Lint | ✅ `npm run lint` sem erros nem avisos (verificado hoje) |
| Build | ✅ `npm run build` concluído sem erros na sessão anterior; o código não mudou desde então |
| Git | ⚠️ Só o commit inicial do `create-next-app`. **Todo o protótipo está sem commit.** |

### 1.2 Inventário funcional (o que deve ser preservado)

| Funcionalidade | Rota | Arquivos principais | Estado |
|---|---|---|---|
| Identidade visual (verde-escuro, branco, neutros; Oswald + Nunito Sans) | — | `globals.css` (tokens `--color-dals-*`), `layout.tsx` | ✅ |
| Logomarca DALS | — | `public/dals-emblema.png`, `src/app/icon.png` | ✅ (ícone pesado: ~630 KB) |
| Menu lateral (drawer no celular) | todas | `components/AppShell.tsx` | ✅ |
| Página inicial e indicadores | `/` | `app/page.tsx` | ✅ (média da turma fictícia) |
| Banco de questões e montagem de simulado | `/questoes` | `app/questoes/page.tsx` | ✅ filtros: disciplina, todas/não respondidas/erradas, modo, quantidade |
| Modos tutor e prova | `/simulado/[id]` | `components/PlayerSimulado.tsx` | ✅ (⚠️ gabarito no cliente) |
| Resultado | `/simulado/[id]/resultado` | `app/simulado/[id]/resultado/page.tsx` | ✅ |
| Revisão espaçada | `/revisao` | `lib/revisao.ts`, `app/revisao/page.tsx` | ✅ (ver 1.4) |
| Trilhas | `/trilhas`, `/trilhas/[id]` | `data/trilhas.ts`, páginas | ✅ |
| Desempenho | `/desempenho` | `lib/estatisticas.ts`, `app/desempenho/page.tsx` | ✅ (sem histórico de evolução) |
| Reportar erro | modal no player | `PlayerSimulado.tsx`, `store.ts` | ⚠️ fica salvo só no navegador do aluno |
| Conteúdo | — | `data/questoes.ts` (18 questões de exemplo), `disciplinas.ts` (12), `trilhas.ts` (2) | ⚠️ classificação simplificada e fictícia |

### 1.3 Arquitetura atual

```
Telas (Client Components)
   │  usam apenas funções de
   ▼
src/lib/store.ts  ──►  localStorage ("dals-questoes:v1")      ← única fronteira de persistência
   │
   ├─ src/lib/revisao.ts       (regras puras de revisão espaçada)
   ├─ src/lib/estatisticas.ts  (agregações puras)
   └─ src/data/*.ts            (questões, disciplinas, trilhas: no bundle do cliente)
```

**Ponto forte:** a fronteira única de persistência e as regras puras permitem trocar o armazenamento por um banco sem reescrever as telas.
**Ponto fraco:** todo o conteúdo, inclusive o gabarito, viaja para o navegador.

### 1.4 Verificação da lógica de revisão espaçada (`src/lib/revisao.ts`)

Regra implementada:
- **Errou** → intervalo de 0 dias; a questão volta imediatamente e a sequência de acertos zera.
- **Acertou** → intervalo base pela confiança:
  - 😟 Chutei = 1 dia;
  - 😐 Acho que sei = 2 dias;
  - 😄 Tenho certeza = 4 dias.
- **Acertos seguidos** → `max(base, intervalo anterior × 2)`.
- **Situação:**
  - aprendida: antes do prazo;
  - hoje: até 24 h de atraso;
  - atrasada: de 1 a 7 dias;
  - muito atrasada: mais de 7 dias.

| # | Achado | Impacto | Proposta (sem mudar a lógica sem aprovação) |
|---|---|---|---|
| R1 | Um acerto com **"Chutei"** depois de uma sequência ainda **dobra** o intervalo | Superestima o domínio | Acerto com confiança 1 não aumenta a sequência e usa o intervalo base. **Decisão pedagógica: precisa de aprovação.** |
| R2 | "Para hoje" usa **24 h corridas**, não o dia do calendário | Uma questão que vence às 22h não aparece pela manhã | Calcular pelo fim do dia no fuso `America/Sao_Paulo` |
| R3 | "Sua nota" usa a **última** tentativa de cada questão | Sem medida de evolução; a nota sobe só de refazer | Guardar todas as tentativas, que já existem em `historico`, e exibir 1ª tentativa × atual |
| R4 | No modo prova, as respostas são registradas no fim com o **mesmo horário** e **sem tempo por questão** | Sem estatística de tempo | Registrar `respondido_em` e `tempo_ms` por item |
| R5 | `historico` cresce sem limite no `localStorage` | Limite de cerca de 5 MB por navegador | Resolvido com a persistência em banco (Etapa 6) |
| R6 | Não há testes automatizados da regra | Regressões silenciosas | Testes unitários antes de migrar (Etapa 2) |

Conclusão: a lógica está **correta conforme especificada** e é preservável. R1 e R2 são ajustes recomendados, sujeitos à sua aprovação.

### 1.5 Riscos e dívidas encontrados

| # | Risco / dívida | Gravidade |
|---|---|---|
| A1 | **Gabarito, comentários e explicações no bundle do cliente**: o modo prova pode ser burlado pelo DevTools | Crítica para prova e para PDF de gabarito separado |
| A2 | **Protótipo sem commit no git** | Crítica (risco de perda) |
| A3 | **Média da turma fictícia** (`acertoTurma` fixo por questão) | Alta (proibido em produção, conforme o item 6 do prompt) |
| A4 | Classificação única (`disciplina`): falta período, assunto, subassunto, ENAMED, autoria, licença, versão e status | Alta |
| A5 | Reportes de erro não chegam à diretoria | Média |
| A6 | Sem versionamento de questões: corrigir uma questão altera o significado do histórico antigo | Média |
| A7 | Acessibilidade: alternativas sem `role="radiogroup"`/`aria-checked`; feedback dependente de cor em pontos | Média |
| A8 | No celular, a navegação numerada entre questões fica oculta | Baixa |
| A9 | Lógica de confirmação duplicada (clique × teclado) no player | Baixa |
| A10 | O schema do `localStorage` não tem versão nem migração | Baixa agora, alta ao evoluir |
| A11 | Ícone de 630 KB; `.claude/launch.json` duplicado | Baixa |

### 1.6 Lacunas em relação ao prompt

| Item do prompt | Situação |
|---|---|
| §2 Ambiente público (Jornal) × reservado (Estudos) com rotas e permissões distintas | ❌ |
| §2 Cadastro com verificação de vínculo FMC | ❌ ❓ |
| §3 Dupla classificação (FMC: período › disciplina › assunto › subassunto; ENAMED: área › competência › habilidade › tema clínico; dificuldade) | ❌ ❓ (listas oficiais) |
| §4 Filtros por período, assunto e competência | ⚠️ só disciplina |
| §4 Histórico de respostas | ⚠️ existe localmente, sem tela própria |
| §4 Exportação PDF (lista, gabarito separado, gabarito comentado, autoria/referência/versão, só questões autorizadas) | ❌ |
| §5 Biblioteca, enviar material, fluxo editorial de 5 fases, devolução, versões, retirada, declaração de autoria | ❌ |
| §6 Persistência, sincronização, histórico de revisões, evolução, recomendações, estatísticas por competência, média real anonimizada | ❌ / ⚠️ |
| §7 Painel administrativo, 5 papéis, auditoria | ❌ |
| §8 Postgres, auth, storage privado, controle no servidor, validação de upload, backups, LGPD, retenção | ❌ |
| §8 Responsividade | ✅ telas atuais (verificado em 375 px e 1366 px) |

---

## 2. Arquitetura proposta

### 2.1 Dois ambientes, rotas distintas

Usando *route groups* do App Router. Cada grupo tem layout e proteção próprios.

```
src/app/
├─ (publico)/                    ← sem login · layout do Jornal (mesma paleta e logo)
│  ├─ page.tsx                   /                    capa do Jornal DALS + botão "Entrar no DALS Estudos"
│  ├─ jornal/page.tsx            /jornal              lista, com filtros por categoria
│  ├─ jornal/[slug]/page.tsx     /jornal/[slug]       matéria (SSG/ISR + SEO)
│  ├─ privacidade/  termos/  sobre/
│  └─ entrar/  cadastro/  verificacao/
├─ (estudos)/                    ← exige login + vínculo FMC aprovado · usa o AppShell atual
│  ├─ inicio/                    /inicio              ← painel que hoje está em "/"
│  ├─ questoes/  simulado/[id]/…  revisao/  desempenho/  trilhas/   (rotas atuais mantidas)
│  ├─ biblioteca/                /biblioteca, /biblioteca/[id]
│  ├─ biblioteca/enviar/         /biblioteca/enviar   "Enviar material"
│  ├─ meus-envios/               acompanhamento do fluxo editorial
│  └─ perfil/                    dados, privacidade, exportar/excluir meus dados
└─ (painel)/painel/              ← exige papel ≥ revisor · layout administrativo
   ├─ questoes/  materiais/  triagem/  revisao-academica/  reportes/
   ├─ trilhas/  taxonomias/  jornal/  usuarios/  auditoria/
```

**Única mudança de URL proposta:** o painel do estudante sai de `/` para `/inicio`, porque `/` passa a ser a capa pública do Jornal. Um aluno logado que acessar `/` vê o botão "Ir para meus estudos". Todas as outras rotas atuais permanecem.

### 2.2 Controle de acesso em três camadas

1. **`middleware.ts`**: redireciona quem não está logado em `(estudos)` e quem não tem o papel exigido em `(painel)`.
2. **Servidor**: Server Components e Server Actions conferem a sessão e o papel antes de ler ou gravar.
3. **Banco (RLS)**: é a garantia final. Mesmo com um bug na UI, o aluno A não lê dados do aluno B, e o gabarito não sai antes da hora.

### 2.3 Escolha de infraestrutura (a contratar ❓)

| Critério | Opção 1: Supabase (recomendada) | Opção 2: Postgres (Neon) + Auth.js + Drizzle + storage S3/R2 |
|---|---|---|
| PostgreSQL | ✅ | ✅ |
| Auth (Google, magic link, domínio) | ✅ integrado | ✅ Auth.js (mais código) |
| Armazenamento privado + URL assinada | ✅ integrado | ✅ serviço separado |
| Permissão no banco (RLS) | ✅ nativo e integrado ao Auth | ⚠️ possível, mas manual |
| Backups | ✅ automáticos nos planos pagos; no gratuito, exigem rotina própria (`pg_dump` agendado) ❓ confirmar limites vigentes | ✅ conforme o provedor |
| Peças para a equipe do DA manter | 1 serviço | 3 a 4 serviços |

**Recomendação:** Supabase com `@supabase/ssr` (sessão por cookie), chave `service_role` só no servidor e migrações SQL versionadas no repositório (`supabase/migrations`). Hospedagem do Next.js na Vercel.
**Nada disso está instalado.** A instalação só acontece na Etapa 2, após aprovação e com contas criadas pelo DALS.

### 2.4 Verificação de vínculo com a FMC ❓

| Método | Como | Dado pessoal coletado |
|---|---|---|
| A. Domínio institucional | Login restrito a e-mails `@<domínio FMC>` | Só o e-mail. **Preferível, se o domínio existir.** |
| B. Aprovação manual | Conta entra como `pendente`; o aluno informa matrícula e período; a diretoria confere com a lista da turma | Matrícula (guardar só "verificado em/por"; **não armazenar comprovante**) |
| C. Convite por turma | Código distribuído pelo representante, com validade e limite de usos | Nenhum além do cadastro |

Sugestão: **A** se existir; senão **C + B**. O convite agiliza, e a aprovação garante que só alunos da FMC entrem.

### 2.5 Papéis e permissões

| Ação | Estudante | Colaborador | Revisor acadêmico | Editor | Administrador |
|---|:-:|:-:|:-:|:-:|:-:|
| Resolver, simular, revisar, ver o próprio desempenho | ✅ | ✅ | ✅ | ✅ | ✅ |
| Baixar materiais e PDFs autorizados | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enviar material ou questão autoral | ✅ | ✅ (com crédito de colaborador) | ✅ | ✅ | ✅ |
| Triagem editorial | | | | ✅ | ✅ |
| Revisão acadêmica (das áreas atribuídas) | | | ✅ | ✅ | ✅ |
| Aprovar, publicar, devolver e retirar conteúdo | | | aprovar ✅ | ✅ | ✅ |
| Administrar trilhas e taxonomias | | | | ✅ | ✅ |
| Publicar no Jornal | | | | ✅ | ✅ |
| Gerenciar usuários, papéis e vínculos | | | | | ✅ |
| Ver auditoria | | | | leitura parcial | ✅ |

---

## 3. Modelo de dados (PostgreSQL)

Princípios: **uma questão existe uma única vez**; as classificações são vínculos N:N. **Nada é apagado fisicamente**: o conteúdo é arquivado ou retirado. **Toda edição gera versão.** **Toda ação relevante é auditada.**

### 3.1 Pessoas, acesso e LGPD

```sql
perfis (id uuid PK → auth.users, nome, email, periodo_atual smallint NULL,
        papel text CHECK (papel IN ('estudante','colaborador','revisor','editor','administrador')),
        vinculo_status text CHECK (vinculo_status IN ('pendente','verificado','recusado','encerrado')),
        vinculo_metodo text, vinculo_verificado_por uuid, vinculo_verificado_em timestamptz,
        criado_em, atualizado_em)
revisor_areas (perfil_id, disciplina_id NULL, enamed_area_id NULL)   -- escopo do revisor
convites (codigo PK, periodo smallint, criado_por, expira_em, usos_max, usos)
consentimentos (perfil_id, documento text ('termos','privacidade'), versao text, aceito_em)
solicitacoes_titular (id, perfil_id, tipo ('exportar','excluir','corrigir'), status, criado_em, concluido_em)
```

### 3.2 Taxonomias (estrutura pronta, conteúdo oficial a cadastrar ❓)

```sql
-- Modelo A — FMC
periodos (numero smallint PK, nome)                              -- cadastrado pelo DALS a partir da grade oficial
disciplinas (id PK, nome, periodo smallint FK, ativa bool, fonte_documento, validado_por, validado_em)
assuntos (id PK, disciplina_id FK, pai_id FK NULL, nome, ordem)  -- pai_id NULL = assunto; com pai = subassunto

-- Modelo B — ENAMED
enamed_areas        (id PK, codigo_oficial NULL, nome, fonte_documento, validado_por, validado_em)
enamed_competencias (id PK, area_id FK, codigo_oficial NULL, descricao, validado_por, validado_em)
enamed_habilidades  (id PK, competencia_id FK, codigo_oficial NULL, descricao, validado_por, validado_em)
temas_clinicos      (id PK, nome, area_id FK NULL)
```
- `codigo_oficial` fica **vazio** até ser preenchido a partir do documento oficial.
- `validado_por/em` marca quem conferiu.
- Nenhuma lista será pré-cadastrada pelo desenvolvimento, exceto exemplos rotulados como "exemplo" no ambiente de testes.

### 3.3 Questões

```sql
questoes (id uuid PK, codigo text UNIQUE,                         -- ex.: "q01" das 18 atuais
          status text CHECK (status IN ('rascunho','triagem','revisao_academica','aprovada','publicada','devolvida','retirada')),
          dificuldade smallint CHECK (dificuldade BETWEEN 1 AND 5),  -- única, usada nos dois modelos
          origem text ('autoral_aluno','autoral_docente','prova_publica','prova_interna_autorizada','dals'),
          licenca text, permite_download bool DEFAULT false,      -- regra do PDF (§4)
          autorizacao_ref text NULL,                              -- documento/termo que autoriza reprodução
          autor_id FK perfis NULL, autor_nome_exibicao text,
          versao_publicada_id FK NULL, criado_em, atualizado_em)
questao_versoes (id uuid PK, questao_id FK, numero int, enunciado, imagem_path NULL, imagem_credito NULL,
                 correta char(1), explicacao, referencias text[], alteracoes text,
                 editado_por FK, criado_em)                        -- imutável depois de criada
alternativas (id uuid PK, versao_id FK, letra char(1), texto, comentario)

-- Dupla classificação sem duplicar a questão
questao_fmc    (questao_id FK, disciplina_id FK, assunto_id FK NULL, subassunto_id FK NULL, PRIMARY KEY (questao_id, disciplina_id, assunto_id))
questao_enamed (questao_id FK, area_id FK, competencia_id FK NULL, habilidade_id FK NULL, tema_clinico_id FK NULL)
```

### 3.4 Fluxo editorial (questões e materiais)

```
Envio ─► Triagem editorial ─► Revisão acadêmica ─► Aprovação ─► Publicação
              │                     │                              │
              └──── Devolvida para correção ◄──┘                   └─► Retirada (com motivo)
```

```sql
fluxo_eventos (id, entidade ('questao','material'), entidade_id, de_status, para_status,
               ator_id, comentario, criado_em)       -- histórico completo; nunca editado
```

### 3.5 Biblioteca colaborativa

```sql
materiais (id uuid PK, tipo ('resumo','mapa_mental','roteiro_revisao','questao_autoral','outro'),
           titulo, descricao, palavras_chave text[], periodo FK NULL, disciplina_id FK NULL, assunto_id FK NULL,
           status (mesmos estados do fluxo), autor_id FK, versao_publicada_id FK NULL, permite_download bool,
           criado_em, atualizado_em, busca tsvector)  -- busca textual em português
material_versoes (id, material_id, numero, arquivo_path (bucket PRIVADO), mime, tamanho_bytes, sha256,
                  referencias text[], notas_versao, enviado_em)
declaracoes_autoria (id, material_id NULL, questao_id NULL, perfil_id, texto_versao,
                     declara_autoria bool, autoriza_publicacao bool,
                     declara_sem_conteudo_proibido bool,   -- livros, slides de professores, provas internas, dados de pacientes
                     aceito_em)
denuncias (id, material_id, perfil_id, motivo, status, tratado_por, criado_em)
```

### 3.6 Estudo, revisão e desempenho

```sql
simulados (id uuid PK, aluno_id FK, titulo, modo ('tutor','prova'), filtros jsonb, inicio, fim, finalizado bool)
simulado_itens (simulado_id, ordem, questao_id, versao_id, letra NULL, confianca NULL, respondido_em NULL, tempo_ms NULL)
respostas (id PK, aluno_id FK, questao_id FK, versao_id FK, letra, acertou bool, confianca smallint,
           tentativa int, origem ('simulado','revisao','trilha'), simulado_id NULL, tempo_ms, criado_em)
revisao_estado (aluno_id, questao_id, acertos_seguidos, intervalo_dias, proxima, PRIMARY KEY (aluno_id, questao_id))
revisao_historico (id, aluno_id, questao_id, acertou, confianca, intervalo_anterior, intervalo_novo, criado_em)
trilhas (id, nome, descricao, ordem, status) · trilha_blocos (id, trilha_id, titulo, ordem)
bloco_criterios (bloco_id, disciplina_id NULL, assunto_id NULL, competencia_id NULL)
reportes (id, questao_id, versao_id, aluno_id, motivo, detalhe, status, tratado_por, criado_em)
```

**Média da turma (só dados reais e agregados):**
- view materializada por questão, disciplina e competência, recalculada periodicamente;
- é exibida **somente** com pelo menos **10 estudantes distintos**; abaixo disso, mostra "dados insuficientes";
- nunca há ranking nominal nem estatística por turma pequena.

**Indicadores fictícios:** o campo `acertoTurma` do protótipo é removido da exibição na Etapa 6. Ele não é apagado do arquivo de exemplo, só deixa de ser usado.

### 3.7 Jornal DALS

```sql
posts (id, slug UNIQUE, categoria ('noticia','entrevista','reportagem','projeto','evento','pesquisa','institucional'),
       titulo, resumo, corpo_md, capa_path (bucket PÚBLICO), capa_credito, autor_id, status
       ('rascunho','revisao','agendado','publicado','arquivado'), publicar_em, publicado_em, atualizado_em)
post_versoes (id, post_id, corpo_md, editado_por, criado_em)
```

### 3.8 Auditoria

```sql
auditoria (id, ator_id, acao, tabela, registro_id, antes jsonb, depois jsonb, ip_hash NULL, criado_em)
```
É preenchida por *triggers* nas tabelas de conteúdo, papéis e vínculos. Só administradores leem.

---

## 4. Exportação em PDF (desenho)

- **Origem:** lista de questões filtradas ou um simulado finalizado. **Só entram questões com `permite_download = true` e status `publicada`.** As demais são omitidas, com aviso.
- **Três formatos:**
  1. caderno de questões;
  2. caderno + **gabarito separado** (página final só com letras);
  3. caderno + **gabarito comentado** (explicação e comentário por alternativa).
- **Rodapé de cada questão:** código, versão, autoria, referências e licença.
- **Cabeçalho:** "DALS Estudos", data, nome do aluno (marca d'água leve para desestimular redistribuição).
- **Geração no servidor**, para o gabarito não trafegar antes da hora. Implementação inicial com `@react-pdf/renderer` em Route Handler; alternativa: Chromium headless (mais pesado na Vercel).
- **Registro:** cada exportação grava autor, filtros e questões incluídas.

---

## 5. LGPD, segurança e retenção

| Tema | Medida |
|---|---|
| Base legal e transparência | Termos e Política de Privacidade versionados; aceite registrado em `consentimentos` |
| Minimização | Nome, e-mail, período e dados de estudo. Sem CPF; sem guardar comprovante de matrícula |
| Direitos do titular | Exportar meus dados (JSON) e excluir conta em `/perfil`; prazo de atendimento definido pelo DALS |
| Retenção (proposta, a aprovar) | Conta sem acesso por 24 meses → aviso → anonimização das respostas (mantidas só nos agregados); vínculo encerrado na formatura → acesso por 6 meses e depois anonimização; logs de auditoria por 5 anos |
| Dados de pacientes | Proibidos em materiais e questões; checagem na triagem; denúncia e retirada imediata |
| Uploads | Somente PDF, PNG e JPG; tamanho máximo (ex.: 20 MB); verificação de *magic bytes* no servidor; nome aleatório; bucket privado; URL assinada de curta duração; sem execução nem pré-visualização de HTML |
| Conteúdo do Jornal | Markdown sanitizado; sem HTML livre; Content-Security-Policy |
| Segredos | Chaves só em variáveis de ambiente do servidor; nada `NEXT_PUBLIC_` além da URL e da chave anônima |
| Backups | Diários (plano do provedor ou `pg_dump` agendado para storage externo); teste de restauração trimestral |
| Testes de segurança | Testes automatizados de RLS (aluno A × aluno B; estudante × painel; anon × área reservada) |
| Governança | Contas (Vercel, Supabase, domínio) em e-mail **institucional do DALS**; no mínimo 2 administradores; documentação de transição de gestão |

---

## 6. Plano de implementação por etapas

Regras para todas as etapas:
- ao fim de cada uma, informo arquivos criados e modificados, executo lint, build e testes, e listo erros e limitações;
- nada é declarado concluído sem verificação;
- **nenhuma migração destrutiva e nenhuma publicação sem sua autorização**;
- o `localStorage` do protótipo nunca é apagado automaticamente.

| Etapa | Entregas | Critérios de aceite | Bloqueios ❓ |
|---|---|---|---|
| **1. Auditoria** ✅ *(este documento)* | Diagnóstico, riscos, arquitetura, modelo de dados, plano | Aprovação sua | — |
| **2. Dados, autenticação e permissões** | (a) Commit do protótipo como linha de base. (b) Vitest + testes de `revisao.ts`/`estatisticas.ts` (sem mudar comportamento). (c) Interface `Repositorio` + `RepositorioLocal` (comportamento atual). (d) Instalar Supabase (`@supabase/ssr`), migrações SQL de `perfis`, `convites`, `consentimentos`, `auditoria` e o esqueleto das taxonomias. (e) Route groups `(publico)`, `(estudos)`, `(painel)` + `middleware.ts`. (f) Login, cadastro, tela "aguardando verificação" e aprovação de vínculo no painel. (g) RLS + testes de política | Telas atuais funcionando igual; anônimo não acessa `(estudos)`; estudante não acessa `(painel)`; aluno A não lê dados de B (teste automatizado) | Contas do DALS no Supabase e na Vercel; método de vínculo (2.4) |
| **3. Biblioteca e painel editorial** | Menu **Biblioteca** e **Enviar material**; upload validado; declaração de autoria; fluxo de 5 fases com devolução, versões e retirada; painel de triagem e revisão acadêmica; denúncias; questões autorais entram no mesmo fluxo | Nenhum envio aparece publicado sem passar pelas 5 fases (teste); arquivo inválido é recusado no servidor; todo evento fica em `fluxo_eventos` | Texto da política da biblioteca e da declaração (aprovação do DALS) |
| **4. Dupla classificação FMC/ENAMED** | Tabelas de questões e versões; vínculos `questao_fmc`/`questao_enamed`; cadastro de taxonomias no painel (com `validado_por`); seed das 18 questões (versão 1); filtros por período, disciplina, assunto, subassunto, área, competência, habilidade, tema e dificuldade em `/questoes` | Uma mesma questão aparece nos dois modelos sem duplicação (teste); filtros combinados funcionam | Grade oficial da FMC; documento oficial do ENAMED |
| **5. Exportação em PDF** | Route Handler de PDF nos 3 formatos; filtro `permite_download`; rodapé com autoria, versão e referências; registro de exportações | Questão não autorizada nunca entra no PDF (teste); o gabarito separado sai em página própria | Autorização de reprodução das fontes |
| **6. Persistência de desempenho e revisão** | `RepositorioSupabase`; correção no servidor (gabarito fora do bundle); `respostas`, `revisao_estado`, `revisao_historico`; importação única do progresso local; evolução (1ª tentativa × atual), revisão das erradas, recomendações por assunto e competência; média da turma real com N ≥ 10; remoção de `acertoTurma` da UI; ajustes R1/R2 se aprovados | O gabarito não aparece no JS do cliente no modo prova (verificado); o progresso sincroniza entre dois navegadores; não há nenhum indicador fictício | — |
| **7. Jornal DALS público** | `/`, `/jornal`, `/jornal/[slug]` com SSG/ISR e SEO; editor no painel com rascunho, revisão e agendamento; categorias | Post publicado visível sem login; rascunho invisível; Markdown sanitizado | Linha editorial e responsáveis do Jornal |
| **8. Testes, segurança e implantação** | Playwright (fluxos principais em celular, tablet e desktop); auditoria de acessibilidade (A7, A8); revisão de segurança; backups e teste de restauração; Política de Privacidade e Termos; ambiente de homologação; **deploy só com autorização** | Checklist de segurança e LGPD aprovado; piloto com uma turma | Aprovação final do DALS |

**Observação sobre a ordem:** a Biblioteca (Etapa 3) filtra por período, disciplina e assunto. Por isso a Etapa 2 já cria as **tabelas** de taxonomia vazias; a Etapa 4 cuida do cadastro oficial e dos filtros de questões.

---

## 7. Decisões e informações necessárias

| # | Pergunta | Necessária para |
|---|---|---|
| 1 | Você aprova iniciar a **Etapa 2**? Isso inclui fazer o **commit do protótipo atual** como linha de base | Etapa 2 |
| 2 | A FMC fornece **e-mail institucional** aos alunos? Qual domínio? Se não, aprovação manual, convite ou ambos? | Etapa 2 |
| 3 | O DALS cria as contas **Supabase** e **Vercel** num e-mail institucional e me dá acesso de desenvolvimento? Ou prefere a alternativa da seção 2.3? | Etapa 2 (d) em diante |
| 4 | Quem são os primeiros **administradores**, **editores** e **revisores acadêmicos**? | Etapas 2 e 3 |
| 5 | **Grade curricular oficial** da FMC (documento) e quem a valida | Etapa 4 |
| 6 | **Documento oficial da matriz do ENAMED** (INEP) a adotar | Etapa 4 |
| 7 | Aprovação dos textos: política da biblioteca, declaração de autoria, termos, privacidade e retenção | Etapas 3 e 8 |
| 8 | Ajustes pedagógicos R1 (acerto com "Chutei" não aumenta a sequência) e R2 ("hoje" pelo calendário) | Etapa 6 |

> **Sem o item 3, a Etapa 2 pode avançar em (a), (b), (c) e (e)** (commit, testes, repositório e separação de rotas), que não dependem de serviços externos. A autenticação real fica para quando as contas existirem.
