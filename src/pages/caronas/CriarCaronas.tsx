import { useState, useMemo } from 'react';
import { ToastAlerta } from '../../utils/ToastAlerta';

// Interfaces de apoio para integração com Back-end/Front-end
interface Veiculo {
  id: number;
  modelo: string;
  placa: string;
  cor: string;
  ativo: boolean;
}

export function CriarCarona() {
  // Simulação de verificação de veículo ativo do usuário logado
  // Altere para carregar da sua API ou Contexto de Autenticação
  const [veiculos] = useState<Veiculo[]>([
    { id: 1, modelo: 'Nissan Kicks Azul', placa: 'BRA2E19', cor: 'Azul', ativo: true },
  ]);

  // Busca o veículo ativo atual
  const veiculoAtivo = useMemo(() => veiculos.find((v) => v.ativo), [veiculos]);

  // Estados dos campos do Formulário
  const [origem, setOrigem] = useState('');
  const [bairroOrigem, setBairroOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [bairroDestino, setBairroDestino] = useState('');
  const [horarioSaida, setHorarioSaida] = useState('');
  const [horarioChegada, setHorarioChegada] = useState('');
  const [vagasDisponiveis, setVagasDisponiveis] = useState(3);
  const [distanciaKm, setDistanciaKm] = useState<number | ''>('');
  
  // Preferências/Filtros
  const [apenasMulheres, setApenasMulheres] = useState(false);
  const [acessivelPcd, setAcessivelPcd] = useState(false);

  // Valor definido pelo motorista
  const [precoDigitado, setPrecoDigitado] = useState<string>('');

  // Cálculo Dinâmico do Valor Sugerido
  // Exemplo de regra: R$ 5,00 taxa base + R$ 2,50 por Km
  const valorSugerido = useMemo(() => {
    if (!distanciaKm || Number(distanciaKm) <= 0) return 0;
    return 5.0 + Number(distanciaKm) * 2.5;
  }, [distanciaKm]);

  // Cálculo do Limite Máximo (+20%)
  const valorMaximoPermitido = useMemo(() => {
    return valorSugerido * 1.2;
  }, [valorSugerido]);

  // Validação se o preço digitado está acima do limite permitido (+20%)
  const precoInvalido = useMemo(() => {
    if (!precoDigitado || valorSugerido === 0) return false;
    const numPreco = parseFloat(precoDigitado);
    return numPreco > valorMaximoPermitido;
  }, [precoDigitado, valorSugerido, valorMaximoPermitido]);

  // Handler ao selecionar/usar o valor sugerido
  const handleUsarValorSugerido = () => {
    setPrecoDigitado(valorSugerido.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!veiculoAtivo) {
      ToastAlerta('Você precisa cadastrar e ativar um veículo para oferecer caronas.', 'erro');
      return;
    }

    if (!origem || !destino || !horarioSaida || !horarioChegada || !distanciaKm) {
      ToastAlerta('Preencha todos os campos obrigatórios da rota!', 'erro');
      return;
    }

    const valorFinal = precoDigitado ? parseFloat(precoDigitado) : valorSugerido;

    if (valorFinal > valorMaximoPermitido) {
      ToastAlerta('O valor por assento não pode exceder 20% do valor sugerido.', 'erro');
      return;
    }

    const novaCorrida = {
      origem,
      bairroOrigem,
      destino,
      bairroDestino,
      horarioSaida,
      horarioChegada,
      distanciaKm: Number(distanciaKm),
      preco: valorFinal,
      vagasDisponiveis,
      apenasMulheres,
      acessivelPcd,
      veiculoId: veiculoAtivo.id,
    };

    console.log('Dados prontos para envio ao backend:', novaCorrida);
    ToastAlerta('Carona cadastrada e publicada com sucesso!', 'sucesso');

    // Limpar Formulário
    setOrigem('');
    setBairroOrigem('');
    setDestino('');
    setBairroDestino('');
    setHorarioSaida('');
    setHorarioChegada('');
    setDistanciaKm('');
    setPrecoDigitado('');
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Previsão de Chegada *
                  </label>
                  <input
                    type="time"
                    required
                    value={horarioChegada}
                    onChange={(e) => setHorarioChegada(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-black focus:outline-none mt-1"
                  />
                </div>

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">
                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Distância Estimada (Km) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    placeholder="Ex: 12.5"
                    value={distanciaKm}
                    onChange={(e) => setDistanciaKm(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
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
                  <span className="font-black text-base text-black min-w-[20px] text-center">
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

            {/* ETAPA 3: PRECIFICAÇÃO E SUGESTÃO (+20%) */}
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                3. Valor por Assento
              </h2>

              {valorSugerido > 0 ? (
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#E2DDD3] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2DDD3] pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                        Cálculo Automático CORA
                      </span>
                      <p className="text-xs text-gray-600 font-medium">
                        Baseado no trajeto de {distanciaKm} Km
                      </p>
                    </div>

                    {/* VALOR SUGERIDO EM VERDE */}
                    <div className="text-left sm:text-right flex items-center gap-2 sm:block">
                      <span className="text-xs text-emerald-800 font-extrabold block">Valor Sugerido:</span>
                      <span className="text-xl font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                        R$ {valorSugerido.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase mb-1">
                        Seu Preço Desejado (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={`Até R$ ${valorMaximoPermitido.toFixed(2)}`}
                        value={precoDigitado}
                        onChange={(e) => setPrecoDigitado(e.target.value)}
                        className={`w-full bg-white rounded-xl px-3 py-2 border text-sm font-bold focus:outline-none transition-all ${
                          precoInvalido
                            ? 'border-red-500 text-red-600 focus:ring-1 focus:ring-red-500'
                            : 'border-[#E2DDD3] text-black focus:border-black'
                        }`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleUsarValorSugerido}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm shrink-0 self-end"
                    >
                      Usar Valor Sugerido
                    </button>
                  </div>

                  {/* MENSSAGEM DE REGRAS E MÁXIMO (+20%) */}
                  <div className="text-[11px] font-semibold space-y-1 pt-1">
                    <p className="text-gray-600">
                      ℹ️ Você pode ajustar o preço em até **+20%** sobre o valor sugerido (Limite máximo:{' '}
                      <strong className="text-black">R$ {valorMaximoPermitido.toFixed(2).replace('.', ',')}</strong>).
                    </p>
                    {precoInvalido && (
                      <p className="text-red-600 font-bold">
                        ❌ O valor inserido é superior ao limite permitido (+20%). Reduza para publicar.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E2DDD3] text-center text-xs text-gray-500 font-medium">
                  Insira a <strong className="text-black">Distância Estimada (Km)</strong> na etapa anterior para calcular o valor sugerido da corrida.
                </div>
              )}
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
                disabled={precoInvalido}
                className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
                  precoInvalido
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-black hover:bg-gray-800 text-white active:scale-[0.99]'
                }`}
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