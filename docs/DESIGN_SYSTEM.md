# Design System do Cora

Guia para quem mantém o front do Cora (React 19 + Vite + TypeScript + Tailwind CSS v4). A fonte única de verdade dos tokens é o bloco `@theme` em `src/index.css`; tudo aqui documenta o que está implementado, não o que foi planejado.

## 1. Fundamentos

### Paleta (mantida: cinza e branco)

| Token | Hex | Uso |
|---|---|---|
| `bg` | #f5f5f5 | fundo de página |
| `surface` | #ffffff | cards, campos, modais claros |
| `surface-alt` | #eeeeee | blocos secundários, fundo de modal, campos "preenchidos" |
| `surface-soft` | #fafafa | fundo de `.form-input` |
| `border` | #e2e2e2 | bordas e divisores |
| `ink` | #141414 | texto principal, botão primário |
| `muted` | #5f6774 | texto secundário (passa AA sobre `bg`, `surface` e `surface-alt`) |
| `brand` / `brand-dark` / `brand-soft` | #171717 / #000000 / #ececec | ação primária, hover, fundo suave |
| `women` (+`-soft`) | #831843 / #fce7f3 | tag e filtro "Exclusivo mulheres" |
| `pcd` (+`-soft`) | #1e3a8a / #dbeafe | tag e filtro "PCD (conceitual)" |
| `pet` (+`-soft`) | #92400e / #fde9d0 | tag e filtro "Aceita pet" |
| `success` (+`-soft`) | #047857 / #d1fae5 | reserva confirmada, preço abaixo do sugerido |
| `warning` (+`-soft`) | #b45309 / #fef3c7 | preço acima do sugerido, pendências |
| `danger` (+`-soft`) | #b91c1c / #fee2e2 | erro, exclusão, valor muito acima |

Regras: nenhuma cor nova de destaque; `women/pcd/pet` só em tags e filtros; status só em feedback. Use os tokens (`bg-ink`, `text-muted`, `bg-success`) em vez de `bg-black`, `text-gray-500`, `bg-emerald-600`. Exceção aceita: `red-800/900` no botão "Cancelar" de solicitação (vermelho fosco validado).

### Tipografia

Duas famílias: `font-sans` = DM Sans (corpo, padrão global); `font-display` = Space Grotesk (marca e títulos de destaque). Escala em uso:

| Papel | Classes | Onde |
|---|---|---|
| H1 hero | `text-4xl md:text-6xl font-bold tracking-tight` | Home, Landing |
| H1 de página | `text-2xl sm:text-3xl font-bold` (ou `font-black`) | Caronas, Veículos, Cadastro |
| H2 de seção | `text-xl sm:text-2xl font-black tracking-tight` | "Caronas disponíveis" |
| H3 de card | `text-sm sm:text-base font-bold` | nome do motorista, títulos de card |
| Corpo | `text-sm` / `text-base`, `leading-relaxed` em parágrafos | descrições |
| Eyebrow | `.eyebrow` (`text-xs font-bold uppercase tracking-widest text-muted`) | "Minha garagem", "Preferências" |
| Legenda | `text-xs` (12px) ou `text-[11px]` no mínimo | metadados, datas |

Não use texto abaixo de 11px nem `text-gray-400` para texto legível.

### Espaçamento, raio, sombra, movimento

- Espaçamento: escala de 4px do Tailwind. Gaps internos `gap-2/3/4`, padding de card `p-4 sm:p-6`, padding de seção `py-12 sm:py-16`, container `max-w-6xl`/`max-w-7xl` com `px-4 sm:px-6`.
- Raio: `rounded-xl` para botões e campos; `rounded-2xl` para cards e modais; `rounded-3xl` só nos cards-hero da Home e no card de busca; `rounded-full` para chips e avatares.
- Sombra: `shadow-sm` em cards e botões; `shadow-xl` nos cards-hero; `shadow-2xl` em modais. Sem sombras coloridas.
- Movimento: `transition-colors` (150ms) em botões; animações só com prefixo `motion-safe:`; `@keyframes` próprios devem ficar dentro de `@media (prefers-reduced-motion: no-preference)`. O `index.css` já zera animações e transições globalmente quando a pessoa pede menos movimento.

