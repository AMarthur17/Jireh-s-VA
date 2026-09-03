# Jireh's VA Jewelry — landing one page

Site em **HTML + CSS + JS** (sem framework, sem build). Abrir com um servidor
estático — os módulos ES não carregam via `file://`:

```bash
python -m http.server 5173
```

Depois: <http://localhost:5173>

```
index.html          marcação + sprite SVG do logo
css/style.css       design system completo (tokens → componentes → responsivo)
css/fonts.css       @font-face das duas famílias, autoalojadas
js/scene.js         Three.js: o anel e a gravação em tempo real
js/main.js          orquestração GSAP + anime.js + motion.dev
js/vendor/          as quatro libs, servidas do próprio domínio
assets/logo.svg     logotipo revetorizado
assets/fonts/       Bodoni Moda + Jost (subconjuntos latin, SIL OFL 1.1)
```

**Zero requisições externas.** Nem CDN de biblioteca, nem Google Fonts: o site
não faz uma única conexão a terceiros. Verificável no DevTools — todos os
recursos saem do mesmo domínio.

---

## 1. O que o briefing entregou — e o que foi extraído dele

O briefing é curto de propósito ("quanto menos info, mais a gente cria"). Foi tudo
o que ele dá, e o que dá para inferir com honestidade:

| Dado do briefing | Leitura |
|---|---|
| "joyas personalizadas que cuentan historias" | **Segmento:** joalheria autoral / personalizada — não varejo de catálogo |
| "cada pieza es elaborada con dedicación" | **Modelo:** produção artesanal, sob encomenda, volume baixo |
| "tus momentos más especiales" | **Ocasião de compra:** noivado, aniversário, nascimento, presente afetivo |
| "una joya tan especial como tú" | **Tom:** segunda pessoa, íntimo, um-para-um |
| Idioma espanhol + "VA" | **Público:** hispanofalante (LatAm neutro na copy) |
| Logo em dourado metálico | **Nível de preço:** premium acessível, não luxo inacessível |

**Posicionamento adotado:** *a joia não é o produto — a história é. A joia é o
suporte.* Tudo no site decorre disso: o herói não mostra um catálogo, mostra
**a sua palavra sendo gravada no metal**.

---

## 2. Direção visual

### Cor — tirada do logotipo

O degradê do logo foi amostrado ponto a ponto e virou a escala de ouro:

| Token | Hex | Origem |
|---|---|---|
| `--oro-900` | `#7E5F2C` | sombra do degradê |
| `--oro-700` | `#A87F3F` | início do degradê |
| `--oro-500` | `#C9A45C` | **cor de marca** — o tom médio |
| `--oro-300` | `#EBD59B` | brilho |
| `--oro-100` | `#F7EFD8` | reflexo especular |

Cores de apoio (o "match" pedido):

| Token | Hex | Por quê |
|---|---|---|
| `--noir` / `--noir-800` | `#0A0908` / `#100E0C` | Obsidiana **quente**, não preto puro. Preto neutro deixa o ouro esverdeado; o preto amarronzado faz o metal parecer mais quente e mais caro. É o fundo de vitrine de joalheria. |
| `--esm-900` / `--esm-700` | `#0B2620` / `#123B31` | Verde esmeralda profundo. Ouro + esmeralda é o par histórico da joalheria — entra só em brilhos, no fundo do "Proceso" e no painel de sucesso do formulário. Nunca compete com o ouro. |
| `--marfil` | `#EFEAE0` | Marfim quente para texto. Branco puro sobre preto vibra; marfim descansa a leitura. |

O logo original vem sobre fundo branco. **A marca funciona melhor invertida**:
sobre a obsidiana o degradê metálico lê como metal, não como amarelo.

### Tipografia — também tirada do logotipo

Duas famílias, ambas rastreáveis ao logo — nenhuma escolhida por hábito:

- **Bodoni Moda** (títulos, logotipo, itálicos): o logotipo é um didone de alto
  contraste. Bodoni Moda é um didone real com eixo óptico variável, então o
  wordmark reconstruído fica fiel ao original e os títulos grandes ganham o
  contraste fino/grosso que dá o ar de editorial de joalheria.
- **Jost** (corpo, interface, rótulos): a linha "JEWELRY" do logo é uma
  geométrica tipo Futura. Jost é exatamente isso — então a UI inteira herda
  a voz do próprio logotipo em vez de importar uma sans qualquer.

O itálico do Bodoni marca **uma** palavra por título (*historia*, *elige*,
*para siempre*, *pieza*) — é o único destaque tipográfico do site.

### Estrutura

Numeração `01–04` aparece **só no "Proceso"**, onde a ordem carrega informação
real (você não pode fabricar antes de desenhar). Nos pilares e nas coleções, que
não são sequência, os marcadores numéricos foram removidos de propósito — ali
eles seriam decoração fingindo de estrutura.

---

