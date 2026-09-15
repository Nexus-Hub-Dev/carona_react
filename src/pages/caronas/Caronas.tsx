import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Coins, Leaf } from '@phosphor-icons/react';
import { obterVeiculos } from '../../utils/veiculos';
import BuscaBar from '../../components/busca/BuscaBar';
import ResultadosCaronas, { type Periodo } from '../../components/caronas/ResultadosCaronas';
import { ModalOverlay } from '../../components/ui/ModalOverlay';

// Parâmetros que chegam da busca feita na Home (hero de busca) — a busca
// agora redireciona para cá e os resultados aparecem nesta mesma página.
interface ParametrosBusca {
  origem?: string;
  destino?: string;
  data?: string;
  periodo?: Periodo;
  vagas?: number;
  apenasMulheres?: boolean;
  pcd?: boolean;
  pet?: boolean;
}

export function Caronas() {
  const navigate = useNavigate();
  const location = useLocation();

  const parametrosBusca = (location.state as ParametrosBusca | null) ?? null;

  const [mostrarAlertaVeiculo, setMostrarAlertaVeiculo] = useState(false);

  // Campos de busca — pré-preenchidos quando a gente chega aqui vindo da
  // busca da Home (todos os parâmetros da viagem, não só origem/destino).
  const [pontoPartida, setPontoPartida] = useState(() => parametrosBusca?.origem ?? '');
  const [destinoFinal, setDestinoFinal] = useState(() => parametrosBusca?.destino ?? '');
  const [dataFiltro, setDataFiltro] = useState(() => parametrosBusca?.data ?? '');
  const [vagasFiltro, setVagasFiltro] = useState(() => parametrosBusca?.vagas ?? 1);
  const [periodo, setPeriodo] = useState<Periodo>(() => parametrosBusca?.periodo ?? 'Todos');
  const [filtroApenasMulheres, setFiltroApenasMulheres] = useState(() => Boolean(parametrosBusca?.apenasMulheres));
  const [filtroPcd, setFiltroPcd] = useState(() => Boolean(parametrosBusca?.pcd));
  const [filtroPet, setFiltroPet] = useState(() => Boolean(parametrosBusca?.pet));

  const handleCriarCarona = () => {
    if (obterVeiculos().length === 0) {
      setMostrarAlertaVeiculo(true);
      return;
    }
    navigate('/oferecer-carona');
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans pb-16">

      {/* Alerta de Veículo */}
      <ModalOverlay
        aberto={mostrarAlertaVeiculo}
        onFechar={() => setMostrarAlertaVeiculo(false)}
        labelledBy="veiculo-alerta-titulo"
        className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4"
      >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-100 text-2xl">🚗</div>
            <h2 id="veiculo-alerta-titulo" className="mt-4 text-xl font-black text-black">Adicione um veículo para continuar</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">Para oferecer uma carona, você precisa cadastrar pelo menos um carro.</p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Link to="/veiculos" state={{ from: '/oferecer-carona' }} onClick={() => setMostrarAlertaVeiculo(false)} className="rounded-xl bg-black px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-gray-800">Adicionar veículo</Link>
              <button type="button" onClick={() => setMostrarAlertaVeiculo(false)} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100">Agora não</button>
            </div>
          </div>
      </ModalOverlay>

      {/* Hero Section */}
      <section className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Você dirige?</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-black">Compartilhe seu trajeto e ajude a pagar os custos.</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">Tem um carro e vai fazer um caminho? Crie uma carona, divida as despesas e viaje com companhia.</p>
        </div>
        <button type="button" onClick={handleCriarCarona} className="shrink-0 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-gray-800">Criar uma carona</button>
      </section>

      {/* BARRA DE BUSCA / FILTROS — mesmo componente "bilhete de trajeto" da
          Home e da landing pública (variant="compacta"), recebe todos os
          parâmetros vindos da Home e também pode ser ajustada direto aqui,
          sem sair da página. */}
      <section className="max-w-6xl mx-auto pt-4 sm:pt-8 px-4">
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
          <BuscaBar
            variant="compacta"
            origem={pontoPartida}
            onOrigemChange={setPontoPartida}
            destino={destinoFinal}
            onDestinoChange={setDestinoFinal}
            data={dataFiltro}
            onDataChange={setDataFiltro}
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            vagas={vagasFiltro}
            onVagasChange={setVagasFiltro}
            apenasMulheres={filtroApenasMulheres}
            onApenasMulheresChange={setFiltroApenasMulheres}
            pcd={filtroPcd}
            onPcdChange={setFiltroPcd}
            pet={filtroPet}
            onPetChange={setFiltroPet}
          />
        </div>
      </section>

      {/* LISTA DE CARONAS — os resultados aparecem aqui mesmo, na mesma
          página da busca, sem navegação extra. */}
      <section className="max-w-6xl mx-auto mt-6 sm:mt-8 px-4">
        <ResultadosCaronas
          origem={pontoPartida}
          destino={destinoFinal}
          data={dataFiltro}
          periodo={periodo}
          vagas={vagasFiltro}
          apenasMulheres={filtroApenasMulheres}
          pcd={filtroPcd}
          pet={filtroPet}
        />
      </section>

      {/* SEÇÃO INFORMATIVA (Inalterada) */}
      <section className="max-w-6xl mx-auto mt-12 sm:mt-20 px-4">
        {/* ... conteúdo informativo original mantido sem alterações ... */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">Por que viajar de CORA?</h2>
          <p className="text-xs text-gray-600 mt-1">Mobilidade inteligente que reduz custos e emissões com máxima segurança.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-surface-alt p-5 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center text-black mb-4 sm:mb-6">
                <Coins size={20} weight="bold" />
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Até 70% de Economia</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Compartilhe os gastos reais de combustível e pedágio sem tarifas surpresas.</p>
            </div>
          </div>
          {/* Outros cards da seção mantidos */}
          <div className="bg-surface-alt p-5 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-women/10 flex items-center justify-center text-women mb-4 sm:mb-6 font-bold">
                👩
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Inclusão & Segurança</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Filtros exclusivos para viagens só entre mulheres e veículos adaptados para PCDs.</p>
            </div>
          </div>
          <div className="bg-surface-alt p-5 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-border flex items-center justify-center text-black mb-4 sm:mb-6">
                <Leaf size={20} weight="bold" />
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Impacto Verde Real</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Otimização de assentos vagos nas capitais, reduzindo a emissão de CO2.</p>
            </div>
          </div>
          <div className="bg-surface-alt p-5 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 sm:mb-6 font-bold">
                ✓
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Comunidade Verificada</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Perfis autênticos com avaliação mútua e validação de documentos para sua tranquilidade.</p>
            </div>
          </div>
          <div className="bg-surface-alt p-5 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-4 sm:mb-6 font-bold">
                ⏱
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Flexibilidade de Horários</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Centenas de horários ao longo do dia combinando com sua rotina de trabalho ou estudos.</p>
            </div>
          </div>
          <div className="bg-surface-alt p-5 sm:p-8 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4 sm:mb-6 font-bold">
                🛣
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Menos Trânsito Urbano</h3>
              <p className="text-xs text-gray-600 leading-relaxed">Cada carona reduz a quantidade de carros em circulação, deixando o trânsito mais fluido.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
