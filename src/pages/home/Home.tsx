import { useContext, useRef, useState } from 'react';
import { Plus, ChatCircleText, Car, ArrowRight, UserCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import BuscaBar from '../../components/busca/BuscaBar';
import ResultadosCaronas, { type Periodo } from '../../components/caronas/ResultadosCaronas';
import { AuthContext } from '../../contexts/AuthContext';

// Data local de hoje em yyyy-mm-dd (o formato que o <input type="date">
// espera). Não dá pra usar toISOString().slice(0,10) direto — isso lê o
// dia em UTC, que pode ser "ontem" ou "amanhã" dependendo da hora e do
// fuso de quem está usando.
function hojeISO(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function periodoDoHorario(horario: string): Periodo {
  if (!horario) return 'Todos';
  const hora = Number(horario.split(':')[0] ?? 0);
  if (hora < 12) return 'Manha';
  if (hora < 18) return 'Tarde';
  return 'Noite';
}

// Saudação por horário do dia — troca o selo genérico "Viagens disponíveis
// hoje" (que não muda nunca) por algo que reage ao momento real do usuário.
function saudacaoPeriodo(hora: number): string {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function Home() {
  const { usuario } = useContext(AuthContext);
  const primeiroNome = usuario.nome?.trim().split(' ')[0] || '';
  const saudacao = saudacaoPeriodo(new Date().getHours());

  // A busca da Home agora é funcional de verdade e os resultados aparecem
  // logo abaixo, na própria página — nada de redirecionar pra outra tela
  // só pra ver as caronas encontradas.
  const [origem, setOrigem] = useState('São Paulo, SP');
  const [destino, setDestino] = useState('');
  const [data, setData] = useState(() => hojeISO());
  const [horario, setHorario] = useState('');
  const [vagas, setVagas] = useState(1);
  const [apenasMulheres, setApenasMulheres] = useState(false);
  const [pcd, setPcd] = useState(false);
  const [pet, setPet] = useState(false);

  // Já começa mostrando os resultados (com os filtros padrão) em vez de
  // esperar um clique em "Buscar caronas" — assim já aparecem as caronas
  // cadastradas assim que a página abre.
  const [buscou, setBuscou] = useState(true);
  const resultadosRef = useRef<HTMLDivElement>(null);

  function buscarViagem() {
    setBuscou(true);
    // Os resultados entram embaixo dos cards, fora da primeira tela — sem
    // rolar até lá, quem já está com a tela cheia (celular, notebook
    // menor) pode nem perceber que a busca aconteceu.
    requestAnimationFrame(() => {
      const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      resultadosRef.current?.scrollIntoView({ behavior: reduzirMovimento ? 'auto' : 'smooth', block: 'start' });
    });
  }

  return (
    <div className="flex justify-center bg-bg pt-16 pb-16 md:pt-24 md:pb-24">
      <div className="container mx-auto flex flex-col gap-10 px-6 max-w-7xl">

        {/* Saudação + título — um único bloco, sempre à esquerda e sem
            dividir espaço com outro elemento ao lado (o texto não fica
            mais espremido numa coluna de grid, o que forçava a quebra
            manual de linha do título). */}
        <div className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold w-fit border border-border">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            {saudacao}{primeiroNome ? `, ${primeiroNome}` : ''}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black">
            Para onde vamos hoje?
          </h1>

          <p className="max-w-xl text-lg text-gray-600">
            Preencha o trajeto abaixo e veja na hora quem está indo pro mesmo caminho que você.
          </p>
        </div>

        {/* Busca e painel de atalhos lado a lado, alinhados pelo topo. */}
        {/* items-stretch (padrão do grid) faz os dois cards terem a
            mesma altura, o mais alto define o tamanho do outro. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch">
          <BuscaBar
            variant="hero"
            origem={origem}
            onOrigemChange={setOrigem}
            destino={destino}
            onDestinoChange={setDestino}
            data={data}
            onDataChange={setData}
            horario={horario}
            onHorarioChange={setHorario}
            vagas={vagas}
            onVagasChange={setVagas}
            apenasMulheres={apenasMulheres}
            onApenasMulheresChange={setApenasMulheres}
            pcd={pcd}
            onPcdChange={setPcd}
            pet={pet}
            onPetChange={setPet}
            onSubmit={buscarViagem}
          />

          {/* Painel de atalhos — no lugar da ilustração de banco de imagens
              (estática e sem relação com quem já está logado), mostra o
              próprio usuário e os próximos passos mais prováveis depois
              da busca: oferecer uma carona, ver solicitações em
              andamento ou gerenciar veículos. */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-alt text-ink">
                {usuario.foto ? (
                  <img src={usuario.foto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle size={32} weight="fill" />
                )}
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">Bem-vindo(a) de volta</p>
                <p className="text-lg font-bold text-ink">{usuario.nome || 'Viajante Cora'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link to="/oferecer-carona" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 no-underline transition hover:border-ink hover:bg-surface-alt">
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-white"><Plus size={18} weight="bold" /></span>
                  <span>
                    <span className="block text-sm font-bold text-ink">Oferecer carona</span>
                    <span className="block text-xs text-muted">Cadastre uma rota e divida os custos</span>
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-muted" />
              </Link>

              <Link to="/historico-caronas" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 no-underline transition hover:border-ink hover:bg-surface-alt">
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-alt text-ink"><ChatCircleText size={18} weight="bold" /></span>
                  <span>
                    <span className="block text-sm font-bold text-ink">Minhas solicitações</span>
                    <span className="block text-xs text-muted">Acompanhe pedidos e conversas</span>
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-muted" />
              </Link>

              <Link to="/veiculos" className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 no-underline transition hover:border-ink hover:bg-surface-alt">
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-alt text-ink"><Car size={18} weight="bold" /></span>
                  <span>
                    <span className="block text-sm font-bold text-ink">Meus veículos</span>
                    <span className="block text-xs text-muted">Gerencie os carros cadastrados</span>
                  </span>
                </span>
                <ArrowRight size={18} className="shrink-0 text-muted" />
              </Link>
            </div>
          </div>
        </div>

        {/* Resultados da busca — aparecem aqui mesmo assim que "Buscar
            caronas" é clicado, filtrados ao vivo pelos campos preenchidos
            acima, sem sair da Home. */}
        {buscou && (
          <div ref={resultadosRef} className="scroll-mt-6">
            <ResultadosCaronas
              origem={origem}
              destino={destino}
              data={data}
              periodo={periodoDoHorario(horario)}
              vagas={vagas}
              apenasMulheres={apenasMulheres}
              pcd={pcd}
              pet={pet}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
