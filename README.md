# Jireh's VA Jewelry — landing one page

Joalheria personalizada, site em espanhol. **HTML + CSS + JS puro**: sem
framework, sem build, sem uma única requisição a terceiros.

```bash
python -m http.server 5173
```

```
index.html   css/style.css   css/fonts.css
js/scene.js  (Three.js: o anel e a gravação)
js/main.js   (GSAP + anime.js + motion.dev)
js/vendor/   assets/fonts/   assets/piezas/
assets/logo.png  assets/logo-mark.png  assets/favicon.png
```

---

## A leitura do briefing

O briefing é curto de propósito. O que dá para extrair com honestidade:

- **Segmento:** joalheria autoral, sob encomenda — não varejo de catálogo.
- **Ocasião de compra:** noivado, aniversário, nascimento, presente afetivo.
- **Tom:** segunda pessoa, íntimo, um-para-um.
- **Público:** hispanofalante; copy em espanhol neutro.

**Posicionamento:** a joia não é o produto — a história é. A joia é o suporte.

---

## Direção visual

**Cor, tirada do logotipo.** O degradê metálico foi amostrado e virou a escala de
ouro (`#7E5F2C` → `#C9A45C` → `#F7EFD8`). Sobre obsidiana **quente** (`#0A0908`),
porque preto neutro deixa o ouro esverdeado. Apoio de esmeralda profunda
(`#123B31`), o par histórico da joalheria, só em brilhos e no painel de sucesso.

**Tipografia, imitando a do logotipo.** **Playfair Display** para títulos, porque
guarda o ar didone da marca; e **Jost** para a interface, porque a linha "JEWELRY"
do logotipo é uma geométrica tipo Futura.

A primeira tentativa foi Bodoni Moda com o eixo óptico no máximo — no papel, o
didone mais fiel ao logotipo. **Na tela ficou ilegível:** sobre fundo escuro os
traços finos de um didone puro afinam ainda mais e somem. Playfair mantém o
mesmo ar com traços que aguentam o contraste invertido. Fidelidade que não se lê
não é fidelidade.

**Estrutura.** Numeração `01–04` só no "Proceso", onde a ordem carrega informação
real. Nos pilares e nas coleções ela foi removida: ali seria decoração fingindo
de estrutura.

---

## O elemento assinatura: a gravação ao vivo

No herói: *"Escribe un nombre y míralo grabado."* Você digita e o nome aparece
gravado no anel 3D, em tempo real.

Um canvas 2D desenha o texto em branco sobre preto e alimenta ao mesmo tempo o
**`bumpMap`** (relevo) e o **`roughnessMap`** (acabamento) do aro. Preto vira ouro
espelhado, branco vira letra fosca e rebaixada — como uma gravação real se
comporta na luz, não um decalque colado por cima.

**Por que isso e não um carrossel de fotos:** a única coisa que esta loja vende e
o concorrente de catálogo não vende é a personalização. Um carrossel prova que
existe estoque; a gravação prova que existe atendimento um-a-um, em dois segundos
e sem o visitante ler nada. Todo o resto do site é contido de propósito para essa
ser a única coisa que se lembra depois.

---

## Cada biblioteca com uma função

| Lib | Função |
|---|---|
| **Three.js** | Anel solitário 100% procedural; gema com transmissão e IOR 2.42 (o índice do diamante). Reage ao ponteiro e ao scroll. |
| **GSAP + ScrollTrigger** | Sequência de carga, revelação por máscara de linha, parallax, marquise. |
| **anime.js** | Os ícones do processo não aparecem: **se desenham** (`stroke-dashoffset`), como um esboço. |
| **motion.dev** | Molas reais (`type: "spring"`) nos botões magnéticos, no tilt dos cards e no cursor sobre o que é clicável. |

**Onde o motion.dev não entra:** o seguimento contínuo do cursor tem integrador de
mola próprio. Disparar uma animação nova a cada frame é justamente o que engasga a
página — a mesma física roda num laço só, sem alocação.

---

## Execução

**Performance** — 60 fps com o ponteiro em movimento, zero *long tasks*. A cena só
renderiza com o herói visível; a transmissão (cara) desliga em aparelho modesto.
O ambiente que reflete no ouro é um HDR falso pintado em canvas: nenhuma textura
para baixar.

**Zero terceiros** — libs em `js/vendor/`, fontes em `assets/fonts/` (só os
subconjuntos latin, 212 KB). Se o CDN estivesse bloqueado numa rede corporativa,
o site perderia exatamente o anel 3D — que é o argumento central.