## 2. Primitivas de UI (`src/index.css`, `@layer components`)

```jsx
<button className="btn btn-primary">Salvar</button>
<button className="btn btn-secondary">Cancelar</button>
<button className="btn btn-ghost">Ver mais</button>
<button className="btn btn-danger">Excluir</button>
<input className="form-input" />
<p className="eyebrow">Minha garagem</p>
```

- `.btn`: `inline-flex min-h-11 gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-colors`, com `disabled:` já tratado. Combine com uma variante.
- `.btn-primary` = preto (`bg-ink`, hover `bg-black`). `.btn-secondary` = branco com borda. `.btn-ghost` = só texto. `.btn-danger` = vermelho fosco.
- Botões "gated" (só habilitam com o formulário completo): mantenha o padrão de Cadastro/Veículos — preto quando completo, neutro (branco com borda ou `surface-alt`) quando não; nunca use a mesma cor do fundo do container.
- `.form-input`: campo padrão com foco em `ring-brand/20`. Campos dentro de blocos cinza (BuscaBar) usam o próprio estilo do componente.
- Foco: `:focus-visible` global com contorno `brand` de 2px. Não remova o foco; se precisar de estilo próprio, use `focus-visible:` e mantenha contraste.

Componentes React reutilizáveis já existentes: `BuscaBar` (variants `hero`/`compacta`), `ResultadosCaronas` (lista + `AcaoSolicitacao`), `ChatReserva`, `CarLoading`, `Navbar`, `Footer`.

## 3. Padrões de página

- Cabeçalho de seção: eyebrow + título + subtítulo curto em `text-muted`. Título em negrito, subtítulo em peso normal (nunca o contrário).
- Cards de lista: `bg-surface-alt rounded-2xl border border-border p-4 sm:p-6 shadow-sm`, hover `shadow-xl`.
- Chips de filtro/preferência: pílula, texto normal (sem caixa alta), sólido + `shadow-md` quando ativo, `cor/10` quando inativo, sempre com `aria-pressed`.
- Modais: overlay `bg-black/55`, painel `rounded-2xl bg-surface-alt p-6 shadow-2xl`, `role="dialog" aria-modal aria-labelledby`. Próximo passo: extrair um `Modal` com `<dialog>` nativo (Esc, foco e bloqueio de rolagem de graça).
- Formulários: label envolvendo o input (ou `htmlFor`/`id` com `useId`), erro inline com `role="alert"` abaixo do campo, toast só para resultado da ação.
- Toasts: sempre por `ToastAlerta` (tema claro, pausa no hover, arrastável). Um único `ToastContainer`, em `App.tsx`.
- Vazio e carregamento: `CarLoading` para carregar; estado vazio em caixa `surface-alt` com texto `text-muted`.

## 4. Acessibilidade (regras adotadas)

- Contraste mínimo 4.5:1 em texto (`muted` e status-700 foram escolhidos por isso).
- Todo interativo tem foco visível; toggles usam `aria-pressed`; ícones decorativos têm `aria-hidden`; imagens têm `alt` (vazio quando decorativas).
- Alvo de toque ≥ 32px (`min-h-8 min-w-8`), botões principais ≥ 44px (`min-h-11`).
- `prefers-reduced-motion` respeitado globalmente e nas animações pontuais (`motion-safe:`).
- Não sinalize estado só por cor: acompanhe com texto ou ícone.

## 5. Migração incremental e manutenção

1. Ao tocar numa tela, troque classes soltas de botão por `.btn` + variante e `text-gray-*`/`bg-black` pelos tokens. Não reescreva telas inteiras de uma vez.
2. Novo componente só quando houver comportamento (modal, campo com máscara, chip com estado); estilo puro vira classe em `@layer components`.
3. Nova cor ou tamanho de fonte entra primeiro no `@theme`/nesta tabela, depois no código.
4. Checklist de PR: tokens em vez de literais; `.btn`/`.form-input` onde couber; foco visível; `aria-*` em toggles/modais; contraste conferido; nada abaixo de 11px; animações com `motion-safe:`; `npx tsc -b` e `npx eslint` sem erros novos.

