import { Car, Clock, GenderFemale, MapPin, Wheelchair } from '@phosphor-icons/react';
import { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import type { Veiculo } from '../../models/Veiculo';
import { cadastrarViagem, calcularRota, type CalculoRota } from '../../services/Service';
import { ToastAlerta } from '../../utils/ToastAlerta';
import { obterVeiculos } from '../../utils/veiculos';

// Interfaces de apoio para integração com Back-end/Front-end
export function CriarCarona() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [veiculos] = useState<Veiculo[]>(obterVeiculos);
  const agora = new Date();
  const dataMinima = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  // Busca o veículo ativo atual
  const veiculoAtivo = useMemo(() => veiculos.find((v) => v.ativo), [veiculos]);

  // Estados dos campos do Formulário
  const [origem, setOrigem] = useState('');
  const [bairroOrigem, setBairroOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [bairroDestino, setBairroDestino] = useState('');
  const [dataSaida, setDataSaida] = useState(dataMinima);
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
      setPrecoDigitado(resultado.valorSugerido.toFixed(2));
    } catch {
      setCalculoRota(null);
      setErroCalculoRota('Não foi possível calcular a rota. Confira os endereços e tente novamente.');
    } finally {
      setCalculandoRota(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!veiculoAtivo) {
      ToastAlerta('Você precisa cadastrar e ativar um veículo para oferecer caronas.', 'erro');
      return;
    }

    if (!usuario.id) {
      ToastAlerta('Sua sessão não possui um usuário válido. Faça login novamente.', 'erro');
      return;
    }

    if (!origem || !destino || !dataSaida || !horarioSaida || !precoDigitado || !calculoRota) {
      ToastAlerta('Preencha todos os campos obrigatórios da rota!', 'erro');
      return;
    }

    if (dataSaida < dataMinima) {
      ToastAlerta('A data da viagem não pode ser anterior à data atual.', 'erro');
      return;
    }

    const valorTotal = Number(precoDigitado);
    if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
      ToastAlerta('Informe um valor válido para a viagem.', 'erro');
      return;
    }

    const [hora, minuto] = horarioSaida.split(':').map(Number);
    const dataFormatada = `${dataSaida}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`;

    const novaCorrida = {
      partida: origem,
      destino,
      data: dataFormatada,
      valorTotal,
      valorSugerido: calculoRota.valorSugerido,
      apenasMulheres,
      disponivelPCD: acessivelPcd,
      usuario: { id: usuario.id },
      veiculo: { id: veiculoAtivo.id },
    };

    try {
      await cadastrarViagem(novaCorrida, usuario.token);
      ToastAlerta('Carona cadastrada e publicada com sucesso!', 'sucesso');
      navigate('/caronas');
    } catch {
      ToastAlerta('Não foi possível publicar a carona. Verifique os dados e tente novamente.', 'erro');
      return;
    }

    // Limpar Formulário
    setOrigem('');
    setBairroOrigem('');
    setDestino('');
    setBairroDestino('');
    setDataSaida(dataMinima);
    setHorarioSaida('');
    setPrecoDigitado('');
    setCalculoRota(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#000000] font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="border-b border-[#E2DDD3] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Nova viagem</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-black">Oferecer nova carona</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">Compartilhe seu trajeto, divida os custos da viagem e leve alguém com você.</p>
          </div>
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
          <div className="overflow-hidden rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] shadow-[0_12px_30px_rgba(10,10,10,0.08)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#E2DDD3] bg-[#EFECE6] px-5 py-3">
              <div className="flex items-center gap-2 text-black">
                <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-black bg-white">
                  <span className="text-sm font-black text-emerald-600">✓</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]">Veículo ativo</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-black">Pronto para publicar</span>
            </div>
            <div className="flex flex-col gap-4 bg-[#FAF8F5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-black text-white">
                  <Car size={25} weight="fill" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Carro selecionado</p>
                  <p className="mt-1 text-lg font-black tracking-tight text-black">{veiculoAtivo.modelo}</p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Placa</p>
                <span className="mt-1 inline-block rounded-lg bg-white px-3 py-1.5 text-sm font-extrabold tracking-wider text-black shadow-sm">{veiculoAtivo.placa}</span>
              </div>
            </div>
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    Data de Saída *
                  </label>
                  <input
                    type="date"
                    required
                    min={dataMinima}
                    value={dataSaida}
                    onChange={(e) => setDataSaida(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-black focus:outline-none mt-1"
                  />
                </div>

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
                3. Valor da Viagem
              </h2>
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E2DDD3]">
                <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase mb-1">
                  Valor da viagem (R$) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="Calculado pela API"
                  value={precoDigitado}
                  onChange={(e) => setPrecoDigitado(e.target.value)}
                  className={`w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-2 text-sm font-bold outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100 ${
                    !precoDigitado || !calculoRota
                      ? 'text-gray-500'
                      : Number(precoDigitado) > calculoRota.valorSugerido * 1.3
                        ? 'text-red-600'
                        : Number(precoDigitado) > calculoRota.valorSugerido
                          ? 'text-amber-500'
                          : 'text-emerald-600'
                  }`}
                />
                <p className="mt-2 text-xs text-gray-600">Valor sugerido pela API. Você pode editar esse valor antes de publicar a viagem.</p>
                {calculandoRota && <p className="mt-3 text-xs font-bold text-gray-600">Calculando rota...</p>}
                {erroCalculoRota && <p className="mt-3 text-xs font-bold text-red-600">{erroCalculoRota}</p>}
                {calculoRota && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-[#E2DDD3] bg-[#FAF8F5] p-3 text-gray-900">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-gray-700 shadow-sm">
                        <MapPin size={21} weight="fill" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Distância</span>
                        <strong className="mt-0.5 block text-lg leading-none">{calculoRota.distanciaKm.toFixed(2)} km</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-[#E2DDD3] bg-[#FAF8F5] p-3 text-gray-900">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-gray-700 shadow-sm">
                        <Clock size={21} weight="fill" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Duração estimada</span>
                        <strong className="mt-0.5 block text-lg leading-none">{calculoRota.tempoEstimadoMin} min</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ETAPA 4: PREFERÊNCIAS E TAGS */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                4. Preferências da Viagem
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setApenasMulheres(!apenasMulheres)}
                  aria-pressed={apenasMulheres}
                  className={`flex items-center gap-3 rounded-xl border border-[#831843] bg-[#831843] p-3 text-left text-white transition-all hover:bg-[#70203b] ${
                    apenasMulheres ? 'shadow-[0_0_0_3px_rgba(131,24,67,0.25)]' : 'opacity-90'
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                    <GenderFemale size={22} weight="bold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider">Exclusivo mulheres</span>
                    <span className="mt-1 block text-xs text-white/80">Apenas motoristas e passageiras mulheres</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAcessivelPcd(!acessivelPcd)}
                  aria-pressed={acessivelPcd}
                  className={`flex items-center gap-3 rounded-xl border border-[#1e3a8a] bg-[#1e3a8a] p-3 text-left text-white transition-all hover:bg-[#183273] ${
                    acessivelPcd ? 'shadow-[0_0_0_3px_rgba(30,58,138,0.25)]' : 'opacity-90'
                  }`}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                    <Wheelchair size={22} weight="bold" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-wider">Acessível para PCD</span>
                    <span className="mt-1 block text-xs text-white/80">Veículo preparado para acessibilidade</span>
                  </span>
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