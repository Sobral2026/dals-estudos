import type { Questao } from "@/lib/types";

const FONTE = "Banco DALS — questão de exemplo";

export const QUESTOES: Questao[] = [
  {
    id: "q01",
    disciplina: "anatomia",
    enunciado:
      "Um homem de 68 anos sofre queda da própria altura e apresenta fratura do colo cirúrgico do úmero. Ao exame, não consegue abduzir o braço além de 15° e refere perda de sensibilidade na face lateral do ombro. Qual nervo foi mais provavelmente lesado?",
    alternativas: [
      { letra: "A", texto: "Nervo radial", comentario: "Lesado tipicamente na fratura da diáfise do úmero (sulco do nervo radial), causando mão caída." },
      { letra: "B", texto: "Nervo axilar", comentario: "Contorna o colo cirúrgico do úmero e inerva o deltoide e o redondo menor, além da pele da região do deltoide." },
      { letra: "C", texto: "Nervo musculocutâneo", comentario: "Inerva os flexores do braço (bíceps, braquial); sua lesão compromete a flexão do cotovelo." },
      { letra: "D", texto: "Nervo ulnar", comentario: "Relaciona-se ao epicôndilo medial; sua lesão gera a 'mão em garra'." },
      { letra: "E", texto: "Nervo supraescapular", comentario: "Inerva supra e infraespinal; participa dos primeiros graus de abdução, mas não causa anestesia na face lateral do ombro." },
    ],
    correta: "B",
    explicacao:
      "O nervo axilar passa pelo espaço quadrangular e contorna o colo cirúrgico do úmero junto com a artéria circunflexa umeral posterior. Fraturas nessa região podem lesá-lo, gerando fraqueza na abdução (deltoide) e anestesia na região do 'distintivo de sargento'.",
    referencia: "Moore — Anatomia orientada para a clínica, capítulo de membro superior.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 72,
  },
  {
    id: "q02",
    disciplina: "anatomia",
    enunciado:
      "Após trauma na região temporal (ptério), um jovem perde a consciência, recupera-se por algumas horas e depois evolui com rebaixamento progressivo. A TC mostra coleção biconvexa entre o crânio e a dura-máter. Qual vaso é a origem mais provável do sangramento?",
    alternativas: [
      { letra: "A", texto: "Veias emissárias", comentario: "Podem sangrar, mas não são a causa clássica do hematoma extradural temporal." },
      { letra: "B", texto: "Veias cerebrais superiores (veias-ponte)", comentario: "Sua ruptura causa hematoma subdural, em formato de crescente." },
      { letra: "C", texto: "Artéria meníngea média", comentario: "Corre sob o ptério e é a fonte clássica do hematoma extradural." },
      { letra: "D", texto: "Artéria cerebral média", comentario: "Sangramento dela é intraparenquimatoso ou subaracnóideo, não extradural." },
      { letra: "E", texto: "Seio sagital superior", comentario: "Localiza-se na linha média, longe do ptério." },
    ],
    correta: "C",
    explicacao:
      "O ptério é a região mais fina da calota craniana e cobre o trajeto da artéria meníngea média. Fraturas ali rompem a artéria, formando um hematoma extradural (biconvexo) com o clássico intervalo lúcido.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 81,
  },
  {
    id: "q03",
    disciplina: "fisiologia",
    enunciado:
      "No potencial de ação do cardiomiócito ventricular, a despolarização rápida (fase 0) deve-se principalmente a qual evento iônico?",
    alternativas: [
      { letra: "A", texto: "Influxo de Ca²⁺ por canais tipo L", comentario: "Responsável pelo platô (fase 2), não pela fase 0 do miócito ventricular." },
      { letra: "B", texto: "Efluxo de K⁺ por canais retificadores tardios", comentario: "Promove a repolarização (fase 3)." },
      { letra: "C", texto: "Influxo rápido de Na⁺", comentario: "Abertura dos canais de sódio rápidos gera a subida abrupta da fase 0." },
      { letra: "D", texto: "Corrente funny (If)", comentario: "Importante na despolarização diastólica das células marca-passo do nó sinusal." },
      { letra: "E", texto: "Bomba Na⁺/K⁺-ATPase", comentario: "Mantém os gradientes iônicos, mas não gera a fase 0." },
    ],
    correta: "C",
    explicacao:
      "Nos miócitos de trabalho (átrios e ventrículos), a fase 0 depende dos canais de Na⁺ rápidos. Já nas células nodais (nós sinusal e AV), a fase 0 é lenta e depende do influxo de Ca²⁺.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 68,
  },
  {
    id: "q04",
    disciplina: "fisiologia",
    enunciado:
      "Paciente com intoxicação por opioide apresenta frequência respiratória de 6 irpm. Qual distúrbio ácido-básico é esperado na gasometria arterial?",
    alternativas: [
      { letra: "A", texto: "Acidose respiratória aguda", comentario: "A hipoventilação retém CO₂, elevando a PaCO₂ e reduzindo o pH." },
      { letra: "B", texto: "Alcalose respiratória aguda", comentario: "Ocorre na hiperventilação, com queda da PaCO₂." },
      { letra: "C", texto: "Acidose metabólica com ânion gap aumentado", comentario: "O problema primário aqui é ventilatório, não metabólico." },
      { letra: "D", texto: "Alcalose metabólica", comentario: "Associada a vômitos, diuréticos ou hiperaldosteronismo." },
      { letra: "E", texto: "Gasometria normal", comentario: "Com FR de 6 irpm, a retenção de CO₂ é esperada." },
    ],
    correta: "A",
    explicacao:
      "Opioides deprimem o centro respiratório bulbar. A hipoventilação alveolar eleva a PaCO₂, e o pH cai. No quadro agudo, a compensação renal (retenção de bicarbonato) ainda é mínima.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 77,
  },
  {
    id: "q05",
    disciplina: "bioquimica",
    enunciado:
      "Um homem de 24 anos desenvolve icterícia e urina escura dois dias após iniciar primaquina. O esfregaço mostra corpúsculos de Heinz. A deficiência enzimática provável compromete a produção de qual molécula?",
    alternativas: [
      { letra: "A", texto: "ATP", comentario: "Deficiência de ATP nas hemácias ocorre na deficiência de piruvato-quinase (glicólise)." },
      { letra: "B", texto: "NADH", comentario: "Gerado na glicólise; não é o produto da via afetada." },
      { letra: "C", texto: "NADPH", comentario: "Produto da glicose-6-fosfato desidrogenase, essencial para manter a glutationa reduzida." },
      { letra: "D", texto: "2,3-bifosfoglicerato", comentario: "Modula a afinidade da hemoglobina pelo O₂; não se relaciona à hemólise oxidativa." },
      { letra: "E", texto: "Acetil-CoA", comentario: "Produzido nas mitocôndrias, ausentes nas hemácias maduras." },
    ],
    correta: "C",
    explicacao:
      "Na deficiência de G6PD, a via das pentoses não gera NADPH suficiente. Sem NADPH, a glutationa não é regenerada e a hemácia fica vulnerável ao estresse oxidativo (primaquina, sulfas, favas, infecções), com precipitação de hemoglobina (corpúsculos de Heinz) e hemólise.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "media",
    acertoTurma: 58,
  },
  {
    id: "q06",
    disciplina: "farmacologia",
    enunciado:
      "Jovem de 19 anos chega ao pronto-socorro 4 horas após ingerir grande quantidade de comprimidos de paracetamol. Qual é o antídoto indicado?",
    alternativas: [
      { letra: "A", texto: "Flumazenil", comentario: "Antagonista de benzodiazepínicos." },
      { letra: "B", texto: "Naloxona", comentario: "Antagonista de opioides." },
      { letra: "C", texto: "N-acetilcisteína", comentario: "Repõe a glutationa e neutraliza o metabólito tóxico NAPQI." },
      { letra: "D", texto: "Fomepizol", comentario: "Usado na intoxicação por metanol e etilenoglicol." },
      { letra: "E", texto: "Atropina", comentario: "Usada na intoxicação por organofosforados." },
    ],
    correta: "C",
    explicacao:
      "Em superdosagem, o paracetamol satura as vias de conjugação e é desviado para o CYP2E1, gerando NAPQI, que é hepatotóxico. A N-acetilcisteína é precursora da glutationa e tem máxima eficácia quando iniciada nas primeiras 8 horas.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 85,
  },
  {
    id: "q07",
    disciplina: "farmacologia",
    enunciado:
      "Paciente hipertensa iniciou enalapril há 3 semanas e queixa-se de tosse seca persistente, sem outros sintomas. Qual é o mecanismo desse efeito adverso?",
    alternativas: [
      { letra: "A", texto: "Bloqueio do receptor AT1", comentario: "Mecanismo dos BRAs (ex.: losartana), que raramente causam tosse." },
      { letra: "B", texto: "Acúmulo de bradicinina", comentario: "A ECA também degrada bradicinina; inibida, a bradicinina se acumula e estimula a tosse." },
      { letra: "C", texto: "Hipercalemia", comentario: "Efeito adverso real dos IECA, mas não causa tosse." },
      { letra: "D", texto: "Broncoespasmo por bloqueio β2", comentario: "Mecanismo dos betabloqueadores não seletivos." },
      { letra: "E", texto: "Aumento da aldosterona", comentario: "Os IECA reduzem, e não aumentam, a aldosterona." },
    ],
    correta: "B",
    explicacao:
      "A enzima conversora de angiotensina (cininase II) degrada a bradicinina. Com o IECA, a bradicinina acumula e causa tosse seca e, raramente, angioedema. A troca por um BRA costuma resolver.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 79,
  },
  {
    id: "q08",
    disciplina: "microbiologia",
    enunciado:
      "Durante um surto após enchentes, um adulto apresenta diarreia aquosa volumosa, sem sangue, com aspecto de 'água de arroz', e desidratação grave em poucas horas. Qual o agente mais provável?",
    alternativas: [
      { letra: "A", texto: "Shigella dysenteriae", comentario: "Causa disenteria (diarreia com sangue e muco), não diarreia aquosa volumosa." },
      { letra: "B", texto: "Vibrio cholerae", comentario: "Sua toxina ativa a adenilato ciclase, aumenta o AMPc e causa secreção maciça de cloreto e água." },
      { letra: "C", texto: "Entamoeba histolytica", comentario: "Causa disenteria e úlceras em 'botão de camisa'." },
      { letra: "D", texto: "Clostridioides difficile", comentario: "Associado ao uso de antibióticos e colite pseudomembranosa." },
      { letra: "E", texto: "Salmonella Typhi", comentario: "Causa febre tifoide, com quadro sistêmico predominante." },
    ],
    correta: "B",
    explicacao:
      "A cólera é uma diarreia secretora: a toxina colérica (subunidade A) ativa a proteína Gs, aumentando o AMPc nos enterócitos. O tratamento central é a reidratação vigorosa.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 83,
  },
  {
    id: "q09",
    disciplina: "patologia",
    enunciado:
      "Na necropsia de um paciente que faleceu 3 dias após um infarto agudo do miocárdio, o tecido miocárdico afetado mostra células com contornos preservados, mas sem núcleos. Qual o tipo de necrose?",
    alternativas: [
      { letra: "A", texto: "Necrose liquefativa", comentario: "Típica de infartos no sistema nervoso central e de abscessos." },
      { letra: "B", texto: "Necrose caseosa", comentario: "Característica da tuberculose." },
      { letra: "C", texto: "Necrose de coagulação", comentario: "Padrão dos infartos isquêmicos de órgãos sólidos, como coração e rim." },
      { letra: "D", texto: "Necrose gordurosa", comentario: "Ocorre na pancreatite aguda e no trauma de mama." },
      { letra: "E", texto: "Necrose fibrinoide", comentario: "Vista em vasculites e na hipertensão maligna." },
    ],
    correta: "C",
    explicacao:
      "Na necrose de coagulação, a desnaturação das proteínas preserva a arquitetura tecidual por alguns dias (\"células fantasmas\"). É o padrão clássico da isquemia em órgãos sólidos, exceto o cérebro.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 74,
  },
  {
    id: "q10",
    disciplina: "cardiologia",
    enunciado:
      "Homem de 58 anos com dor torácica há 2 horas. O ECG mostra supradesnivelamento do segmento ST em DII, DIII e aVF. Qual artéria é mais provavelmente a culpada?",
    alternativas: [
      { letra: "A", texto: "Descendente anterior", comentario: "Associada a supra em V1–V4 (parede anterior)." },
      { letra: "B", texto: "Circunflexa", comentario: "Pode causar infarto inferior em dominância esquerda, mas é a causa menos comum." },
      { letra: "C", texto: "Coronária direita", comentario: "Irriga a parede inferior na maioria das pessoas (dominância direita)." },
      { letra: "D", texto: "Tronco da coronária esquerda", comentario: "Geralmente cursa com supra em aVR e infradesnível difuso." },
      { letra: "E", texto: "Primeira diagonal", comentario: "Relaciona-se à parede lateral alta (DI, aVL)." },
    ],
    correta: "C",
    explicacao:
      "DII, DIII e aVF exploram a parede inferior. Em cerca de 80% das pessoas, a parede inferior é irrigada pela coronária direita. Sempre investigue também o ventrículo direito (V3R e V4R).",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "media",
    acertoTurma: 66,
  },
  {
    id: "q11",
    disciplina: "cardiologia",
    enunciado:
      "Paciente com insuficiência cardíaca com fração de ejeção reduzida (FE 30%), em uso de IECA e betabloqueador. Qual medicamento adicional comprovadamente reduz a mortalidade?",
    alternativas: [
      { letra: "A", texto: "Furosemida", comentario: "Alivia a congestão, mas não reduz a mortalidade." },
      { letra: "B", texto: "Digoxina", comentario: "Reduz internações, sem impacto na mortalidade." },
      { letra: "C", texto: "Espironolactona", comentario: "Antagonista mineralocorticoide com redução de mortalidade comprovada na ICFEr." },
      { letra: "D", texto: "Nifedipino", comentario: "Bloqueadores de canal de cálcio di-hidropiridínicos não trazem benefício na ICFEr." },
      { letra: "E", texto: "Verapamil", comentario: "Tem efeito inotrópico negativo e deve ser evitado na ICFEr." },
    ],
    correta: "C",
    explicacao:
      "Os pilares que reduzem a mortalidade na ICFEr são: IECA/BRA/INRA, betabloqueador, antagonista mineralocorticoide (espironolactona) e inibidor de SGLT2. Diuréticos de alça tratam sintomas.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "media",
    acertoTurma: 61,
  },
  {
    id: "q12",
    disciplina: "pneumologia",
    enunciado:
      "Vítima de trauma torácico está hipotensa e taquicárdica, com turgência jugular, desvio da traqueia para a esquerda e murmúrio vesicular abolido à direita. Qual é a conduta imediata?",
    alternativas: [
      { letra: "A", texto: "Solicitar radiografia de tórax", comentario: "O diagnóstico é clínico; esperar o exame atrasa uma conduta salvadora." },
      { letra: "B", texto: "Descompressão torácica imediata por punção", comentario: "Trata o pneumotórax hipertensivo, seguida de drenagem torácica." },
      { letra: "C", texto: "Pericardiocentese", comentario: "Indicada no tamponamento cardíaco, que não desvia a traqueia nem abole o murmúrio." },
      { letra: "D", texto: "Intubação orotraqueal e ventilação com pressão positiva", comentario: "A pressão positiva pode piorar o pneumotórax hipertensivo." },
      { letra: "E", texto: "Infusão rápida de cristaloides isoladamente", comentario: "Não resolve a causa obstrutiva do choque." },
    ],
    correta: "B",
    explicacao:
      "Pneumotórax hipertensivo é um choque obstrutivo de diagnóstico clínico. A conduta é a descompressão imediata com agulha (ou toracostomia digital), seguida de drenagem torácica em selo d'água.",
    referencia: "ATLS — Advanced Trauma Life Support, capítulo de trauma torácico.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 88,
  },
  {
    id: "q13",
    disciplina: "endocrinologia",
    enunciado:
      "Qual dos resultados abaixo, em adulto assintomático, está na faixa diagnóstica de diabetes mellitus (necessitando confirmação com um segundo exame)?",
    alternativas: [
      { letra: "A", texto: "Glicemia de jejum de 112 mg/dL", comentario: "Faixa de pré-diabetes (100–125 mg/dL)." },
      { letra: "B", texto: "Hemoglobina glicada de 6,2%", comentario: "Faixa de pré-diabetes (5,7–6,4%)." },
      { letra: "C", texto: "Glicemia 2 h após sobrecarga de 75 g de 178 mg/dL", comentario: "Faixa de pré-diabetes (140–199 mg/dL)." },
      { letra: "D", texto: "Hemoglobina glicada de 6,7%", comentario: "Valor ≥ 6,5% está na faixa diagnóstica de diabetes." },
      { letra: "E", texto: "Glicemia ao acaso de 185 mg/dL", comentario: "Glicemia casual só é diagnóstica se ≥ 200 mg/dL com sintomas clássicos." },
    ],
    correta: "D",
    explicacao:
      "Critérios de diabetes: glicemia de jejum ≥ 126 mg/dL, HbA1c ≥ 6,5%, glicemia de 2 h no TOTG ≥ 200 mg/dL ou glicemia casual ≥ 200 mg/dL com sintomas. Em assintomáticos, o diagnóstico exige dois exames alterados.",
    referencia: "Diretriz da Sociedade Brasileira de Diabetes.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "media",
    acertoTurma: 70,
  },
  {
    id: "q14",
    disciplina: "endocrinologia",
    enunciado:
      "Mulher de 45 anos refere cansaço, ganho de peso, constipação e intolerância ao frio. Ao exame, pele seca e reflexos com relaxamento lentificado. Qual perfil laboratorial é esperado no hipotireoidismo primário?",
    alternativas: [
      { letra: "A", texto: "TSH baixo e T4 livre alto", comentario: "Perfil de hipertireoidismo primário." },
      { letra: "B", texto: "TSH alto e T4 livre baixo", comentario: "A tireoide falha e a hipófise aumenta o TSH tentando compensar." },
      { letra: "C", texto: "TSH baixo e T4 livre baixo", comentario: "Sugere hipotireoidismo central (hipofisário ou hipotalâmico)." },
      { letra: "D", texto: "TSH alto e T4 livre alto", comentario: "Raro; sugere adenoma secretor de TSH ou resistência a hormônio tireoidiano." },
      { letra: "E", texto: "TSH normal e T4 livre normal", comentario: "Não explica o quadro clínico." },
    ],
    correta: "B",
    explicacao:
      "No hipotireoidismo primário (a causa mais comum é a tireoidite de Hashimoto), a queda de T4 livre retira o feedback negativo sobre a hipófise, que eleva o TSH. O TSH é o melhor exame de rastreio.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 86,
  },
  {
    id: "q15",
    disciplina: "infectologia",
    enunciado:
      "Homem de 30 anos apresenta úlcera genital única, indolor, de bordas endurecidas e fundo limpo, surgida há 10 dias. O teste treponêmico rápido é reagente. Qual é o tratamento de escolha?",
    alternativas: [
      { letra: "A", texto: "Azitromicina 1 g VO dose única", comentario: "Não é primeira escolha para sífilis, por resistência e falha terapêutica." },
      { letra: "B", texto: "Ceftriaxona 500 mg IM dose única", comentario: "Esquema para gonorreia." },
      { letra: "C", texto: "Penicilina G benzatina 2,4 milhões UI IM dose única", comentario: "Tratamento de escolha para sífilis recente (primária, secundária e latente recente)." },
      { letra: "D", texto: "Aciclovir VO por 7 dias", comentario: "Trata herpes genital, que causa lesões dolorosas e múltiplas." },
      { letra: "E", texto: "Doxiciclina por 21 dias", comentario: "Esquema do linfogranuloma venéreo; na sífilis, a doxiciclina é alternativa e por 15 dias." },
    ],
    correta: "C",
    explicacao:
      "O cancro duro (úlcera única, indolor e endurecida) é a lesão da sífilis primária. O tratamento de escolha é a penicilina G benzatina 2,4 milhões UI IM em dose única (1,2 milhão em cada glúteo).",
    referencia: "Ministério da Saúde — PCDT para Atenção Integral às Pessoas com IST.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 80,
  },
  {
    id: "q16",
    disciplina: "infectologia",
    enunciado:
      "Universitário de 19 anos, morador de alojamento, apresenta febre alta, cefaleia, rigidez de nuca e petéquias em membros inferiores, com evolução rápida. Qual o agente mais provável?",
    alternativas: [
      { letra: "A", texto: "Streptococcus pneumoniae", comentario: "Principal causa de meningite em adultos, mas petéquias e púrpura sugerem outro agente." },
      { letra: "B", texto: "Neisseria meningitidis", comentario: "Diplococo gram-negativo associado a aglomerados, petéquias e meningococcemia." },
      { letra: "C", texto: "Listeria monocytogenes", comentario: "Mais comum em idosos, gestantes, imunossuprimidos e neonatos." },
      { letra: "D", texto: "Haemophilus influenzae tipo b", comentario: "Hoje raro, graças à vacinação; acomete principalmente crianças." },
      { letra: "E", texto: "Cryptococcus neoformans", comentario: "Causa meningite subaguda em imunossuprimidos." },
    ],
    correta: "B",
    explicacao:
      "A meningite com exantema petequial ou purpúrico em jovem que vive em ambiente coletivo é muito sugestiva de doença meningocócica. É de notificação compulsória e exige quimioprofilaxia dos contactantes próximos.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 84,
  },
  {
    id: "q17",
    disciplina: "pediatria",
    enunciado:
      "A vacina BCG, aplicada ao nascer no calendário do Programa Nacional de Imunizações, tem como principal objetivo proteger contra:",
    alternativas: [
      { letra: "A", texto: "Todas as formas de tuberculose, incluindo a pulmonar do adulto", comentario: "A proteção contra a tuberculose pulmonar do adulto é baixa e variável." },
      { letra: "B", texto: "Formas graves de tuberculose, como a miliar e a meníngea", comentario: "É o principal benefício da BCG na infância." },
      { letra: "C", texto: "Hanseníase, exclusivamente", comentario: "Há alguma proteção cruzada, mas não é o objetivo principal no nascimento." },
      { letra: "D", texto: "Infecção latente por M. tuberculosis", comentario: "A BCG não impede a infecção." },
      { letra: "E", texto: "Coqueluche", comentario: "A coqueluche é prevenida pelas vacinas com componente pertussis (DTP)." },
    ],
    correta: "B",
    explicacao:
      "A BCG (bacilo atenuado de M. bovis) protege principalmente contra as formas graves e disseminadas da tuberculose na criança: miliar e meningoencefalite tuberculosa.",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "facil",
    acertoTurma: 90,
  },
  {
    id: "q18",
    disciplina: "ginecologia-obstetricia",
    enunciado:
      "Gestante com pré-eclâmpsia grave recebe sulfato de magnésio. Horas depois, apresenta abolição dos reflexos patelares e frequência respiratória de 9 irpm. Além de suspender a infusão, qual medicação deve ser administrada?",
    alternativas: [
      { letra: "A", texto: "Gluconato de cálcio", comentario: "Antagoniza os efeitos do magnésio na junção neuromuscular." },
      { letra: "B", texto: "Hidralazina", comentario: "Anti-hipertensivo; não reverte a intoxicação." },
      { letra: "C", texto: "Diazepam", comentario: "Pode piorar a depressão respiratória." },
      { letra: "D", texto: "Furosemida isolada", comentario: "Pode aumentar a excreção, mas não reverte de forma imediata os efeitos tóxicos." },
      { letra: "E", texto: "Naloxona", comentario: "Antagonista de opioides, sem efeito sobre o magnésio." },
    ],
    correta: "A",
    explicacao:
      "Sinais de intoxicação por magnésio: abolição dos reflexos patelares (primeiro sinal), depressão respiratória e, depois, parada cardíaca. O antídoto é o gluconato de cálcio 10% (1 g IV lento).",
    fonte: FONTE,
    ano: 2026,
    dificuldade: "media",
    acertoTurma: 73,
  },
];

const POR_ID = new Map(QUESTOES.map((q) => [q.id, q]));

export function questaoPorId(id: string) {
  return POR_ID.get(id);
}