### Concluído nesta rodada

- `ModalOverlay` (`src/components/ui/ModalOverlay.tsx`): Esc, foco inicial, focus trap e retorno de foco, scroll lock — usado em Veículos, edição de carona (`ResultadosCaronas`) e alerta de veículo (`Caronas`). Ainda usa `<div role="dialog">`, não `<dialog>` nativo (ver pendência abaixo).
- `CriarCaronas`: labels associados via `useId`/`htmlFor` (partida, destino, data, horário, valor); ícones e textos dos toggles PCD/Pet/Mulheres corrigidos para não ficarem invisíveis quando inativos; cor do preço digitado usando os tokens `success`/`warning`/`danger`; `text-[#000000]` trocado por `text-ink`.
- `Perfil`: `window.alert` trocado por erro inline com `role="alert"`; senha mínima de confirmação alinhada com Cadastro via `utils/validacao.ts` (`SENHA_MINIMA`) — corrige um bug real (a senha das contas demo tem 6 caracteres, o Perfil exigia 8 e nunca deixava salvar).
- `Navbar`: menu de perfil fecha com Esc e clique fora; `aria-label`/`aria-haspopup` coerentes com o estado aberto/fechado.
- `MinhasSolicitacoes`: abas com `role="tablist"`/`role="tab"`/`aria-selected` + `tabpanel`; linha de ações com `flex-wrap` e `min-h-8`; texto `text-gray-400` trocado por `text-muted`.
- `ChatReserva`: campo de mensagem com `aria-label`; lista de mensagens com `role="log"`/`aria-live="polite"`.
- `LandingPage`: carrossel pausa no hover/foco e não avança com `prefers-reduced-motion: reduce`.
- `Footer`: nomes da equipe e copyright trocados de hex fixo para `text-white/70`/`text-white/55` (≥ 4.5:1 sobre preto).
- `BuscaBar`: `--busca-ink-soft` escurecido para `#5f6774` (mesmo ajuste do token global `muted`), corrigindo o contraste dos rótulos/placeholders sobre os blocos preenchidos da variante hero.

### Backlog priorizado (ainda aberto)

1. Trocar `ModalOverlay` por `<dialog>` nativo (ganha Esc/top-layer do próprio navegador, simplifica o componente).
2. `CriarCaronas`: nome acessível nos botões −/+ de assentos (`aria-label`); indicar preço acima/abaixo do sugerido também em texto (`role="status"`), não só por cor.
3. `BuscaBar` compacta: alvos do contador de vagas e dos botões de período ≥ 32px.
4. Skip link e foco no título ao trocar de rota (`App.tsx`).
5. `Mapa.tsx` (Maplibre GL — testamos migrar para Leaflet, mais leve, mas foi revertido a pedido): `erro` declarado e não usado no catch de `desenharRotaNoMapa`; `setErroDoMapa` de coordenadas ausentes roda dentro do efeito em vez de ser derivado no render; nenhum `alt`/nome acessível no contêiner do mapa.

## 6. Decisões de design validadas (não reverter)

Paleta neutra sem cor de destaque; navbar preta com logo branca (`h-10 sm:h-12`); BuscaBar hero (bloco único origem/destino com inverter, botão preto com destaque branco e lupa pulsando quando pronto); Home com saudação, cards de busca e "Bem-vindo(a) de volta" da mesma altura e resultados já visíveis; chips de preferência sólidos/suaves; botões gated em Cadastro e Veículos; `AcaoSolicitacao` (avião de papel, spinner, check, "Cancelar" vermelho fosco sem etiqueta "Aguardando"); PCD como botão-etiqueta; foto por URL; VLibras e carrossel escondidos no mobile; rótulos curtos nos toggles.
