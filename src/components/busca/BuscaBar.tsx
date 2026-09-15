import { useId } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import {
  MagnifyingGlass,
  CalendarBlank,
  Clock,
  Minus,
  Plus,
  GenderFemale,
  Wheelchair,
  PawPrint,
  MapPin,
  ArrowsDownUp,
} from '@phosphor-icons/react';

/*
 * BuscaBar
 * ---------------------------------------------------------------
 * Paleta e tipografia próprias deste componente (não reaproveitam
 * --color-bg/creme nem DM Sans — ver comentário de paleta abaixo).
 *
 * variant="compacta" (barra de filtro inline nos resultados, em
 * Caronas.tsx) mantém a linguagem original de "bilhete de trajeto":
 * rótulos em Space Mono, ponto vazado (origem) → ponto cheio
 * (destino).
 *
 * variant="hero" (campo de busca de destaque, hoje só na Home) foi
 * refeito no formato padrão de app de mobilidade (Uber/99/BlaBlaCar):
 * origem e destino como dois campos empilhados com fundo preenchido,
 * ligados por um trilho vertical ponto-linha-quadrado à esquerda, sem
 * a moldura de "passagem" (selo, corte na lateral do botão, linha de
 * perfuração) — que, num card de busca do dia a dia, lia mais como
 * enfeite do que como algo funcional.
 *
 * A logotipo "CORA" (Space Grotesk) não é usada aqui — o texto
 * digitado usa 'Archivo', no lugar do DM Sans do restante do app. As
 * fontes são carregadas via <link> abaixo — o React 19 içar (hoist) e
 * deduplica tags de recurso para o <head> sozinho, então não é
 * preciso tocar em index.css/index.html.
 */

export type PeriodoBusca = 'Manha' | 'Tarde' | 'Noite' | 'Todos';

export interface BuscaBarProps {
  variant: 'hero' | 'compacta';
  origem: string;
  onOrigemChange: (valor: string) => void;
  destino: string;
  onDestinoChange: (valor: string) => void;
  data: string; // yyyy-mm-dd
  onDataChange: (valor: string) => void;
  horario?: string; // usado no variant 'hero'
  onHorarioChange?: (valor: string) => void;
  periodo?: PeriodoBusca; // usado no variant 'compacta'
  onPeriodoChange?: (valor: PeriodoBusca) => void;
  vagas: number;
  onVagasChange: (valor: number) => void;
  apenasMulheres: boolean;
  onApenasMulheresChange: (valor: boolean) => void;
  pcd: boolean;
  onPcdChange: (valor: boolean) => void;
  pet: boolean;
  onPetChange: (valor: boolean) => void;
  onSubmit?: () => void; // variant 'hero': botão "Buscar" chama isso
  textoBotao?: string;
}

// Variáveis CSS locais — a paleta "bilhete de trajeto" não existe em
// index.css de propósito: fica isolada aqui até que (se) o restante do
// app decida adotar essa linguagem visual.
type VariaveisCSS = CSSProperties & Record<`--${string}`, string>;

const paleta: VariaveisCSS = {
  '--busca-paper': '#FFFFFF',
  '--busca-paper-sunken': '#EEEEEE',
  '--busca-ink': '#141414',
  // #5f6774 (não o cinza mais claro #6B7280): passa 4.5:1 também sobre o
  // fundo preenchido dos blocos (--busca-paper-sunken), onde ficam os
  // rótulos e placeholders da variante hero — mesmo ajuste do token
  // global --color-muted, replicado aqui porque esta paleta é isolada.
  '--busca-ink-soft': '#5f6774',
  '--busca-line': '#E2E2E2',
  // Preto/cinza-bem-escuro como único acento — sem matiz — para
  // combinar com a paleta neutra (cinza e branco) do resto do app.
  '--busca-accent': '#141414',
  '--busca-accent-soft': '#ECECEC',
  // Mesmo tom em Home, LandingPage e Caronas hoje — os "furos" da
  // perfuração usam essa variável para parecer recortados no papel.
  // Uma página com fundo diferente do --color-bg padrão pode
  // sobrescrever --color-bg só na subárvore ao redor do BuscaBar para
  // os furos casarem com o papel certo.
  '--busca-notch': 'var(--color-bg, #F5F5F5)',
};

const FOCO =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--busca-accent)]';

function RotuloCampo({ children }: { children: ReactNode }) {
  return (
    <span className="block font-['Space_Mono'] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--busca-ink-soft)]">
      {children}
    </span>
  );
}

function Separador() {
  return <span aria-hidden="true" className="hidden h-9 w-px shrink-0 self-center bg-[var(--busca-line)] sm:block" />;
}