## 3. O elemento assinatura: a gravação ao vivo

No herói há um campo: **"Escribe un nombre y míralo grabado en el aro."**
Você digita, e o nome aparece gravado no anel 3D — em tempo real.

Como funciona (`js/scene.js`): um `<canvas>` 2D desenha o texto em branco sobre
preto e alimenta ao mesmo tempo o **`bumpMap`** (relevo) e o **`roughnessMap`**
(acabamento) do aro. Preto vira ouro espelhado; branco vira letra fosca e
rebaixada. É literalmente como uma letra gravada se comporta na luz — não é um
decalque colado por cima.

**Por que isso e não um carrossel de fotos:** a única coisa que essa loja vende e
a concorrência de catálogo não vende é *a personalização*. Um carrossel prova que
existe estoque; a gravação ao vivo prova que existe **atendimento um-a-um**, e
prova em dois segundos, sem o visitante ler nada. É o argumento comercial virando
interação em vez de virando parágrafo.

Tudo o mais no site é deliberadamente contido para essa ser a única coisa que se
lembra depois.

---

## 4. Cada biblioteca com uma função

Nenhuma delas se sobrepõe — e nenhuma é obrigatória para o site funcionar.

| Lib | Função | Onde |
|---|---|---|
| **Three.js** | A joia e a gravação | anel solitário 100% procedural (torus + talha brilhante), `MeshPhysicalMaterial` com transmissão, IOR 2.42 (índice do diamante) e um toque de iridescência. Reage ao ponteiro com amortecimento, e ao scroll via `ScrollTrigger`. |
| **GSAP + ScrollTrigger** | Ritmo e sequência | sequência de carregamento, revelação por máscara de linha, parallax, barra de progresso, marquise infinita, e o scroll que afasta a joia. |
| **anime.js** | Traço | os ícones não aparecem: eles **se desenham** (`stroke-dashoffset`), inclusive o monograma do preloader. Coerente com a promessa de "boceto" do passo 02. |
| **motion.dev** | Física real | molas de verdade (`type: "spring"`) nos botões magnéticos, na inclinação 3D dos cards e no anel do cursor ao passar sobre algo clicável. O repique ao soltar é massa/rigidez/amortecimento — não é um `cubic-bezier` imitando. |

> **Onde o motion.dev não entra, e por quê.** O *seguimento* contínuo do cursor
> tem integrador de mola próprio, escrito à mão. Disparar uma animação nova a
> cada frame (60/s) é justamente o que engasga a página; a mesma física roda num
> único laço, sem alocação. O motion.dev fica com os gestos discretos —
> interromper e retomar uma mola com a velocidade preservada é exatamente onde
> ele ganha de qualquer alternativa.

### Sem dependências de terceiros em tempo de execução

As quatro libs vivem em `js/vendor/` e as duas famílias tipográficas em
`assets/fonts/`. Três motivos, nesta ordem:

1. **Nenhum ponto único de falha.** Se o jsDelivr estiver bloqueado numa rede
   corporativa, o site perderia exatamente o anel 3D — que é o argumento central.
2. **Mais rápido.** Uma origem só, sem DNS/TLS extra na rota crítica, e as fontes
   entram com `preload` em vez de esperar um CSS de terceiros.
3. **Privacidade.** Google Fonts a partir do domínio do cliente evita expor o IP
   do visitante a um terceiro — o que já rendeu multa por GDPR na Europa.

Das fontes só foram baixados os subconjuntos **latin** e **latin-ext** (212 KB no
total): é tudo o que um site em espanhol usa. Cirílico, grego e símbolos ficaram
de fora.

### Sem ambiente externo

O reflexo do ouro e da gema vem de um **HDR falso pintado em canvas** dentro do
próprio `scene.js` (bandas de luz quente + um respingo de esmeralda), passado por
`PMREMGenerator`. Zero arquivo de textura para baixar: a cena inteira é código.

---

## 5. Qualidade de execução

**Performance**
- A cena só renderiza quando o herói está visível (`IntersectionObserver`).
- `transmission` (caro) desliga em aparelho modesto — `pointer: coarse` ou
  ≤ 4 núcleos —, com fallback opaco; `devicePixelRatio` limitado a 1.4 lá e 2 aqui.
- `ResizeObserver` no canvas (o herói muda de altura quando o preloader sai, e
  isso não dispara `resize`).
- Nenhuma imagem raster: toda a ilustração é SVG/vetor.

**Degradação** — cada camada cai sozinha, sem levar as outras:
- CDN do motion.dev fora → sem molas, o CSS cobre os estados de hover.
- CDN do GSAP/anime fora → conteúdo aparece de uma vez (a classe `js` é removida).
- Sem WebGL → `body.no-3d`, o campo de gravação some e um anel em CSS entra no lugar.
- Sem JS → tudo visível, nada escondido por animação que nunca vai rodar.

