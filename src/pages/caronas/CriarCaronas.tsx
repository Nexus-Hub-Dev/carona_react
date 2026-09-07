import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { obterVeiculos } from '../../utils/veiculos';
import type { Veiculo } from '../../models/Veiculo';
import { calcularRota, type CalculoRota } from '../../services/Service';
import { AuthContext } from '../../contexts/AuthContext';

// Interfaces de apoio para integração com Back-end/Front-end
export function CriarCarona() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [veiculos] = useState<Veiculo[]>(obterVeiculos);

  // Busca o veículo ativo atual
  const veiculoAtivo = useMemo(() => veiculos.find((v) => v.ativo), [veiculos]);

  // Estados dos campos do Formulário
  const [origem, setOrigem] = useState('');
  const [bairroOrigem, setBairroOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [bairroDestino, setBairroDestino] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [vagasDisponiveis, setVagasDisponiveis] = useState(3);
  const [calculoRota, setCalculoRota] = useState<CalculoRota | null>(null);
  const [calculandoRota, setCalculandoRota] = useState(false);
  const [erroCalculoRota, setErroCalculoRota] = useState('');
  
  // Preferências/Filtros
  const [apenasMulheres, setApenasMulheres] = useState(false);
  const [acessivelPcd, setAcessivelPcd] = useState(false);

  // Valor definido pelo motorista
  const [precoDigitado, setPrecoDigitado] = useState<string>('');

  async function atualizarCalculoRota() {
    if (!origem.trim() || !destino.trim()) return;

    setCalculandoRota(true);
    setErroCalculoRota('');

    try {
      const resultado = await calcularRota(origem.trim(), destino.trim(), usuario.token);
      setCalculoRota(resultado);
    } catch {
      setCalculoRota(null);
      setErroCalculoRota('Não foi possível calcular a rota. Confira os endereços e tente novamente.');
    } finally {
      setCalculandoRota(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!veiculoAtivo) {
      ToastAlerta('Você precisa cadastrar e ativar um veículo para oferecer caronas.', 'erro');
      return;
    }

    if (!origem || !destino || !horarioSaida || !precoDigitado || !calculoRota) {
      ToastAlerta('Preencha todos os campos obrigatórios da rota!', 'erro');
      return;
    }

    const novaCorrida = {
      origem,
      bairroOrigem,
      destino,
      bairroDestino,
      horarioSaida,
      horarioChegada: calculoRota.horarioChegada,
      distanciaKm: calculoRota.distanciaKm,
      tempoMinutos: calculoRota.tempoMinutos,
      preco: parseFloat(precoDigitado),
      vagasDisponiveis,
      apenasMulheres,
      acessivelPcd,
      veiculoId: veiculoAtivo.id,
    };

    console.log('Dados prontos para envio ao backend:', novaCorrida);
    ToastAlerta('Carona cadastrada e publicada com sucesso!', 'sucesso');
    navigate('/caronas');

    // Limpar Formulário
    setOrigem('');
    setBairroOrigem('');
    setDestino('');
    setBairroDestino('');
    setHorarioSaida('');
    setPrecoDigitado('');
    setCalculoRota(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#000000] font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2DDD3] pb-4">
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight">Oferecer Nova Carona</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Defina o trajeto, horários e acerte a ajuda de custo com os passageiros.
            </p>
          </div>
          <span className="bg-[#E2DDD3] text-gray-800 text-xs font-bold px-3 py-1.5 rounded-xl self-start sm:self-auto">
            Visão do Motorista 🚗
          </span>
        </div>

        {/* ALERTA: SEM VEÍCULO ATIVO */}
        {!veiculoAtivo ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-bold text-red-900">Nenhum Veículo Ativo Encontrado</h2>
            <p className="text-xs text-red-700 max-w-md mx-auto">
              Para publicar uma carona no CORA, você precisa ter ao menos um veículo cadastrado e ativado no seu perfil.
            </p>
            <button
              onClick={() => ToastAlerta('Redirecionando para cadastro de veículo...', 'info')}
              className="mt-2 bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Cadastrar / Ativar Veículo →
            </button>
          </div>
        ) : (
          /* CARD DE VEÍCULO ATIVO SELECIONADO */
          <div className="bg-[#EFECE6] rounded-2xl p-4 border border-[#E2DDD3] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                ✓
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Veículo Ativo Selecionado
                </span>
                <p className="text-sm font-bold text-black">{veiculoAtivo.modelo}</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-gray-600 bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E2DDD3]">
              {veiculoAtivo.placa}
            </span>
          </div>
        )}

        {/* FORMULÁRIO DE CRIAÇÃO DA CARONA */}
        {veiculoAtivo && (
          <form onSubmit={handleSubmit} className="bg-[#EFECE6] rounded-2xl p-5 sm:p-8 border border-[#E2DDD3] shadow-sm space-y-6">
            
            {/* ETAPA 1: EMBARQUE E DESEMBARQUE */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                1. Rota e Localidades
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Partida */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Ponto de Partida *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Paulista, 900"
                    value={origem}
                    onChange={(e) => setOrigem(e.target.value)}
                    onBlur={atualizarCalculoRota}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
                  />
                </div>

                {/* Bairro/Ponto de referência Partida */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Bairro / Ref. Partida
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bela Vista (Em frente à Gazeta)"
                    value={bairroOrigem}
                    onChange={(e) => setBairroOrigem(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
                  />
                </div>

                {/* Destino */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Destino Final *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Faria Lima, 2777"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    onBlur={atualizarCalculoRota}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
                  />
                </div>

                {/* Bairro/Ponto de referência Destino */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Bairro / Ref. Destino
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Itaim Bibi (Shopping Iguatemi)"
                    value={bairroDestino}
                    onChange={(e) => setBairroDestino(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
                  />
                </div>
              </div>
            </div>

            {/* ETAPA 2: HORÁRIOS, DISTÂNCIA E VAGAS */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                2. Horários e Detalhes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Horário de Saída *
                  </label>
                  <input
                    type="time"
                    required
                    value={horarioSaida}
                    onChange={(e) => setHorarioSaida(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-black focus:outline-none mt-1"
                  />
                </div>

              </div>

              {/* Vagas Disponíveis */}
              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Assentos Disponíveis
                  </span>
                  <span className="text-xs text-gray-600 font-medium">Quantidade de passageiros</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setVagasDisponiveis((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg bg-[#E2DDD3] hover:bg-gray-300 font-bold text-black text-sm transition-all"
                  >
                    -
                  </button>
                  <span className="font-black text-base text-black min-w-5 text-center">
                    {vagasDisponiveis}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVagasDisponiveis((prev) => Math.min(6, prev + 1))}
                    className="w-8 h-8 rounded-lg bg-[#E2DDD3] hover:bg-gray-300 font-bold text-black text-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* ETAPA 3: PRECIFICAÇÃO */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                3. Valor por Assento
              </h2>
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E2DDD3]">
                <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase mb-1">
                  Valor por assento (R$) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Ex: 25,00"
                  value={precoDigitado}
                  onChange={(e) => setPrecoDigitado(e.target.value)}
                  className="w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
                />
                <p className="mt-2 text-xs text-gray-600">A distância e a previsão de chegada serão calculadas pela API.</p>
                {calculandoRota && <p className="mt-3 text-xs font-bold text-gray-600">Calculando rota...</p>}
                {erroCalculoRota && <p className="mt-3 text-xs font-bold text-red-600">{erroCalculoRota}</p>}
                {calculoRota && (
                  <div className="mt-3 grid gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-900 sm:grid-cols-3">
                    <span><strong>Distância:</strong> {calculoRota.distanciaKm} km</span>
                    <span><strong>Duração:</strong> {calculoRota.tempoMinutos} min</span>
                    <span><strong>Chegada:</strong> {calculoRota.horarioChegada}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ETAPA 4: PREFERÊNCIAS E TAGS */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                4. Preferências da Viagem
              </h2>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setApenasMulheres(!apenasMulheres)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    apenasMulheres
                      ? 'bg-[#831843] text-white shadow-sm'
                      : 'bg-[#831843]/10 text-[#831843] hover:bg-[#831843]/20'
                  }`}
                >
                  <span>♀</span> Exclusivo Mulheres
                </button>

                <button
                  type="button"
                  onClick={() => setAcessivelPcd(!acessivelPcd)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    acessivelPcd
                      ? 'bg-[#1e3a8a] text-white shadow-sm'
                      : 'bg-[#1e3a8a]/10 text-[#1e3a8a] hover:bg-[#1e3a8a]/20'
                  }`}
                >
                  <span>♿</span> Apta para PCD
                </button>
              </div>
            </div>

            {/* BOTÃO DE SUBMIT */}
            <div className="pt-4 border-t border-[#E2DDD3]">
              <button
                type="submit"
                className="w-full rounded-xl bg-black py-3.5 text-sm font-extrabold text-white shadow-sm transition-all hover:bg-gray-800 active:scale-[0.99]"
              >
                Publicar Carona →
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}