function ContadorVagas({ vagas, onChange, compacto = false }: { vagas: number; onChange: (v: number) => void; compacto?: boolean }) {
  // h-8 (32px) é o alvo mínimo de toque recomendado — só o variant
  // compacto (barra inline nos resultados, onde espaço é curto) abre
  // mão disso.
  const tamanhoBotao = compacto ? 'h-6 w-6' : 'h-8 w-8';
  return (
    <div className="mt-1 flex items-center gap-2.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, vagas - 1))}
        disabled={vagas <= 1}
        aria-label="Diminuir número de vagas"
        className={`grid ${tamanhoBotao} shrink-0 place-items-center rounded-full border border-[var(--busca-line)] text-[var(--busca-ink)] transition hover:border-[var(--busca-accent)] hover:text-[var(--busca-accent)] disabled:cursor-not-allowed disabled:opacity-30 ${FOCO}`}
      >
        <Minus size={11} weight="bold" />
      </button>
      <span className="w-3 text-center font-['Space_Mono'] text-sm font-bold text-[var(--busca-ink)]">{vagas}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(6, vagas + 1))}
        disabled={vagas >= 6}
        aria-label="Aumentar número de vagas"
        className={`grid ${tamanhoBotao} shrink-0 place-items-center rounded-full border border-[var(--busca-line)] text-[var(--busca-ink)] transition hover:border-[var(--busca-accent)] hover:text-[var(--busca-accent)] disabled:cursor-not-allowed disabled:opacity-30 ${FOCO}`}
      >
        <Plus size={11} weight="bold" />
      </button>
    </div>
  );
}

