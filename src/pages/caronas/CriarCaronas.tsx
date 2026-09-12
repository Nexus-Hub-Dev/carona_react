import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Clock,
  GenderFemale,
  MapPin,
  Wheelchair,
} from '@phosphor-icons/react';

import { ToastAlerta } from '../../utils/ToastAlerta';
import type { Veiculo } from '../../models/Veiculo';
import {
  cadastrarViagem,
  calcularRota,
  listarVeiculos,
  type CalculoRota,
} from '../../services/Service';
import { AuthContext } from '../../contexts/AuthContext';

export function CriarCarona() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  // ============================================================
  // VEÍCULOS
  // ============================================================

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] =
    useState<number | null>(null);

  useEffect(() => {
    let montado = true;

    async function carregarVeiculos() {
      try {
        const veiculosDoBackend = await listarVeiculos(usuario.token);

        if (montado) {
          setVeiculos(veiculosDoBackend);
        }
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);

        if (montado) {
          setVeiculos([]);
        }
      }
    }

    if (usuario.token) {
      carregarVeiculos();
    }

    return () => {
      montado = false;
    };
  }, [usuario.token]);

  const veiculoAtivo = useMemo(
    () => veiculos.find((veiculo) => veiculo.ativo) ?? veiculos[0],
    [veiculos]
  );

  useEffect(() => {
    if (
      veiculoAtivo &&
      !veiculos.some(
        (veiculo) => veiculo.id === veiculoSelecionadoId
      )
    ) {
      setVeiculoSelecionadoId(veiculoAtivo.id);
    }
  }, [veiculos, veiculoAtivo, veiculoSelecionadoId]);

  const veiculoSelecionado =
    veiculos.find(
      (veiculo) => veiculo.id === veiculoSelecionadoId
    ) ?? veiculoAtivo;

  // ============================================================
  // DATA MÍNIMA
  // ============================================================

  // O servidor pode estar rodando em um fuso horário diferente do
  // de Brasília, então horários "de hoje" muito próximos do agora
  // podem ser rejeitados pelo back. A margem de segurança de 3h
  // (ver MARGEM_SEGURANCA_MS mais abaixo) cobre essa diferença, então
  // aqui o mínimo pode voltar a ser hoje — quem garante o horário
  // seguro é a validação de data/hora no submit.
  const agora = new Date();

  const dataMinima = `${agora.getFullYear()}-${String(
    agora.getMonth() + 1
  ).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  // ============================================================
  // CAMPOS DO FORMULÁRIO
  // ============================================================

  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [bairroDestino, setBairroDestino] = useState('');
  const [dataSaida, setDataSaida] = useState(dataMinima);
  const [horarioSaida, setHorarioSaida] = useState('');
  const [vagasDisponiveis, setVagasDisponiveis] = useState(3);

  // ============================================================
  // CÁLCULO DA ROTA
  // ============================================================

  const [calculoRota, setCalculoRota] =
    useState<CalculoRota | null>(null);

  const [calculandoRota, setCalculandoRota] =
    useState(false);

  const [erroCalculoRota, setErroCalculoRota] =
    useState('');

  // ============================================================
  // PREFERÊNCIAS
  // ============================================================

  const [apenasMulheres, setApenasMulheres] =
    useState(false);

  const [acessivelPcd, setAcessivelPcd] =
    useState(false);

  // ============================================================
  // PREÇO
  // ============================================================

  const [precoDigitado, setPrecoDigitado] =
    useState('');

  // ============================================================
  // CALCULAR ROTA
  // ============================================================

  async function atualizarCalculoRota() {
    if (!origem.trim() || !destino.trim()) {
      return;
    }

    setCalculandoRota(true);
    setErroCalculoRota('');

    try {
      const resultado = await calcularRota(
        origem.trim(),
        destino.trim(),
        usuario.token
      );

      setCalculoRota(resultado);

      setPrecoDigitado(
        resultado.valorSugerido.toFixed(2)
      );
    } catch (error) {
      console.error('Erro ao calcular rota:', error);

      setCalculoRota(null);

      setErroCalculoRota(
        'Não foi possível calcular a rota. Confira os endereços e tente novamente.'
      );
    } finally {
      setCalculandoRota(false);
    }
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // ----------------------------------------------------------
    // Usuário
    // ----------------------------------------------------------

    if (!usuario.id) {
      ToastAlerta(
        'Sua sessão não possui um usuário válido. Faça login novamente.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Veículo
    // ----------------------------------------------------------

    if (!veiculoSelecionado) {
      ToastAlerta(
        'Você precisa cadastrar e ativar um veículo para oferecer caronas.',
        'erro'
      );

      return;
    }

    if (!veiculoSelecionado.id) {
      ToastAlerta(
        'O veículo selecionado é inválido.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Campos obrigatórios
    // ----------------------------------------------------------

    if (
      !origem.trim() ||
      !destino.trim() ||
      !dataSaida ||
      !horarioSaida ||
      !precoDigitado
    ) {
      ToastAlerta(
        'Preencha a origem, o destino, a data, o horário e o valor da viagem!',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Data
    // ----------------------------------------------------------

    if (dataSaida < dataMinima) {
      ToastAlerta(
        'A data da viagem não pode ser anterior à data de hoje.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Valor
    // ----------------------------------------------------------

    const valorTotal = Number(
      precoDigitado.replace(',', '.')
    );

    if (
      !Number.isFinite(valorTotal) ||
      valorTotal <= 0
    ) {
      ToastAlerta(
        'Informe um valor de viagem maior que zero.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Data e horário
    // ----------------------------------------------------------

    const dataHoraViagem = new Date(
      `${dataSaida}T${horarioSaida}:00`
    );

    // Margem de segurança: o back pode estar rodando num fuso
    // horário diferente do de Brasília, então um horário "quase
    // agora" pode já parecer passado pra ele. 3h de folga cobre
    // essa diferença com sobra.
    const MARGEM_SEGURANCA_MS = 3 * 60 * 60 * 1000; // 3 horas
    const agoraComMargem = new Date(
      Date.now() + MARGEM_SEGURANCA_MS
    );

    if (
      Number.isNaN(dataHoraViagem.getTime()) ||
      dataHoraViagem < agoraComMargem
    ) {
      ToastAlerta(
        'Escolha um horário de saída com pelo menos 3h de antecedência a partir de agora.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Apenas mulheres
    // ----------------------------------------------------------

    if (
      apenasMulheres &&
      usuario.genero &&
      usuario.genero.toLowerCase() !== 'feminino'
    ) {
      ToastAlerta(
        'Apenas motoristas do gênero feminino podem criar viagens somente para mulheres.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Acessibilidade
    // ----------------------------------------------------------

    if (
      acessivelPcd &&
      veiculoSelecionado.acessivelPcd !== true
    ) {
      ToastAlerta(
        'O veículo selecionado não está cadastrado como acessível para PCD.',
        'erro'
      );

      return;
    }

    // ----------------------------------------------------------
    // Formatação da data
    // ----------------------------------------------------------

    const [hora, minuto] = horarioSaida
      .split(':')
      .map(Number);

    const dataFormatada =
      `${dataSaida}T${String(hora).padStart(2, '0')}:` +
      `${String(minuto).padStart(2, '0')}:00`;

    // ----------------------------------------------------------
    // Payload
    // ----------------------------------------------------------

    const novaCorrida = {
      partida: origem.trim(),
      destino: destino.trim(),
      bairroDestino: bairroDestino.trim(),

      data: dataFormatada,

      disponivelPCD: acessivelPcd,
      apenasMulheres,

      valorSugerido:
        calculoRota?.valorSugerido ?? valorTotal,

      valorTotal,

      vagasDisponiveis,

      usuario: {
        id: usuario.id,
      },

      veiculo: {
        id: veiculoSelecionado.id,
      },
    };

    // ----------------------------------------------------------
    // Cadastro
    // ----------------------------------------------------------

    try {
      await cadastrarViagem(
        novaCorrida,
        usuario.token
      );

      ToastAlerta(
        'Carona cadastrada e publicada com sucesso!',
        'sucesso'
      );

      // Limpa o formulário
      setOrigem('');
      setDestino('');
      setBairroDestino('');
      setDataSaida(dataMinima);
      setHorarioSaida('');
      setPrecoDigitado('');
      setCalculoRota(null);
      setErroCalculoRota('');

      navigate('/caronas');
    } catch (error: any) {
      const dadosErro = error?.response?.data;

      const erros = dadosErro?.errors;

      const mensagemErros = Array.isArray(erros)
        ? erros
            .map(
              (item: any) =>
                item?.defaultMessage ||
                item?.message ||
                item
            )
            .join(', ')
        : typeof erros === 'object' &&
            erros !== null
          ? Object.values(erros).join(', ')
          : erros;

      const mensagem =
        typeof dadosErro === 'string'
          ? dadosErro
          : mensagemErros ||
            dadosErro?.message ||
            dadosErro?.error ||
            dadosErro?.detail;

      console.error(
        'Erro ao cadastrar carona:',
        {
          status: error?.response?.status,
          resposta: dadosErro,
          payload: novaCorrida,
        }
      );

      // O back retorna 400 "genérico" (só timestamp/status/error/path,
      // sem detalhar o campo) em alguns casos, como quando a validação
      // @Future da data falha. Como não dá pra distinguir o motivo
      // exato a partir da resposta, orientamos o usuário a checar a
      // data/horário primeiro, já que é a causa mais comum.
      const status = error?.response?.status;
      const semDetalheDoErro =
        status === 400 && !mensagem;

      ToastAlerta(
        mensagem ||
          (semDetalheDoErro
            ? 'Não foi possível publicar a carona. Verifique se o horário de saída tem pelo menos 3h de antecedência e tente novamente.'
            : 'Não foi possível publicar a carona. Verifique os dados e tente novamente.'),
        'erro'
      );
    }
  };

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#000000] font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* CABEÇALHO */}

        <div className="border-b border-[#E2DDD3] pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
              Nova viagem
            </p>

            <h1 className="mt-1 text-3xl font-black tracking-tight text-black">
              Oferecer nova carona
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
              Compartilhe seu trajeto, divida os custos da viagem e leve alguém com você.
            </p>
          </div>
        </div>

        {/* ======================================================
            VEÍCULOS
        ====================================================== */}

        {veiculos.length === 0 ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">

            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>

            <h2 className="text-lg font-bold text-red-900">
              Nenhum Veículo Cadastrado
            </h2>

            <p className="text-xs text-red-700 max-w-md mx-auto">
              Para publicar uma carona no CORA, você precisa ter ao menos um veículo cadastrado e ativado no seu perfil.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/veiculos')
              }
              className="mt-2 bg-black hover:bg-gray-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Cadastrar / Ativar Veículo →
            </button>

          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] shadow-sm">

            <div className="border-b border-[#E2DDD3] px-5 py-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-black">
                Selecione o veículo da viagem
              </span>
            </div>

            <div className="grid gap-3 bg-[#FAF8F5] p-5 sm:grid-cols-2">

              {veiculos.map((veiculo) => (
                <button
                  key={veiculo.id}
                  type="button"
                  onClick={() =>
                    setVeiculoSelecionadoId(
                      veiculo.id
                    )
                  }
                  aria-pressed={
                    veiculo.id ===
                    veiculoSelecionadoId
                  }
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                    veiculo.id ===
                    veiculoSelecionadoId
                      ? 'border-black bg-black text-white'
                      : 'border-[#E2DDD3] bg-white text-black hover:border-black'
                  }`}
                >

                  <span className="flex items-center gap-3">

                    <Car
                      size={24}
                      weight="fill"
                      aria-hidden="true"
                    />

                    <span>

                      <span className="block text-sm font-black">
                        {veiculo.modelo}
                      </span>

                      <span
                        className={`block text-[10px] font-bold uppercase tracking-wider ${
                          veiculo.id ===
                          veiculoSelecionadoId
                            ? 'text-gray-300'
                            : 'text-gray-500'
                        }`}
                      >
                        {veiculo.placa}
                      </span>

                    </span>

                  </span>

                  {veiculo.id ===
                    veiculoSelecionadoId && (
                    <span className="text-xs font-black">
                      Selecionado
                    </span>
                  )}

                </button>
              ))}

            </div>
          </div>
        )}

        {/* ======================================================
            FORMULÁRIO
        ====================================================== */}

        {veiculoSelecionado && (
          <form
            onSubmit={handleSubmit}
            className="bg-[#EFECE6] rounded-2xl p-5 sm:p-8 border border-[#E2DDD3] shadow-sm space-y-6"
          >

            {/* ETAPA 1 */}

            <div className="space-y-4">

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                1. Rota e Localidades
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* PARTIDA */}

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">

                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Ponto de Partida *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Ex: Av. Paulista, 900"
                    value={origem}
                    onChange={(e) =>
                      setOrigem(e.target.value)
                    }
                    onBlur={atualizarCalculoRota}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
                  />

                </div>

                {/* DESTINO */}

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">

                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Destino Final *
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="Ex: Faria Lima, 2777"
                    value={destino}
                    onChange={(e) =>
                      setDestino(e.target.value)
                    }
                    onBlur={atualizarCalculoRota}
                    className="w-full bg-transparent text-sm font-semibold text-black focus:outline-none placeholder-gray-400 mt-1"
                  />

                </div>

              </div>

            </div>

            {/* ETAPA 2 */}

            <div className="space-y-4">

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                2. Horários e Detalhes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* DATA */}

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">

                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Data de Saída *
                  </label>

                  <input
                    type="date"
                    required
                    min={dataMinima}
                    value={dataSaida}
                    onChange={(e) =>
                      setDataSaida(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent text-sm font-bold text-black focus:outline-none mt-1"
                  />

                </div>

                {/* HORÁRIO */}

                <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] focus-within:border-black transition-all">

                  <label className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Horário de Saída *
                  </label>

                  <input
                    type="time"
                    required
                    value={horarioSaida}
                    onChange={(e) =>
                      setHorarioSaida(
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent text-sm font-bold text-black focus:outline-none mt-1"
                  />

                </div>

              </div>

              {/* VAGAS */}

              <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E2DDD3] flex items-center justify-between">

                <div>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Assentos Disponíveis
                  </span>

                  <span className="text-xs text-gray-600 font-medium">
                    Quantidade de passageiros
                  </span>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setVagasDisponiveis(
                        (prev) =>
                          Math.max(
                            1,
                            prev - 1
                          )
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-[#E2DDD3] hover:bg-gray-300 font-bold text-black text-sm transition-all"
                  >
                    -
                  </button>

                  <span className="font-black text-base text-black min-w-5 text-center">
                    {vagasDisponiveis}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setVagasDisponiveis(
                        (prev) =>
                          Math.min(
                            6,
                            prev + 1
                          )
                      )
                    }
                    className="w-8 h-8 rounded-lg bg-[#E2DDD3] hover:bg-gray-300 font-bold text-black text-sm transition-all"
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

            {/* ETAPA 3 */}

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
                  placeholder="Informe o valor da viagem"
                  value={precoDigitado}
                  onChange={(e) =>
                    setPrecoDigitado(
                      e.target.value
                    )
                  }
                  className={`w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-2 text-sm font-bold outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100 ${
                    !precoDigitado ||
                    !calculoRota
                      ? 'text-gray-500'
                      : Number(
                          precoDigitado
                        ) >
                        calculoRota.valorSugerido *
                          1.3
                        ? 'text-red-600'
                        : Number(
                              precoDigitado
                            ) >
                            calculoRota.valorSugerido
                          ? 'text-amber-500'
                          : 'text-emerald-600'
                  }`}
                />

                <p className="mt-2 text-xs text-gray-600">
                  Informe o valor manualmente. Se os endereços forem preenchidos, uma sugestão será exibida automaticamente.
                </p>

                {calculandoRota && (
                  <p className="mt-3 text-xs font-bold text-gray-600">
                    Calculando rota...
                  </p>
                )}

                {erroCalculoRota && (
                  <p className="mt-3 text-xs font-bold text-red-600">
                    {erroCalculoRota}
                  </p>
                )}

                {calculoRota && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">

                    {/* DISTÂNCIA */}

                    <div className="flex items-center gap-3 rounded-xl border border-[#E2DDD3] bg-[#FAF8F5] p-3 text-gray-900">

                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-gray-700 shadow-sm">

                        <MapPin
                          size={21}
                          weight="fill"
                          aria-hidden="true"
                        />

                      </span>

                      <span>

                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Distância
                        </span>

                        <strong className="mt-0.5 block text-lg leading-none">
                          {calculoRota.distanciaKm.toFixed(
                            2
                          )}{' '}
                          km
                        </strong>

                      </span>

                    </div>

                    {/* DURAÇÃO */}

                    <div className="flex items-center gap-3 rounded-xl border border-[#E2DDD3] bg-[#FAF8F5] p-3 text-gray-900">

                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-gray-700 shadow-sm">

                        <Clock
                          size={21}
                          weight="fill"
                          aria-hidden="true"
                        />

                      </span>

                      <span>

                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Duração estimada
                        </span>

                        <strong className="mt-0.5 block text-lg leading-none">
                          {calculoRota.tempoEstimadoMin}{' '}
                          min
                        </strong>

                      </span>

                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* ETAPA 4 */}

            <div className="space-y-4">

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-[#E2DDD3] pb-2">
                4. Preferências da Viagem
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">

                {/* MULHERES */}

                <button
                  type="button"
                  onClick={() =>
                    setApenasMulheres(
                      !apenasMulheres
                    )
                  }
                  aria-pressed={
                    apenasMulheres
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    apenasMulheres
                      ? 'border-[#831843] bg-[#831843] text-white shadow-[0_0_0_3px_rgba(131,24,67,0.25)] hover:bg-[#70203b]'
                      : 'border-[#E2DDD3] bg-white text-black hover:border-[#831843]'
                  }`}
                >

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">

                    <GenderFemale
                      size={22}
                      weight="bold"
                      aria-hidden="true"
                    />

                  </span>

                  <span>

                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      Exclusivo mulheres
                    </span>

                    <span className="mt-1 block text-xs text-white/80">
                      Apenas motoristas e passageiras mulheres
                    </span>

                  </span>

                </button>

                {/* PCD */}

                <button
                  type="button"
                  onClick={() =>
                    setAcessivelPcd(
                      !acessivelPcd
                    )
                  }
                  aria-pressed={
                    acessivelPcd
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    acessivelPcd
                      ? 'border-[#1e3a8a] bg-[#1e3a8a] text-white shadow-[0_0_0_3px_rgba(30,58,138,0.25)] hover:bg-[#183273]'
                      : 'border-[#E2DDD3] bg-white text-black hover:border-[#1e3a8a]'
                  }`}
                >

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">

                    <Wheelchair
                      size={22}
                      weight="bold"
                      aria-hidden="true"
                    />

                  </span>

                  <span>

                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      Acessível para PCD
                    </span>

                    <span className="mt-1 block text-xs text-white/80">
                      Veículo preparado para acessibilidade
                    </span>

                  </span>

                </button>

              </div>

            </div>

            {/* BOTÃO */}

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