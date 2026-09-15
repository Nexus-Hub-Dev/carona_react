import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CaretDown,
  Car,
  Coins,
  GenderFemale,
  Handshake,
  Leaf,
  MagnifyingGlass,
  PawPrint,
  ShieldCheck,
  Star,
  Wheelchair,
} from '@phosphor-icons/react';

/*
 * LandingPage — página pública (visitante não autenticado), rota "/".
 *
 * Paleta: só preto, branco e cinza-claro — os mesmos tokens globais do
 * resto do app (bg/surface/surface-alt/border/ink/muted). Sem cor de
 * acento nenhuma aqui.
 *
 * Técnicas de UX aplicadas: alternância Passageiro/Motorista no hero
 * (padrão real de Uber/Lyft), prévia da própria interface no lugar de
 * foto de banco de imagens (com um carrossel trocando o exemplo a
 * cada 7s, pra mostrar variedade de trajetos/pessoas fictícias em vez
 * de um único card estático), barra de confiança e FAQ em acordeão
 * respondendo objeções reais antes do CTA final.
 */

type Modo = 'passageiro' | 'motorista';

const INTERVALO_CARROSSEL_MS = 7000;

interface ExemploPassageiro {
  nome: string;
  foto: string;
  rating: string;
  tag: { label: string; classe: string };
  horarioSaida: string;
  horarioChegada: string;
  origem: string;
  destino: string;
  preco: string;
}

interface ExemploMotorista {
  veiculo: string;
  placa: string;
  origem: string;
  destino: string;
  preco: string;
}

// Nomes e trajetos fictícios só pra ilustrar a interface — não são
// dados reais de ninguém.
const EXEMPLOS_PASSAGEIRO: ExemploPassageiro[] = [
  {
    nome: 'Camila Duarte',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: '4.9',
    tag: { label: 'Exclusivo mulheres', classe: 'bg-women' },
    horarioSaida: '09:00',
    horarioChegada: '09:40',
    origem: 'Av. Paulista, 900',
    destino: 'Faria Lima, 2777',
    preco: 'R$ 24,30',
  },
  {
    nome: 'Rafael Souza',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: '4.8',
    tag: { label: 'Aceita pet', classe: 'bg-pet' },
    horarioSaida: '07:15',
    horarioChegada: '07:50',
    origem: 'Rua Palestra Itália, 200',
    destino: 'Shopping Aricanduva',
    preco: 'R$ 18,90',
  },
  {
    nome: 'Juliana Alves',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: '5.0',
    tag: { label: 'PCD (conceitual)', classe: 'bg-pcd' },
    horarioSaida: '18:30',
    horarioChegada: '19:10',
    origem: 'Estação Pinheiros',
    destino: 'Metrô Vila Mariana',
    preco: 'R$ 15,50',
  },
];

const EXEMPLOS_MOTORISTA: ExemploMotorista[] = [
  { veiculo: 'Nissan Kicks · Prata', placa: 'ABC1D23', origem: 'Av. Paulista, 900', destino: 'Faria Lima, 2777', preco: 'R$ 24,30' },
  { veiculo: 'Renault Kwid · Vermelho', placa: 'QVR9121', origem: 'Rua Palestra Itália, 200', destino: 'Shopping Aricanduva', preco: 'R$ 18,90' },
  { veiculo: 'Honda Civic · Prata', placa: 'FSX8K52', origem: 'Estação Pinheiros', destino: 'Metrô Vila Mariana', preco: 'R$ 15,50' },
];

const CONTEUDO_POR_MODO: Record<Modo, { eyebrow: string; titulo: string; texto: string; botao: string }> = {
  passageiro: {
    eyebrow: 'Para quem procura carona',
    titulo: 'Ache uma carona pro seu trajeto de todo dia.',
    texto: 'Compare preço e horário, veja quem vai dirigir e filtre por segurança e acessibilidade antes de sair de casa.',
    botao: 'Criar conta e buscar caronas',
  },
  motorista: {
    eyebrow: 'Para quem já roda esse caminho',
    titulo: 'Transforme o trajeto que você já faz em renda extra.',
    texto: 'Publique sua rota, defina o valor por assento e você decide quem embarca — a vaga só é confirmada quando você aceita.',
    botao: 'Criar conta e oferecer carona',
  },
};

