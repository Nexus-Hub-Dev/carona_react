import { useContext, useEffect, useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Clock,
  GenderFemale,
  MapPin,
  PawPrint,
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
import { ehGeneroFeminino } from '../../utils/opcoesPerfil';
import { classificarPreco, BADGE_PRECO, TEXTO_COR_PRECO } from '../../utils/precoJusto';

export function CriarCarona() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  // Rótulos e campos aqui eram <label> soltos ao lado do <input>, sem
  // htmlFor/id — clicar no texto não focava o campo e leitor de tela não
  // anunciava o nome do campo.
  const idOrigem = useId();
  const idDestino = useId();
  const idData = useId();
  const idHorario = useId();
  const idPreco = useId();

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

  const [aceitaPet, setAceitaPet] =
    useState(false);

  const motoristaEhMulher = ehGeneroFeminino(usuario.genero);

  // ============================================================
  // PREÇO
  // ============================================================

  const [precoDigitado, setPrecoDigitado] =
    useState('');

  const nivelPreco = useMemo(
    () => classificarPreco(Number(precoDigitado), calculoRota?.valorSugerido),
    [precoDigitado, calculoRota]
  );

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
    // Carona exclusiva para mulher
    // ----------------------------------------------------------

    if (apenasMulheres && !motoristaEhMulher) {
      ToastAlerta(
        'Carona exclusiva para mulher só pode ser criada por motoristas do gênero feminino.',
        'erro'
      );

      return;
    }

    // Acessibilidade (PCD) é apenas conceitual aqui: é uma sinalização de
    // intenção do motorista, sem nenhuma verificação técnica do veículo.

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
      aceitaPet,

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
      setApenasMulheres(false);
      setAcessivelPcd(false);
      setAceitaPet(false);

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
    <div className="min-h-screen bg-bg text-ink font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* CABEÇALHO */}

        <div className="border-b border-border pb-5">
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
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-alt shadow-sm">

            <div className="border-b border-border px-5 py-3">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-black">
                Selecione o veículo da viagem
              </span>
            </div>

            <div className="grid gap-3 bg-surface-soft p-5 sm:grid-cols-2">

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
                      : 'border-border bg-white text-black hover:border-black'
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
            className="bg-surface-alt rounded-2xl p-5 sm:p-8 border border-border shadow-sm space-y-6"
          >

            {/* ETAPA 1 */}

            <div className="space-y-4">

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-border pb-2">
                1. Rota e Localidades
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* PARTIDA */}

                <div className="bg-surface-soft rounded-xl p-3 border border-border focus-within:border-black transition-all">

                  <label htmlFor={idOrigem} className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Ponto de Partida *
                  </label>

                  <input
                    id={idOrigem}
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

                <div className="bg-surface-soft rounded-xl p-3 border border-border focus-within:border-black transition-all">

                  <label htmlFor={idDestino} className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Destino Final *
                  </label>

                  <input
                    id={idDestino}
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

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-border pb-2">
                2. Horários e Detalhes
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* DATA */}

                <div className="bg-surface-soft rounded-xl p-3 border border-border focus-within:border-black transition-all">

                  <label htmlFor={idData} className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Data de Saída *
                  </label>

                  <input
                    id={idData}
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

                <div className="bg-surface-soft rounded-xl p-3 border border-border focus-within:border-black transition-all">

                  <label htmlFor={idHorario} className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase">
                    Horário de Saída *
                  </label>

                  <input
                    id={idHorario}
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

              <div className="bg-surface-soft rounded-xl p-3 border border-border flex items-center justify-between">

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
                    className="w-8 h-8 rounded-lg bg-border hover:bg-gray-300 font-bold text-black text-sm transition-all"
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
                    className="w-8 h-8 rounded-lg bg-border hover:bg-gray-300 font-bold text-black text-sm transition-all"
                  >
                    +
                  </button>

                </div>

              </div>

            </div>

            {/* ETAPA 3 */}

            <div className="space-y-4">

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-border pb-2">
                3. Valor da Viagem
              </h2>

              <div className="bg-surface-soft rounded-2xl p-4 border border-border">

                <label htmlFor={idPreco} className="text-[10px] font-bold tracking-wider text-gray-500 block uppercase mb-1">
                  Valor da viagem (R$) *
                </label>

                <input
                  id={idPreco}
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
                  className={`w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold outline-none transition focus:border-black focus:ring-2 focus:ring-gray-100 ${
                    nivelPreco ? TEXTO_COR_PRECO[nivelPreco] : 'text-gray-500'
                  }`}
                />

                <p className="mt-2 text-xs text-gray-600">
                  Informe o valor manualmente. Se os endereços forem preenchidos, uma sugestão será exibida automaticamente.
                </p>

                {nivelPreco && (
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${BADGE_PRECO[nivelPreco].classes}`}>
                    {BADGE_PRECO[nivelPreco].texto}
                  </span>
                )}

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

                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft p-3 text-gray-900">

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

                    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-soft p-3 text-gray-900">

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

              <h2 className="text-sm font-black uppercase tracking-wider text-gray-700 border-b border-border pb-2">
                4. Preferências da Viagem
              </h2>

              <div className="grid gap-3 sm:grid-cols-3">

                {/* CARONA EXCLUSIVA PARA MULHER */}

                <button
                  type="button"
                  disabled={!motoristaEhMulher}
                  onClick={() =>
                    setApenasMulheres(
                      !apenasMulheres
                    )
                  }
                  aria-pressed={
                    apenasMulheres
                  }
                  title={
                    motoristaEhMulher
                      ? undefined
                      : 'Disponível apenas para motoristas do gênero feminino.'
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    !motoristaEhMulher
                      ? 'cursor-not-allowed border-border bg-surface-soft text-gray-400 opacity-60'
                      : apenasMulheres
                        ? 'border-women bg-women text-white shadow-[0_0_0_3px_rgba(131,24,67,0.25)] hover:bg-[#70203b]'
                        : 'border-border bg-white text-black hover:border-women'
                  }`}
                >

                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${!motoristaEhMulher ? 'bg-black/5 text-gray-400' : apenasMulheres ? 'bg-white/15 text-white' : 'bg-women/10 text-women'}`}>

                    <GenderFemale
                      size={22}
                      weight="bold"
                      aria-hidden="true"
                    />

                  </span>

                  <span>

                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      Carona exclusiva para mulher
                    </span>

                    <span className={`mt-1 block text-xs ${!motoristaEhMulher ? 'text-gray-400' : apenasMulheres ? 'text-white/80' : 'text-gray-500'}`}>
                      {motoristaEhMulher
                        ? 'Só passageiras mulheres podem solicitar essa vaga.'
                        : 'Só disponível quando a motorista também é mulher.'}
                    </span>

                  </span>

                </button>

                {/* PCD — sinalização conceitual */}

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
                      ? 'border-pcd bg-pcd text-white shadow-[0_0_0_3px_rgba(30,58,138,0.25)] hover:bg-[#183273]'
                      : 'border-border bg-white text-black hover:border-pcd'
                  }`}
                >

                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${acessivelPcd ? 'bg-white/15 text-white' : 'bg-pcd/10 text-pcd'}`}>

                    <Wheelchair
                      size={22}
                      weight="bold"
                      aria-hidden="true"
                    />

                  </span>

                  <span>

                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      Acessibilidade (conceitual)
                    </span>

                    <span className={`mt-1 block text-xs ${acessivelPcd ? 'text-white/80' : 'text-muted'}`}>
                      Sinalização de intenção — não verificamos o veículo
                    </span>

                  </span>

                </button>

                {/* PET */}

                <button
                  type="button"
                  onClick={() =>
                    setAceitaPet(
                      !aceitaPet
                    )
                  }
                  aria-pressed={
                    aceitaPet
                  }
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    aceitaPet
                      ? 'border-pet bg-pet text-white shadow-[0_0_0_3px_rgba(146,64,14,0.25)] hover:bg-[#7a3509]'
                      : 'border-border bg-white text-black hover:border-pet'
                  }`}
                >

                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${aceitaPet ? 'bg-white/15 text-white' : 'bg-pet/10 text-pet'}`}>

                    <PawPrint
                      size={22}
                      weight="bold"
                      aria-hidden="true"
                    />

                  </span>

                  <span>

                    <span className="block text-[10px] font-bold uppercase tracking-wider">
                      Aceita pets
                    </span>

                    <span className={`mt-1 block text-xs ${aceitaPet ? 'text-white/80' : 'text-muted'}`}>
                      Passageiros podem levar animais de estimação
                    </span>

                  </span>

                </button>

              </div>

            </div>

            {/* BOTÃO */}

            <div className="pt-4 border-t border-border">

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