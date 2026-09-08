import { useState } from 'react';
import { ToastAlerta } from '../../utils/ToastAlerta';

// Interface compatível com o Schema da API e com suporte aos dados visuais do front
interface ViagemVisual {
  id: number;
  motoristaNome: string;
  motoristaFoto: string;
  avaliacao: number;
  totalCaronas: number;
  badge: string;
  veiculoModelo: string;
  veiculoPlaca: string;
  origem: string;
  bairroOrigem?: string;
  destino: string;
  bairroDestino?: string;
  horarioSaida: string;
  horarioChegada: string;
  distanciaKm: number;
  tempoMinutos: number;
  velocidadeMedia: number;
  statusTransito?: string;
  preco: number;
  vagasDisponiveis: number;
  apenasMulheres?: boolean;
  acessivelPcd?: boolean;
  // Campos prontos para integração com o Back-end
  partida?: string;
  data?: string;
  tempoEstimadoMin?: number;
  valorKm?: number;
  latitudePartida?: number;
  longitudePartida?: number;
  latitudeDestino?: number;
  longitudeDestino?: number;
}

const INITIAL_VIAGENS: ViagemVisual[] = [
  {
    id: 1,
    motoristaNome: 'Paula Diniz',
    motoristaFoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avaliacao: 4.96,
    totalCaronas: 142,
    badge: 'Super Condutora',
    veiculoModelo: 'Nissan Kicks Azul',
    veiculoPlaca: 'BRA2E19',
    origem: 'Avenida Paulista, 900',
    bairroOrigem: 'Bela Vista (Em frente à Gazeta)',
    destino: 'Av. Brigadeiro Faria Lima, 2777',
    bairroDestino: 'Itaim Bibi (Próximo ao Shopping Iguatemi)',
    horarioSaida: '09:00',
    horarioChegada: '09:40',
    distanciaKm: 5.5,
    tempoMinutos: 40,
    velocidadeMedia: 30,
    statusTransito: 'Trânsito leve',
    preco: 20.86,
    vagasDisponiveis: 3,
    apenasMulheres: true,
    acessivelPcd: true,
  },
  {
    id: 2,
    motoristaNome: 'Carlos Mendes',
    motoristaFoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avaliacao: 4.88,
    totalCaronas: 80,
    badge: 'Motorista Diário',
    veiculoModelo: 'Renault Kwid Vermelho',
    veiculoPlaca: 'QVR9I21',
    origem: 'Rua Palestra Itália, 200',
    bairroOrigem: 'Perdizes (Próximo ao Allianz Parque)',
    destino: 'Shopping Aricanduva',
    bairroDestino: 'Av. Aricanduva, 5555 - Zona Leste',
    horarioSaida: '11:00',
    horarioChegada: '11:55',
    distanciaKm: 23,
    tempoMinutos: 55,
    velocidadeMedia: 60,
    statusTransito: 'Marginal Tietê',
    preco: 52.98,
    vagasDisponiveis: 2,
    apenasMulheres: false,
    acessivelPcd: true,
  },
  {
    id: 3,
    motoristaNome: 'Rodrigo Tavares',
    motoristaFoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    avaliacao: 5.0,
    totalCaronas: 47,
    badge: 'Pontual',
    veiculoModelo: 'Honda Civic Prata',
    veiculoPlaca: 'FSX8K52',
    origem: 'Estação Pinheiros - Linha 4',
    bairroOrigem: 'Rua Capri (Terminal Intermodal)',
    destino: 'Metrô Vila Mariana',
    bairroDestino: 'Rua Domingos de Morais, 2100',
    horarioSaida: '14:30',
    horarioChegada: '15:05',
    distanciaKm: 8.1,
    tempoMinutos: 35,
    velocidadeMedia: 32,
    statusTransito: 'Trânsito normal',
    preco: 18.50,
    vagasDisponiveis: 1,
    apenasMulheres: false,
    acessivelPcd: false,
  },
];