function EstrelasPreview() {
  return (
    <span className="inline-flex items-center gap-0.5 text-ink">
      {Array.from({ length: 5 }).map((_, indice) => (
        <Star key={indice} size={11} weight="fill" />
      ))}
    </span>
  );
}

// Largura fixa, altura natural — antes travava também a altura
// (h-360px) pra evitar o card "pulando" de tamanho entre os exemplos
// do carrossel, mas isso sobrava espaço morto no meio quando o
// conteúdo não preenchia tudo. Como o texto variável já trunca numa
// linha só e a estrutura é idêntica entre os exemplos de um mesmo
// modo, a altura natural já sai igualzinha sozinha — sem precisar
// fixar em pixels nem sobrar vão vazio.
const TAMANHO_CARTAO = 'relative flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-xl';

// Faixa colorida ocupando toda a largura do topo do card — margens
// negativas cancelam o padding do card pra ela encostar nas duas
// laterais e na borda de cima, e o arredondado só em cima acompanha o
// contorno do card. Por estar no fluxo normal (não é absolute), ela
// empurra o resto do conteúdo pra baixo sozinha, sem cálculo manual
// de espaço.
function FaixaTopo({ tag }: { tag: { label: string; classe: string } }) {
  return (
    <div className={`-mx-6 -mt-6 flex h-10 items-center justify-center rounded-t-2xl px-3 text-center text-xs font-bold uppercase tracking-wide text-white ${tag.classe}`}>
      <span className="truncate">{tag.label}</span>
    </div>
  );
}

// Linha do trajeto com ponto vazado (embarque) → linha tracejada →
// ponto cheio (desembarque) — mesma técnica já usada no BuscaBar, em
// vez de duas linhas de texto soltas sem nenhuma estrutura visual.
function LinhaTrajeto({ partida, chegada }: { partida: ReactNode; chegada: ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
        <span className="h-2 w-2 shrink-0 rounded-full border-2 border-ink" />
        <span className="my-1 w-px flex-1 border-l border-dashed border-border" style={{ minHeight: '1.5rem' }} />
        <span className="h-2 w-2 shrink-0 rounded-full bg-ink" />
      </div>
      <div className="min-w-0 flex-1 space-y-3 text-sm">
        {partida}
        {chegada}
      </div>
    </div>
  );
}

function LinhaPreco({ label, preco }: { label: string; preco: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-soft p-4">
      <span className="text-xs font-bold text-ink/70">{label}</span>
      <span className="shrink-0 text-xl font-black text-ink">{preco}</span>
    </div>
  );
}

function CartaoPassageiro({ exemplo }: { exemplo: ExemploPassageiro }) {
  return (
    <div className={`${TAMANHO_CARTAO} overflow-hidden`}>
      <FaixaTopo tag={exemplo.tag} />
      <div className="flex items-center gap-3">
        <img src={exemplo.foto} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink">{exemplo.nome}</p>
          <p className="flex items-center gap-1 text-xs text-muted"><EstrelasPreview /> {exemplo.rating}</p>
        </div>
      </div>
      <LinhaTrajeto
        partida={<p className="truncate text-ink"><span className="font-bold">{exemplo.horarioSaida}</span> · {exemplo.origem}</p>}
        chegada={<p className="truncate text-ink"><span className="font-bold">{exemplo.horarioChegada}</span> · {exemplo.destino}</p>}
      />
      <LinhaPreco label="Preço por assento" preco={exemplo.preco} />
      <span className="flex h-12 w-full items-center justify-center rounded-xl bg-ink text-sm font-bold text-white">
        Solicitar carona
      </span>
    </div>
  );
}