**Acessibilidade** — `prefers-reduced-motion` respeitado, foco visível, skip link,
`aria-expanded` no menu, e erros de formulário que dizem o que fazer ("Elige una
opción. Si dudas, marca «Aún no lo sé»"). Contraste AA.

**Responsivo** — verificado de 360 a 1440 px, sem overflow horizontal. Três bugs
que a passada revelou:

1. `max-width: 44ch` no cabeçalho de seção — `ch` se mede pela fonte *herdada*, não
   pela do título: os H2 ficavam presos em ~380 px.
2. Enquadramento 3D com números fixos — agora o deslocamento sai do *frustum* real
   da câmera (`tan(fov/2) · z · aspect − raio`), então a joia não corta em nenhuma
   proporção.
3. Máscara de revelação cortando descendentes (o "g" de *Hagamos*) e linhas órfãs
   no mobile.

---

## O logotipo

Usa-se o **arquivo original da marca**, sem redesenho: `logo.png`, PNG RGBA com
fundo realmente transparente (conferido pixel a pixel no canal alfa, não no olho).

O que foi feito a partir dele, tudo por recorte — nada é redesenhado:

- `assets/logo.png` — o logotipo completo, aparado das margens vazias, para que
  escale de forma previsível em vez de flutuar dentro de espaço morto.
- `assets/logo-mark.png` — só o monograma, para o cabeçalho, onde a versão
  empilhada ficaria alta demais. O corte foi medido pelas faixas vazias do canal
  alfa, não a olho.
- `assets/favicon.png` — o monograma centrado sobre a obsidiana da marca.

Como o logotipo agora é imagem e não traçado, o preloader não pode mais
"desenhá-lo". Ele passou a ser descoberto por um **barrido de máscara** da
esquerda para a direita (`clip-path`), que mantém o momento de abertura sem
alterar um pixel da marca.

---

## Fotografia

As 8 peças da vitrine usam fotos reais do **Unsplash**, filtradas por licença
livre (`?license=free`) e baixadas para `assets/piezas/` — nada de hotlink, nada
de imagem gerada por IA. Cada uma foi conferida visualmente: são fotografias de
produto e de estúdio, com luz, sombra e textura reais.

**Otimização.** As fotos originais tinham 760 px de largura para um espaço de
276 px — quase 8x mais pixels do que a tela usa. Cada uma virou duas versões
**WebP** (320 e 640 px) servidas por `srcset` + `sizes`, com um JPEG de 560 px
como reserva para navegadores sem WebP. Enquanto a foto não chega, o espaço fica
preenchido com a **cor dominante** da própria imagem, extraída na geração: nunca
há caixa vazia nem salto de layout.

| | antes | depois |
|---|---|---|
| Tela 1x | 622 KB | **67 KB** |
| Tela 2x | 622 KB | **183 KB** |

A Licença Unsplash permite uso comercial sem pedir permissão; o crédito não é
obrigatório, mas fica registrado aqui e em `assets/piezas/CREDITOS.json`:

- `anillo-solitario.jpg` — Sabrianna · https://unsplash.com/photos/Y_bxfTa_iUA
- `anillos-trio.jpg` — Cornelia Ng · https://unsplash.com/photos/zZLhoEwGCeM
- `aretes-argolla.jpg` — Nataliya Melnychuk · https://unsplash.com/photos/5ngCICAXiH0
- `aretes-piedra.jpg` — Arteum.ro · https://unsplash.com/photos/VJZdxfvFGuo
- `dijes-pareja.jpg` — Andres Vera · https://unsplash.com/photos/202NAwjisYA
- `dije-colgante.jpg` — Alex Azabache · https://unsplash.com/photos/y2ErhoE92KA
- `pulsera-cadena.jpg` — Nataliya Melnychuk · https://unsplash.com/photos/oO0JAOJhquk
- `pulsera-ojo.jpg` — PRAHANT STUDIO · https://unsplash.com/photos/W49Oxm_WnmI

---

## Publicação e pendências

Estático puro: na Vercel, *Import* do repo com **Framework Preset: Other**, build
vazio e output `.`. `js/vendor/` é versionado de propósito.

**Placeholders** que precisam do dado real do cliente: materiais ("Plata 925 · Oro
18k"), prazos, cobertura de envio, e-mail e redes. O formulário valida e confirma
na tela, mas **não envia nada** — a integração natural é WhatsApp Business com
mensagem pré-preenchida. Nenhum número inventado de clientes ou avaliações entrou
no site: prova social falsa quebra confiança em compra afetiva.