export function Caronas() {
  const [viagens, setViagens] = useState<ViagemVisual[]>(INITIAL_VIAGENS);
  const [pontoPartida, setPontoPartida] = useState('');
  const [destinoFinal, setDestinoFinal] = useState('');
  const [periodo, setPeriodo] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Todos'>('Todos');
  const [filtroApenasMulheres, setFiltroApenasMulheres] = useState(false);
  const [filtroPcd, setFiltroPcd] = useState(false);

  const handleReservar = (id: number) => {
    setViagens((prevViagens) =>
      prevViagens
        .map((v) => {
          if (v.id === id) {
            return { ...v, vagasDisponiveis: v.vagasDisponiveis - 1 };
          }
          return v;
        })
        .filter((v) => v.vagasDisponiveis > 0)
    );

    ToastAlerta(`Reserva realizada para a carona #${id}!`, 'sucesso');
  };

  const viagensFiltradas = viagens.filter((viagem) => {
    const atendePartida =
      viagem.origem.toLowerCase().includes(pontoPartida.toLowerCase()) ||
      (viagem.bairroOrigem && viagem.bairroOrigem.toLowerCase().includes(pontoPartida.toLowerCase()));

    const atendeDestino =
      viagem.destino.toLowerCase().includes(destinoFinal.toLowerCase()) ||
      (viagem.bairroDestino && viagem.bairroDestino.toLowerCase().includes(destinoFinal.toLowerCase()));

    const atendeMulheres = filtroApenasMulheres ? viagem.apenasMulheres : true;
    const atendePcd = filtroPcd ? viagem.acessivelPcd : true;

    return atendePartida && atendeDestino && atendeMulheres && atendePcd;
  });

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#000000] font-sans pb-16">
      {/* BARRA DE FILTROS */}
      <section className="max-w-6xl mx-auto pt-4 sm:pt-8 px-4">
        <div className="bg-[#EFECE6] rounded-2xl p-3 sm:p-4 shadow-sm border border-[#E2DDD3] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1">
            <div className="flex-1 w-full bg-[#FAF8F5] rounded-xl px-3 py-2 border border-[#E2DDD3] focus-within:border-black transition-all">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">Ponto de Partida</span>
              <input
                type="text"
                placeholder="Ex: Avenida Paulista"
                value={pontoPartida}
                onChange={(e) => setPontoPartida(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400"
              />
            </div>

            <div className="flex-1 w-full bg-[#FAF8F5] rounded-xl px-3 py-2 border border-[#E2DDD3] focus-within:border-black transition-all">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">Destino Final</span>
              <input
                type="text"
                placeholder="Ex: Faria Lima"
                value={destinoFinal}
                onChange={(e) => setDestinoFinal(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* FILTROS ESPECIAIS & PERÍODO */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => setFiltroApenasMulheres(!filtroApenasMulheres)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  filtroApenasMulheres
                    ? 'bg-[#831843] text-white shadow-sm'
                    : 'bg-[#831843]/10 text-[#831843] hover:bg-[#831843]/20'
                }`}
              >
                <span>♀</span> Exclusivo Mulheres
              </button>

              <button
                onClick={() => setFiltroPcd(!filtroPcd)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  filtroPcd
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'bg-[#1e3a8a]/10 text-[#1e3a8a] hover:bg-[#1e3a8a]/20'
                }`}
              >
                <span>♿</span> Apta para PCD
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[#E2DDD3] p-1 rounded-xl shrink-0">
              {(['Manhã', 'Tarde', 'Noite'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(periodo === p ? 'Todos' : p)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodo === p ? 'bg-black text-white' : 'text-gray-700 hover:text-black'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LISTA DE CARONAS */}
      <section className="max-w-6xl mx-auto mt-6 sm:mt-8 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black">Caronas Disponíveis</h1>
            <span className="bg-[#EFECE6] text-gray-800 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full whitespace-nowrap border border-[#E2DDD3]">
              {viagensFiltradas.length} hoje
            </span>
          </div>
          <span className="text-xs font-medium text-gray-600">
            São Paulo e Região Metropolitana • Preços por assento
          </span>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          {viagensFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-[#EFECE6] rounded-2xl border border-[#E2DDD3] text-gray-600 font-semibold px-4 text-sm">
              Nenhuma carona encontrada com os filtros selecionados.
            </div>
          ) : (
            viagensFiltradas.map((viagem) => (
              <div
                key={viagem.id}
                className="bg-[#EFECE6] rounded-2xl p-4 sm:p-6 border border-[#E2DDD3] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row items-stretch justify-between gap-4 sm:gap-6 group"
              >
                {/* Perfil e Detalhes da Rota */}
                <div className="flex-1 w-full space-y-3 sm:space-y-4">
                  {/* Cabeçalho do Card: Perfil + Veículo */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#E2DDD3] pb-3">
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <img
                        src={viagem.motoristaFoto}
                        alt={viagem.motoristaNome}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-[#E2DDD3] shadow-sm shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-black group-hover:text-blue-700 transition-colors">
                            {viagem.motoristaNome}
                          </h3>
                          <span className="text-xs font-bold text-black flex items-center gap-0.5">
                            ★ {viagem.avaliacao.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">({viagem.totalCaronas})</span>
                        </div>

                        {/* TAGS */}
                        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                          {viagem.badge && (
                            <span className="bg-[#E2DDD3] text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              {viagem.badge}
                            </span>
                          )}
                          {viagem.acessivelPcd && (
                            <span className="bg-[#1e3a8a] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <span>♿</span> Apta para PCD
                            </span>
                          )}
                          {viagem.apenasMulheres && (
                            <span className="bg-[#831843] text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <span>♀</span> Exclusivo Mulheres
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Modelo do Veículo */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-900">{viagem.veiculoModelo}</p>
                      <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">{viagem.veiculoPlaca}</p>
                    </div>
                  </div>

                  {/* Percurso */}
                  <div className="space-y-3 pl-3 border-l-2 border-gray-900 ml-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-black">{viagem.horarioSaida}</span>
                        <span className="text-[9px] font-extrabold text-gray-500 tracking-wider">EMBARQUE</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{viagem.origem}</p>
                      {viagem.bairroOrigem && <p className="text-[11px] text-gray-500 leading-tight">{viagem.bairroOrigem}</p>}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-black">{viagem.horarioChegada}</span>
                        <span className="text-[9px] font-extrabold text-gray-500 tracking-wider">DESEMBARQUE</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{viagem.destino}</p>
                      {viagem.bairroDestino && <p className="text-[11px] text-gray-500 leading-tight">{viagem.bairroDestino}</p>}
                    </div>
                  </div>

                  {/* Métricas do trajeto */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-600 font-medium pt-1 flex-wrap">
                    <span>⏱ {viagem.tempoMinutos} min</span>
                    <span>📍 {viagem.distanciaKm} Km</span>
                    <span>⚡ {viagem.velocidadeMedia} Km/h</span>
                  </div>
                </div>

                {/* GOOGLE MAPS IFRAME REAL */}
                <div className="w-full lg:w-64 h-36 sm:h-40 rounded-xl overflow-hidden border border-[#E2DDD3] shadow-inner relative bg-[#FAF8F5] shrink-0 group-hover:border-gray-400 transition-colors">
                  <iframe
                    title={`Mapa de ${viagem.origem} para ${viagem.destino}`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={
                      viagem.latitudePartida && viagem.latitudeDestino
                        ? `https://maps.google.com/maps?saddr=${viagem.latitudePartida},${viagem.longitudePartida}&daddr=${viagem.latitudeDestino},${viagem.longitudeDestino}&output=embed`
                        : `https://maps.google.com/maps?saddr=${encodeURIComponent(
                            `${viagem.origem}, São Paulo - SP`
                          )}&daddr=${encodeURIComponent(
                            `${viagem.destino}, São Paulo - SP`
                          )}&output=embed`
                    }
                  />
                  {viagem.statusTransito && (
                    <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10 shadow-sm">
                      {viagem.statusTransito}
                    </div>
                  )}
                </div>

                {/* Preço e Botão de Reserva */}
                <div className="w-full lg:w-44 flex flex-row lg:flex-col justify-between items-center lg:justify-center border-t lg:border-t-0 lg:border-l border-[#E2DDD3] pt-3 lg:pt-0 lg:pl-6 gap-3 shrink-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Preço por assento
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-black block leading-none my-0.5">
                      R$ {viagem.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="inline-block text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {viagem.vagasDisponiveis} vagas restantes
                    </span>
                  </div>

                  <button
                    onClick={() => handleReservar(viagem.id)}
                    className="w-auto lg:w-full bg-black hover:bg-gray-800 text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
                  >
                    Reservar →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SEÇÃO INFORMATIVA */}
      <section className="max-w-6xl mx-auto mt-12 sm:mt-20 px-4">
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">Por que viajar de CORA?</h2>
          <p className="text-xs text-gray-600 mt-1">
            Mobilidade inteligente que reduz custos e emissões com máxima segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-[#EFECE6] p-5 sm:p-8 rounded-2xl border border-[#E2DDD3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E2DDD3] flex items-center justify-center text-black mb-4 sm:mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Até 70% de Economia</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Compartilhe os gastos reais de combustível e pedágio sem tarifas surpresas.
              </p>
            </div>
          </div>

          <div className="bg-[#EFECE6] p-5 sm:p-8 rounded-2xl border border-[#E2DDD3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#831843]/10 flex items-center justify-center text-[#831843] mb-4 sm:mb-6 font-bold">
                ♀
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Inclusão & Segurança</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Filtros exclusivos para viagens só entre mulheres e veículos adaptados para PCDs.
              </p>
            </div>
          </div>

          <div className="bg-[#EFECE6] p-5 sm:p-8 rounded-2xl border border-[#E2DDD3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#E2DDD3] flex items-center justify-center text-black mb-4 sm:mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 002.5-2.5V14a2 2 0 00-2-2h-2c-.53 0-1.04-.21-1.414-.586l-1.586-1.586A2 2 0 0110 8.5V7a2 2 0 00-2-2H5a2 2 0 00-2 2v1.935z" />
                </svg>
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Impacto Verde Real</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Otimização de assentos vagos nas capitais, reduzindo a emissão de CO₂.
              </p>
            </div>
          </div>

          <div className="bg-[#EFECE6] p-5 sm:p-8 rounded-2xl border border-[#E2DDD3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4 sm:mb-6 font-bold">
                🛡️
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Comunidade Verificada</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Perfis autênticos com avaliação mútua e validação de documentos para sua tranquilidade.
              </p>
            </div>
          </div>

          <div className="bg-[#EFECE6] p-5 sm:p-8 rounded-2xl border border-[#E2DDD3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 mb-4 sm:mb-6 font-bold">
                ⚡
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Flexibilidade de Horários</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Centenas de horários ao longo do dia combinando com sua rotina de trabalho ou estudos.
              </p>
            </div>
          </div>

          <div className="bg-[#EFECE6] p-5 sm:p-8 rounded-2xl border border-[#E2DDD3] shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4 sm:mb-6 font-bold">
                🚗
              </div>
              <h3 className="font-bold text-sm text-black mb-1.5">Menos Trânsito Urbano</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cada carona reduz a quantidade de carros em circulação, deixando o trânsito mais fluido.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}