**Acessibilidade**
- `prefers-reduced-motion` desliga preloader, cursor, revelações e a animação 3D.
- Foco visível em tudo, link "saltar al contenido", `aria-expanded` no menu,
  rótulos reais no formulário e mensagens de erro que dizem **o que fazer**
  ("Elige una opción. Si dudas, marca «Aún no lo sé»") em vez de "campo inválido".
- Contraste: texto principal ~8:1 e o secundário ~5.7:1 sobre a obsidiana (AA).

**Rendimento medido** — 60 fps constantes com o ponteiro em movimento contínuo e
zero *long tasks*. O que custava caro e foi removido: `mix-blend-mode` numa camada
fixa de tela cheia (obriga a recompor tudo a cada frame), `will-change` permanente
em dezenas de elementos, e uma animação nova por frame no cursor.

---

## 6. Responsividade

Testado e ajustado em **360 · 390 · 768 · 960 · 1024 · 1440**, sem overflow
horizontal em nenhum (verificado por medição, não no olho — `body overflow-x:
hidden` esconde esse tipo de bug).

| Faixa | O que muda |
|---|---|
| ≥ 1100 | 4 colunas; joia à direita do texto; nav completa |
| 900–1100 | 2 colunas; coluna de texto a 64% |
| < 900 | menu full-screen com `clip-path`; a joia recua para plano de fundo (36% de opacidade) para não brigar com o título |
| < 600 | 1 coluna; joia a 26%; botões do herói em largura total; escala tipográfica própria |

Três correções que a passada de responsividade revelou:

1. **`max-width: 44ch` no cabeçalho de seção.** `ch` se mede pela fonte *herdada*
   (Jost 1rem), não pela do título — os H2 ficavam presos em ~380 px e quebravam
   em lugares errados. Removido.
2. **Enquadramento 3D com números fixos.** O deslocamento lateral da joia agora é
   calculado a partir do *frustum* real da câmera
   (`tan(fov/2) · z · aspect − raio`), então ela nunca é cortada, seja qual for a
   proporção do herói. Antes, entre 900 e 1100 px, o anel encostava na borda.
3. **Quebras de linha órfãs.** Os títulos têm quebras escritas à mão (a máscara de
   revelação precisa delas). No mobile sobrava "decir" e "joya" sozinhos numa
   linha — os títulos foram reescritos em três linhas curtas e a escala
   tipográfica de ≤600 px foi calibrada para cada linha caber num renglón.

---

## 7. O logotipo

O arquivo original é raster com fundo branco. Foi **revetorizado** (`assets/logo.svg`),
não filtrado:

- O monograma caligráfico foi redesenhado em três caminhos Bézier — laço,
  filete + volta superior, e a haste entintada. Escala infinita, nítido em
  qualquer tamanho, ~2 KB.
- O degradê metálico virou um `linearGradient` de 8 paradas, reproduzindo a
  varredura fosco→brilho→fosco do original.
- Fundo **transparente** — funciona sobre claro e sobre escuro.
- O wordmark usa Bodoni Moda com o mesmo tracking do original.

Desenho, proporções e composição foram mantidos: a mudança é de **suporte**
(pixel → vetor), não de identidade.

> Para um arquivo 100% portátil (e-mail, gráfica, editor sem internet), basta
> converter os dois `<text>` em contornos num editor vetorial — o monograma já é
> caminho puro. O SVG atual depende da webfont, o que é o certo para uso web.

---

## 8. Publicação

Site estático puro: **sem build, sem dependências para instalar**.

Na Vercel — *Add New → Project → Import* deste repositório, com
**Framework Preset: Other**, *Build Command* vazio e *Output Directory* `.`
(a raiz). Qualquer host de estáticos serve igual: Netlify, Cloudflare Pages,
GitHub Pages ou um bucket S3.

O que **não** vai para o repositório (ver `.gitignore`): artefatos de
ferramenta (`.agents/`, `.claude/`, `skills-lock.json`) e `.vercel/`.
`js/vendor/` **é versionado de propósito** — é o que garante o deploy
autossuficiente descrito acima.

---

## 9. Conteúdo — o que é real e o que é placeholder

A copy toda foi escrita para este briefing (espanhol neutro, segunda pessoa,
verbos ativos, sem "somos líderes en"). Estes pontos são **placeholder** e
precisam do dado real do cliente antes de ir ao ar:

- "Plata 925 · Oro 18k" e "certificado" — materiais e garantia reais.
- "menos de 24 horas", "Envíos a todo el país" — prazos e cobertura reais.
- `hola@jirehsva.com` e os links de redes.
- O formulário é **só front-end**: valida e confirma na tela, não envia nada.
  Ponto de integração natural: WhatsApp Business com mensagem pré-preenchida, ou
  um endpoint de formulário.

Nenhum número inventado (avaliações, "+500 clientes") entrou no site — prova
social falsa é o tipo de coisa que quebra confiança em compra afetiva.