function CartaoMotorista({ exemplo }: { exemplo: ExemploMotorista }) {
  return (
    <div className={TAMANHO_CARTAO}>
      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">Nova carona</p>
        <div className="flex items-center gap-3 rounded-xl bg-surface-soft p-3.5">
          <Car size={24} weight="fill" className="shrink-0 text-ink" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">{exemplo.veiculo}</p>
            <p className="truncate text-xs text-muted">4 lugares · placa {exemplo.placa}</p>
          </div>
        </div>
      </div>
      <LinhaTrajeto
        partida={<p className="truncate text-ink"><span className="font-bold">De</span> {exemplo.origem}</p>}
        chegada={<p className="truncate text-ink"><span className="font-bold">Para</span> {exemplo.destino}</p>}
      />
      <LinhaPreco label="Valor sugerido por assento" preco={exemplo.preco} />
      <span className="flex h-12 w-full items-center justify-center rounded-xl bg-ink text-sm font-bold text-white">
        Publicar carona
      </span>
    </div>
  );
}

// Carrossel: troca o exemplo mostrado a cada 7s. O componente é
// remontado com key={modo} pelo pai — assim o índice reinicia sozinho
// ao trocar entre passageiro/motorista, sem precisar resetar estado
// manualmente dentro do efeito. Os pontinhos embaixo também deixam
// claro que há mais exemplos além do que está na tela.
function CarrosselPrevia({ modo }: { modo: Modo }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = modo === 'passageiro' ? EXEMPLOS_PASSAGEIRO.length : EXEMPLOS_MOTORISTA.length;

  useEffect(() => {
    // Sem avanço automático com o mouse em cima, com foco dentro do
    // carrossel, ou quando a pessoa pediu menos movimento no sistema —
    // antes ele trocava de exemplo sozinho o tempo todo, sem jeito de
    // parar pra ler ou de navegar pelos pontinhos com calma.
    if (pausado) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intervalo = setInterval(() => {
      setIndice((atual) => (atual + 1) % total);
    }, INTERVALO_CARROSSEL_MS);
    return () => clearInterval(intervalo);
  }, [total, pausado]);

  return (
    <div
      className="flex flex-col items-center gap-3"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div key={`${modo}-${indice}`} className="motion-safe:animate-[cora-fade-in_0.4s_ease]">
        {modo === 'passageiro' ? (
          <CartaoPassageiro exemplo={EXEMPLOS_PASSAGEIRO[indice]} />
        ) : (
          <CartaoMotorista exemplo={EXEMPLOS_MOTORISTA[indice]} />
        )}
      </div>

      {/* Área de toque de cada pontinho é bem maior que o ponto visível
          (min-h-8 min-w-8 ≈ 32px) — o desenho continua discreto, mas no
          celular vira um alvo de toque de verdade em vez de um pixel
          quase impossível de acertar com o dedo. */}
      <div className="flex items-center" role="tablist" aria-label="Exemplos de carona">
        {Array.from({ length: total }).map((_, posicao) => (
          <button
            key={posicao}
            type="button"
            role="tab"
            aria-selected={posicao === indice}
            aria-label={`Ver exemplo ${posicao + 1}`}
            onClick={() => setIndice(posicao)}
            className="grid min-h-8 min-w-8 place-items-center"
          >
            <span className={`block h-1.5 rounded-full transition-all ${posicao === indice ? 'w-6 bg-ink' : 'w-1.5 bg-border'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ pergunta, children }: { pergunta: string; children: ReactNode }) {
  return (
    <details className="group rounded-xl border border-border bg-white px-4 py-3.5 sm:px-5 sm:py-4 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-ink">
        <span className="min-w-0">{pergunta}</span>
        <CaretDown size={16} weight="bold" className="shrink-0 text-muted transition group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted">{children}</p>
    </details>
  );
}

function LandingPage() {
  const [modo, setModo] = useState<Modo>('passageiro');
  const conteudo = CONTEUDO_POR_MODO[modo];

  return (
    <div className="bg-bg">
      {/* CABEÇALHO — preto, igual à navbar autenticada, pra landing e área
          logada terem a mesma identidade de topo. A logo (mesmo arquivo
          de lá) volta a usar sua cor natural, branca — sem o filtro
          brightness-0 que era só um jeito de fazer ela aparecer no
          cabeçalho claro anterior. Botões seguem o mesmo par já usado na
          navbar autenticada num fundo preto: sólido branco pra ação
          principal, contorno claro pra secundária — nunca preto sobre
          preto. */}
      <header className="border-b border-white/10 bg-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <img
            src="https://ik.imagekit.io/beakrg2dk/PI3/navbar.png?tr=f-webp"
            alt="CORA"
            className="h-10 w-auto shrink-0 object-contain sm:h-12"
          />
          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Conta">
            <Link
              to="/login"
              className="rounded-lg border border-white/25 px-3 py-2 text-xs font-bold text-white no-underline transition hover:border-white/50 hover:bg-white/10 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              Entrar
            </Link>
            <Link to="/cadastro" className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-black no-underline transition hover:bg-gray-200 sm:px-5 sm:py-2.5 sm:text-sm">
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO — alterna Passageiro/Motorista, como Uber/Lyft fazem na própria home */}
      <section className="flex justify-center pt-8 pb-8 sm:pt-14 sm:pb-14 md:pt-20 md:pb-20">
        <div className="grid w-full max-w-7xl grid-cols-1 items-center gap-6 px-4 sm:gap-8 sm:px-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Rótulo curto ("Passageiro"/"Motorista") em vez da frase
                inteira — a frase quebrava linha dentro do próprio botão
                no celular e ficava com cara de erro. Uma palavra só
                nunca quebra, então nem precisa mais dividir o espaço
                via flex-1: já cabe no tamanho do próprio texto em
                qualquer largura. */}
            <div className="inline-flex w-fit items-center gap-1 rounded-full border border-border bg-white p-1">
              {(['passageiro', 'motorista'] as const).map((opcao) => (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => setModo(opcao)}
                  aria-pressed={modo === opcao}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition sm:px-4 sm:py-2 sm:text-sm ${
                    modo === opcao ? 'bg-ink text-white' : 'text-muted hover:text-ink'
                  }`}
                >
                  {opcao === 'passageiro' ? 'Passageiro' : 'Motorista'}
                </button>
              ))}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted sm:text-xs">{conteudo.eyebrow}</p>
              <h1 className="mt-2 text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl sm:leading-[1.05] md:text-5xl">{conteudo.titulo}</h1>
              <p className="mt-3 max-w-md text-sm text-muted sm:mt-4 sm:text-lg">{conteudo.texto}</p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <Link
                to="/cadastro"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-center text-sm font-bold leading-snug text-white no-underline transition hover:bg-black sm:px-7 sm:text-base"
              >
                {conteudo.botao}
                <ArrowRight size={18} weight="bold" className="shrink-0" />
              </Link>
              <p className="text-xs text-muted sm:text-sm">
                Já tem conta? <Link to="/login" className="font-bold text-ink underline underline-offset-4">Entrar</Link>
              </p>
            </div>
          </div>

          {/* Escondido no celular: o card ilustrativo é conteúdo de apoio,
              não essencial pra decidir o próximo passo, e empilhado
              abaixo do texto ele só alongava a rolagem antes do CTA.
              Some junto com o grid virando 2 colunas (md), que é
              justamente quando ele passa a ter espaço próprio do lado. */}
          <div className="hidden md:flex md:justify-end">
            <CarrosselPrevia key={modo} modo={modo} />
          </div>
        </div>
      </section>

      {/* BARRA DE CONFIANÇA — era o ponto mais pesado da versão mobile:
          3 linhas centralizadas, em negrito, com ícone grande e bastante
          espaço entre elas. Agora no celular vira 3 linhas compactas,
          alinhadas à esquerda, com peso visual mais leve (texto menor e
          semi-bold em cinza, não preto) — o ícone continua marcando cada
          item sem competir com o resto da página. A partir de sm volta
          exatamente ao layout anterior (linha única, justify-between,
          negrito). */}
      <section className="border-y border-border bg-white py-3 sm:py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-2 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-3 sm:px-6">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted sm:gap-2 sm:text-sm sm:font-bold sm:text-ink">
            <ShieldCheck size={16} weight="fill" className="shrink-0 text-ink" /> Motorista aprova cada solicitação
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted sm:gap-2 sm:text-sm sm:font-bold sm:text-ink">
            <Star size={16} weight="fill" className="shrink-0 text-ink" /> Avaliação mútua entre motorista e passageiro/a
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted sm:gap-2 sm:text-sm sm:font-bold sm:text-ink">
            <Coins size={16} weight="fill" className="shrink-0 text-ink" /> Você combina o valor por assento
          </span>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="bg-surface-alt py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Nossos filtros</h2>
            <p className="mt-2 text-sm text-muted sm:text-base">Viagens com segurança e acessibilidade</p>
          </div>

          <div className="grid grid-cols-1 gap-6 pt-5 sm:gap-8 md:grid-cols-3">
            {/* Selo flutua sobrepondo a borda de cima do card (metade
                dentro, metade fora, com sombra própria) — por isso cada
                card ganhou pt-5 extra no grid acima, pra sobrar espaço
                pro selo sem colidir com o título. */}
            <div className="relative flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 pt-6 shadow-sm sm:p-8">
              <div className="absolute -top-4 inset-x-0 flex justify-center px-4">
                <span className="flex items-center gap-2 rounded-full bg-women px-3 py-1.5 text-xs font-bold text-white shadow-md sm:text-sm">
                  <GenderFemale size={18} weight="fill" className="shrink-0" />
                  <span className="min-w-0 truncate">Exclusivo mulheres</span>
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">Rede de apoio feminina</h3>
              <p className="text-sm leading-relaxed text-muted">
                Disponível quando a motorista também se identifica como mulher, conectando exclusivamente motoristas e
                passageiras mulheres.
              </p>
            </div>

            <div className="relative flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 pt-6 shadow-sm sm:p-8">
              <div className="absolute -top-4 inset-x-0 flex justify-center px-4">
                <span className="flex items-center gap-2 rounded-full bg-pcd px-3 py-1.5 text-xs font-bold text-white shadow-md sm:text-sm">
                  <Wheelchair size={18} weight="fill" className="shrink-0" />
                  <span className="min-w-0 truncate">PCD (conceitual)</span>
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">Sinalização de acessibilidade</h3>
              <p className="text-sm leading-relaxed text-muted">
                O motorista sinaliza intenção de acessibilidade — não é uma verificação técnica do veículo, vale sempre
                confirmar os detalhes na conversa.
              </p>
            </div>

            <div className="relative flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 pt-6 shadow-sm sm:p-8">
              <div className="absolute -top-4 inset-x-0 flex justify-center px-4">
                <span className="flex items-center gap-2 rounded-full bg-pet px-3 py-1.5 text-xs font-bold text-white shadow-md sm:text-sm">
                  <PawPrint size={18} weight="fill" className="shrink-0" />
                  <span className="min-w-0 truncate">Aceita pet</span>
                </span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">Viaje com seu companheiro</h3>
              <p className="text-sm leading-relaxed text-muted">
                Filtre motoristas que topam levar o seu animal de estimação, sem combinar isso na última hora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Como funciona</h2>
            <p className="mt-2 text-sm text-muted sm:text-base">Da conta à carona em três passos</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {[
              { numero: '1', titulo: 'Crie sua conta', texto: 'Cadastro rápido com os dados que constroem confiança entre motoristas e passageiros.' },
              { numero: '2', titulo: 'Busque ou publique uma rota', texto: 'Procure por origem, destino, data e horário — ou ofereça sua própria viagem em poucos minutos.' },
              { numero: '3', titulo: 'Aguarde a confirmação', texto: 'O motorista aprova sua solicitação antes da vaga virar carona de verdade.' },
            ].map((passo) => (
              <div key={passo.numero} className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                  {passo.numero}
                </span>
                <h3 className="text-lg font-bold text-ink">{passo.titulo}</h3>
                <p className="text-sm text-muted">{passo.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VANTAGENS — mesmo título já usado nesta seção na Home logada
          (Home.tsx), pra manter a mesma identidade entre as duas telas
          em vez de inventar um texto novo aqui. */}
      <section className="bg-surface-alt py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Por que escolher o Cora</h2>
            <p className="mt-2 text-sm text-muted sm:text-base">Mobilidade construída sobre confiança</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <Handshake size={32} weight="fill" className="text-ink" />
              <h3 className="text-lg font-bold text-ink">Comunidade Cora</h3>
              <p className="text-sm text-muted">Passageiros e motoristas compartilhando trajetos diários com respeito e pontualidade.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <Coins size={32} weight="fill" className="text-ink" />
              <h3 className="text-lg font-bold text-ink">Economia garantida</h3>
              <p className="text-sm text-muted">Divida apenas os custos de combustível e pedágio, sem tarifa surpresa.</p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <Leaf size={32} weight="fill" className="text-ink" />
              <h3 className="text-lg font-bold text-ink">Menor impacto ambiental</h3>
              <p className="text-sm text-muted">Assentos vazios preenchidos tiram veículos de circulação e reduzem emissões.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — responde objeções reais antes de pedir o cadastro */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">Perguntas frequentes</h2>
            <p className="mt-2 text-sm text-muted sm:text-base">Antes de criar sua conta</p>
          </div>

          <div className="flex flex-col gap-3">
            <FaqItem pergunta="Preciso ter carro para usar o CORA?">
              Não. Você pode usar o app só para buscar caronas como passageiro/a. Cadastre um veículo quando quiser
              também oferecer viagens.
            </FaqItem>
            <FaqItem pergunta="Como funciona a aprovação da carona?">
              Ao solicitar uma vaga, o pedido fica pendente até o motorista aceitar. A reserva só é confirmada depois
              dessa aprovação — nunca automaticamente.
            </FaqItem>
            <FaqItem pergunta="O filtro 'Exclusivo mulheres' é seguro?">
              Ele só fica disponível para a motorista ativar quando ela também se identifica como mulher, então a rede
              fica fechada dos dois lados: motorista e passageiras mulheres.
            </FaqItem>
            <FaqItem pergunta="Posso cancelar uma solicitação já enviada?">
              Sim, enquanto ela estiver pendente. É só abrir a tela de acompanhamento das suas solicitações e cancelar.
            </FaqItem>
          </div>
        </div>
      </section>

      {/* CTA FINAL — preto puro, emenda sem costura com o rodapé global */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-black p-6 text-center text-white sm:gap-8 sm:p-10 md:flex-row md:p-14 md:text-left">
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Pronto para ir mais longe?</h2>
              <p className="mt-3 text-sm text-gray-400 sm:text-base">Crie sua conta gratuita e comece a compartilhar caminhos hoje mesmo.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link to="/cadastro" className="flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-center font-bold text-black no-underline transition hover:bg-gray-200">
                <MagnifyingGlass size={16} weight="bold" />
                Criar minha conta
              </Link>
              <Link to="/login" className="rounded-lg border border-gray-700 px-6 py-3 text-center font-bold text-white no-underline transition hover:bg-gray-800">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