function ChipPreferencia({
  ativo,
  onClick,
  icone,
  classeAtiva,
  classeInativa,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  icone: ReactNode;
  classeAtiva: string;
  classeInativa: string;
  children: ReactNode;
}) {
  // Mesma linguagem das etiquetas da landing page (pílula cheia, texto
  // normal — sem o caixa-alta/monoespaçada de antes): estado ativo é
  // idêntico ao selo decorativo de lá (cor sólida + texto branco +
  // sombra); o inativo usa a mesma cor só que suave, pra continuar
  // óbvio que é um filtro que se liga/desliga.
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors sm:text-sm ${FOCO} ${ativo ? classeAtiva : classeInativa}`}
    >
      {icone}
      {children}
    </button>
  );
}

function FontesBuscaBar() {
  // React 19 içar (hoist) e deduplica <link> por href — seguro chamar
  // em mais de uma instância do componente na mesma árvore.
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
      />
    </>
  );
}

function BuscaBar(props: BuscaBarProps) {
  const {
    variant,
    origem,
    onOrigemChange,
    destino,
    onDestinoChange,
    data,
    onDataChange,
    horario,
    onHorarioChange,
    periodo,
    onPeriodoChange,
    vagas,
    onVagasChange,
    apenasMulheres,
    onApenasMulheresChange,
    pcd,
    onPcdChange,
    pet,
    onPetChange,
    onSubmit,
    textoBotao,
  } = props;

  const idOrigem = useId();
  const idDestino = useId();
  const idData = useId();
  const idHorario = useId();

  function submeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    onSubmit?.();
  }

  function inverterOrigemDestino() {
    const novaOrigem = destino;
    const novoDestino = origem;
    onOrigemChange(novaOrigem);
    onDestinoChange(novoDestino);
  }

  // Só a origem é obrigatória pra buscar — é o que ancora a busca ("de
  // onde eu saio"). Destino em branco mostra qualquer destino a partir
  // dali (útil pra quem só quer ver o que tem saindo dali); data,
  // horário, vagas e as preferências são refinamentos por cima disso.
  // Essa é a mesma regra que o filtro em ResultadosCaronas já aplica
  // (destino vazio bate com qualquer viagem) — o botão só precisa
  // acompanhar.
  const rotaPreenchida = origem.trim() !== '';

  const chips = (
    <div className="flex flex-wrap items-center gap-2">
      <ChipPreferencia
        ativo={apenasMulheres}
        onClick={() => onApenasMulheresChange(!apenasMulheres)}
        icone={<GenderFemale size={13} weight="bold" />}
        classeAtiva="bg-women text-white shadow-md"
        classeInativa="bg-women/10 text-women hover:bg-women/20"
      >
        Exclusivo mulheres
      </ChipPreferencia>
      <ChipPreferencia
        ativo={pcd}
        onClick={() => onPcdChange(!pcd)}
        icone={<Wheelchair size={13} weight="bold" />}
        classeAtiva="bg-pcd text-white shadow-md"
        classeInativa="bg-pcd/10 text-pcd hover:bg-pcd/20"
      >
        PCD (conceitual)
      </ChipPreferencia>
      <ChipPreferencia
        ativo={pet}
        onClick={() => onPetChange(!pet)}
        icone={<PawPrint size={13} weight="bold" />}
        classeAtiva="bg-pet text-white shadow-md"
        classeInativa="bg-pet/10 text-pet hover:bg-pet/20"
      >
        Aceita pet
      </ChipPreferencia>
    </div>
  );

  if (variant === 'compacta') {
    return (
      <>
        <FontesBuscaBar />
        <div
          role="search"
          aria-label="Filtrar caronas"
          style={paleta}
          className="w-full border-b border-[var(--busca-line)] bg-[var(--busca-paper)] font-['Archivo']"
        >
          <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 sm:py-2.5">
            {/* Rota inline: pontinho vazado → pontinho cheio, ligados por um traço curto */}
            <div className="flex flex-1 items-stretch gap-2">
              <div className="flex flex-1 items-center gap-2 py-1">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full border-2 border-[var(--busca-ink)]" />
                <label htmlFor={idOrigem} className="min-w-0 flex-1">
                  <RotuloCampo>De</RotuloCampo>
                  <input
                    id={idOrigem}
                    type="text"
                    value={origem}
                    onChange={(e) => onOrigemChange(e.target.value)}
                    placeholder="Origem"
                    className={`w-full truncate bg-transparent text-sm font-semibold text-[var(--busca-ink)] outline-none placeholder:font-normal placeholder:text-[var(--busca-ink-soft)] ${FOCO}`}
                  />
                </label>
              </div>

              <span aria-hidden="true" className="hidden w-4 self-center border-t border-dashed border-[var(--busca-line)] sm:block" />

              <div className="flex flex-1 items-center gap-2 py-1">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[var(--busca-accent)]" />
                <label htmlFor={idDestino} className="min-w-0 flex-1">
                  <RotuloCampo>Para</RotuloCampo>
                  <input
                    id={idDestino}
                    type="text"
                    value={destino}
                    onChange={(e) => onDestinoChange(e.target.value)}
                    placeholder="Destino"
                    className={`w-full truncate bg-transparent text-sm font-semibold text-[var(--busca-ink)] outline-none placeholder:font-normal placeholder:text-[var(--busca-ink-soft)] ${FOCO}`}
                  />
                </label>
              </div>
            </div>

            <Separador />

            <label htmlFor={idData} className="flex items-center gap-2 py-1 sm:w-32">
              <CalendarBlank size={15} weight="bold" className="shrink-0 text-[var(--busca-ink-soft)]" />
              <span className="min-w-0 flex-1">
                <RotuloCampo>Data</RotuloCampo>
                <input
                  id={idData}
                  type="date"
                  value={data}
                  onChange={(e) => onDataChange(e.target.value)}
                  className={`w-full bg-transparent text-sm font-semibold text-[var(--busca-ink)] outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 ${FOCO}`}
                />
              </span>
            </label>

            {onPeriodoChange && (
              <>
                <Separador />
                <div className="flex items-center gap-0.5 self-start rounded-full border border-[var(--busca-line)] p-0.5 sm:self-center">
                  {(['Manha', 'Tarde', 'Noite', 'Todos'] as const).map((opcao) => (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => onPeriodoChange(opcao)}
                      aria-pressed={(periodo ?? 'Todos') === opcao}
                      className={`rounded-full px-2.5 py-1 font-['Space_Mono'] text-[10px] font-bold uppercase tracking-wide transition ${FOCO} ${
                        (periodo ?? 'Todos') === opcao
                          ? 'bg-[var(--busca-ink)] text-[var(--busca-paper)]'
                          : 'text-[var(--busca-ink-soft)] hover:text-[var(--busca-ink)]'
                      }`}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Separador />

            <div className="py-1">
              <RotuloCampo>Vagas</RotuloCampo>
              <ContadorVagas vagas={vagas} onChange={onVagasChange} compacto />
            </div>

            <Separador />

            {chips}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <FontesBuscaBar />
      <form
        onSubmit={submeter}
        aria-label="Buscar carona"
        style={paleta}
        className="w-full rounded-3xl border border-[var(--busca-line)] bg-[var(--busca-paper)] p-4 font-['Archivo'] shadow-xl sm:p-5"
      >
        {/* Origem/destino: um único bloco preenchido (não dois separados),
            dividido por uma linha interna alinhada depois do ícone — o
            padrão "endereço agrupado" de Uber/99/BlaBlaCar. O botão de
            inverter fica sobre a linha divisória, ação real que também
            ajuda a comunicar que o campo é interativo. */}
        <div className="relative overflow-hidden rounded-2xl bg-[var(--busca-paper-sunken)]">
          <label htmlFor={idOrigem} className="flex items-center gap-3 py-3 pl-4 pr-14">
            <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-[var(--busca-ink)]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-[var(--busca-ink-soft)]">Origem</span>
              <input
                id={idOrigem}
                type="text"
                value={origem}
                onChange={(e) => onOrigemChange(e.target.value)}
                placeholder="De onde você sai?"
                className={`w-full truncate bg-transparent text-[15px] font-semibold text-[var(--busca-ink)] outline-none placeholder:font-normal placeholder:text-[var(--busca-ink-soft)] ${FOCO}`}
              />
            </span>
          </label>

          <div className="ml-[calc(1rem+1.25rem+0.75rem)] border-t border-[var(--busca-line)]" />

          <label htmlFor={idDestino} className="flex items-center gap-3 py-3 pl-4 pr-14">
            <span aria-hidden="true" className="grid h-5 w-5 shrink-0 place-items-center">
              <MapPin size={16} weight="fill" className="text-[var(--busca-ink)]" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-[var(--busca-ink-soft)]">Destino (opcional)</span>
              <input
                id={idDestino}
                type="text"
                value={destino}
                onChange={(e) => onDestinoChange(e.target.value)}
                placeholder="Para onde vai? Deixe em branco pra ver tudo"
                className={`w-full truncate bg-transparent text-[15px] font-semibold text-[var(--busca-ink)] outline-none placeholder:font-normal placeholder:text-[var(--busca-ink-soft)] ${FOCO}`}
              />
            </span>
          </label>

          <button
            type="button"
            onClick={inverterOrigemDestino}
            aria-label="Inverter origem e destino"
            className={`absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-[var(--busca-line)] bg-[var(--busca-paper)] text-[var(--busca-ink)] shadow-sm transition hover:border-[var(--busca-ink)] ${FOCO}`}
          >
            <ArrowsDownUp size={15} weight="bold" />
          </button>
        </div>

        {/* Quando (data + horário agrupados) e vagas — conceitos diferentes,
            por isso em blocos separados, cada um com seu próprio fundo
            preenchido. */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex divide-x divide-[var(--busca-line)] rounded-2xl bg-[var(--busca-paper-sunken)] sm:col-span-2">
            <label htmlFor={idData} className="flex flex-1 items-center gap-2 px-4 py-3">
              <CalendarBlank size={16} weight="bold" className="shrink-0 text-[var(--busca-ink-soft)]" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-[var(--busca-ink-soft)]">Data</span>
                <input
                  id={idData}
                  type="date"
                  value={data}
                  onChange={(e) => onDataChange(e.target.value)}
                  className={`w-full bg-transparent text-sm font-semibold text-[var(--busca-ink)] outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 ${FOCO}`}
                />
              </span>
            </label>

            {onHorarioChange && (
              <label htmlFor={idHorario} className="flex flex-1 items-center gap-2 px-4 py-3">
                <Clock size={16} weight="bold" className="shrink-0 text-[var(--busca-ink-soft)]" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold text-[var(--busca-ink-soft)]">Horário</span>
                  <input
                    id={idHorario}
                    type="time"
                    value={horario ?? ''}
                    onChange={(e) => onHorarioChange(e.target.value)}
                    className={`w-full bg-transparent text-sm font-semibold text-[var(--busca-ink)] outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 ${FOCO}`}
                  />
                </span>
              </label>
            )}
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[var(--busca-paper-sunken)] px-4 py-3">
            <span className="text-[11px] font-semibold text-[var(--busca-ink-soft)]">Vagas</span>
            <ContadorVagas vagas={vagas} onChange={onVagasChange} />
          </div>
        </div>

        {/* Preferências */}
        <div className="mt-4">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[var(--busca-ink-soft)]">
            Preferências (opcional)
          </span>
          {chips}
        </div>

        {/* Preto com letras e lupa brancas sempre — não muda de cor ao
            ficar pronto pra buscar — preto de verdade nos dois estados,
            sem opacidade reduzida. O que muda é o destaque: borda + halo
            brancos (sem introduzir uma cor nova na paleta neutra do app)
            e a lupinha pulsa (aumenta e diminui), como se já estivesse
            procurando — só depois que origem e destino têm conteúdo; até
            lá ela fica parada e o botão sem clique. */}
        <style>{`
          @media (prefers-reduced-motion: no-preference) {
            @keyframes cora-lupa-procurando {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.3); }
            }
          }
        `}</style>
        <button
          type="submit"
          disabled={!rotaPreenchida}
          className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--busca-accent)] bg-[var(--busca-accent)] py-3.5 text-sm font-extrabold text-white transition hover:bg-black disabled:cursor-not-allowed ${
            rotaPreenchida ? 'border-white shadow-[0_0_0_4px_rgba(255,255,255,0.35)]' : ''
          } ${FOCO}`}
        >
          <MagnifyingGlass size={18} weight="fill" className={rotaPreenchida ? 'animate-[cora-lupa-procurando_1.1s_ease-in-out_infinite]' : ''} />
          {textoBotao ?? 'Buscar caronas'}
        </button>
      </form>
    </>
  );
}

export default BuscaBar;
