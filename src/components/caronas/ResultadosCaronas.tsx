import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, CircleNotch, PaperPlaneTilt, PencilSimple, Trash, XCircle } from '@phosphor-icons/react';
import { ToastAlerta } from '../../utils/ToastAlerta';
import {
  atualizarViagem,
  cancelarSolicitacao,
  listarMinhasSolicitacoes,
  listarViagens,
  removerViagem,
  solicitarReserva,
  type Reserva,
} from '../../services/Service';
import { AuthContext } from '../../contexts/AuthContext';
import Mapa from '../mapa/Mapa';
import CarLoading from '../loading/CarLoading';
import { ModalOverlay } from '../ui/ModalOverlay';
import { classificarPreco, BADGE_PRECO } from '../../utils/precoJusto';

export type Periodo = 'Manha' | 'Tarde' | 'Noite' | 'Todos';

// Interface compatível com o schema da API e com suporte aos dados visuais do front
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
  precoSugerido?: number;
  vagasDisponiveis: number;
  vagasRestantes: number;
  apenasMulheres?: boolean;
  acessivelPcd?: boolean;
  aceitaPet?: boolean;
  usuarioId?: number;
  veiculoId?: number;

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


function periodoDoHorario(horarioSaida: string): Exclude<Periodo, 'Todos'> {
  const hora = Number(horarioSaida.split(':')[0] ?? 0);
  if (hora < 12) return 'Manha';
  if (hora < 18) return 'Tarde';
  return 'Noite';
}

// Ação de cada card: um componente só, com 4 estados claros, em vez de
// um emaranhado de ternários inline — cada estado tem seu próprio ícone
// e uma pequena animação que reforça o que está acontecendo (o ponto
// pulsando enquanto espera, o avião "decolando" no hover, o spinner ao
// enviar).
function AcaoSolicitacao({
  souODono,
  minhaSolicitacao,
  semVagas,
  enviando,
  onSolicitar,
  onCancelar,
  onEditar,
  onExcluir,
}: {
  souODono: boolean;
  minhaSolicitacao?: Reserva;
  semVagas: boolean;
  enviando: boolean;
  onSolicitar: () => void;
  onCancelar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  if (souODono) {
    return (
      <div className="flex w-auto flex-col gap-2 lg:w-full">
        <button
          type="button"
          onClick={onEditar}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-800 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 sm:text-sm"
        >
          <PencilSimple size={15} weight="bold" /> Editar carona
        </button>
        <button
          type="button"
          onClick={onExcluir}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-xs font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50 sm:text-sm"
        >
          <Trash size={15} weight="bold" /> Excluir carona
        </button>
      </div>
    );
  }

  if (minhaSolicitacao?.status === 'aceita') {
    return (
      <span className="flex w-auto items-center justify-center gap-2 rounded-xl bg-success px-5 py-2.5 text-xs font-bold text-white shadow-sm lg:w-full sm:text-sm">
        <CheckCircle size={16} weight="fill" /> Reserva confirmada
      </span>
    );
  }

  if (minhaSolicitacao?.status === 'pendente') {
    return (
      <button
        type="button"
        onClick={onCancelar}
        className="flex w-auto items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-red-800 bg-red-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:border-red-900 hover:bg-red-900 lg:w-full sm:text-sm"
      >
        <XCircle size={14} weight="bold" className="shrink-0" /> Cancelar
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSolicitar}
      disabled={semVagas || enviando}
      className="group flex w-auto items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 lg:w-full sm:text-sm"
    >
      {semVagas ? (
        'Sem vagas'
      ) : enviando ? (
        <>
          <CircleNotch size={15} weight="bold" className="motion-safe:animate-spin" /> Enviando...
        </>
      ) : (
        <>
          <PaperPlaneTilt size={15} weight="fill" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          Solicitar carona
        </>
      )}
    </button>
  );
}

export interface ResultadosCaronasProps {
  origem: string;
  destino: string;
  data: string;
  periodo: Periodo;
  vagas: number;
  apenasMulheres: boolean;
  pcd: boolean;
  pet: boolean;
}

// Lista de resultados de busca + fluxo de solicitação de reserva —
// extraído da tela de Caronas pra ser usado também na busca inline da
// Home, sem duplicar a lógica de carregar viagens, filtrar e solicitar.
function ResultadosCaronas({ origem, destino, data, periodo, vagas, apenasMulheres, pcd, pet }: ResultadosCaronasProps) {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);

  const [viagens, setViagens] = useState<ViagemVisual[]>([]);
  const [carregandoViagens, setCarregandoViagens] = useState(true);

  const [minhasSolicitacoes, setMinhasSolicitacoes] = useState<Reserva[]>([]);
  const [solicitando, setSolicitando] = useState<number | null>(null);

  const [viagemEditando, setViagemEditando] = useState<ViagemVisual | null>(null);
  const [editando, setEditando] = useState(false);
  const [editarOrigem, setEditarOrigem] = useState('');
  const [editarDestino, setEditarDestino] = useState('');
  const [editarData, setEditarData] = useState('');
  const [editarHorario, setEditarHorario] = useState('');
  const [editarPreco, setEditarPreco] = useState('');
  const [editarApenasMulheres, setEditarApenasMulheres] = useState(false);
  const [editarAcessivelPcd, setEditarAcessivelPcd] = useState(false);
  const [editarAceitaPet, setEditarAceitaPet] = useState(false);

  useEffect(() => {
    let montado = true;

    async function carregarViagens() {
      try {
        const viagensApi = await listarViagens(usuario.token);

        const viagensFormatadas: ViagemVisual[] = viagensApi.map((viagem: any) => {
          const dataViagem = viagem.data ? new Date(viagem.data) : null;
          const tempoMinutos = Number(viagem.tempoEstimadoMin ?? 0);
          const chegada = dataViagem ? new Date(dataViagem.getTime() + tempoMinutos * 60_000) : null;

          return {
            id: viagem.id,
            motoristaNome: viagem.usuario?.nome ?? 'Motorista',
            motoristaFoto: viagem.usuario?.foto ?? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            avaliacao: 0,
            totalCaronas: 0,
            badge: '',
            veiculoModelo: viagem.veiculo?.modelo ?? 'Veículo não informado',
            veiculoPlaca: viagem.veiculo?.placa ?? '',
            origem: viagem.partida,
            destino: viagem.destino,
            horarioSaida: dataViagem ? dataViagem.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            horarioChegada: chegada ? chegada.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
            data: viagem.data,
            distanciaKm: Number(viagem.distanciaKm ?? 0),
            tempoMinutos,
            velocidadeMedia: Number(viagem.velocidadeMedia ?? 0),
            // preco é o valor que o passageiro paga (o que o motorista
            // digitou); valorSugerido é só a referência de "preço justo"
            // calculada pela rota, usada para colorir o preço, nunca pra
            // exibir como se fosse o valor cobrado.
            preco: Number(viagem.valorTotal ?? viagem.valorSugerido ?? 0),
            precoSugerido: viagem.valorSugerido != null ? Number(viagem.valorSugerido) : undefined,
            vagasDisponiveis: Number(viagem.vagasDisponiveis ?? 1),
            vagasRestantes: Number(viagem.vagasRestantes ?? viagem.vagasDisponiveis ?? 1),
            apenasMulheres: viagem.apenasMulheres,
            acessivelPcd: viagem.disponivelPCD,
            aceitaPet: viagem.aceitaPet,
            latitudePartida: viagem.latitudePartida,
            longitudePartida: viagem.longitudePartida,
            latitudeDestino: viagem.latitudeDestino,
            longitudeDestino: viagem.longitudeDestino,
            usuarioId: viagem.usuario?.id,
            veiculoId: viagem.veiculo?.id,
          };
        });

        if (montado) setViagens(viagensFormatadas);
      } catch {
        if (montado) ToastAlerta('Não foi possível carregar as caronas cadastradas.', 'erro');
      } finally {
        if (montado) setCarregandoViagens(false);
      }
    }

    carregarViagens();

    return () => {
      montado = false;
    };
  }, [usuario.token]);

  useEffect(() => {
    let montado = true;

    async function carregarMinhasSolicitacoes() {
      try {
        const solicitacoes = await listarMinhasSolicitacoes(usuario.token);
        if (montado) setMinhasSolicitacoes(solicitacoes);
      } catch {
        // Silencioso: a lista de solicitações é um extra, não deve travar a tela.
      }
    }

    if (usuario.token) carregarMinhasSolicitacoes();

    return () => {
      montado = false;
    };
  }, [usuario.token]);

  // Só olhamos solicitações pendentes/aceitas: recusadas ou canceladas não
  // bloqueiam uma nova tentativa (mesma regra usada no back).
  const minhaSolicitacaoPorViagem = useMemo(() => {
    const mapa = new Map<number, Reserva>();
    for (const reserva of minhasSolicitacoes) {
      if (reserva.status === 'pendente' || reserva.status === 'aceita') {
        mapa.set(reserva.viagemId, reserva);
      }
    }
    return mapa;
  }, [minhasSolicitacoes]);

  function abrirEdicao(viagem: ViagemVisual) {
    if (!viagem.usuarioId || viagem.usuarioId !== usuario.id) return;

    const dataViagem = viagem.data ? new Date(viagem.data) : new Date();

    setViagemEditando(viagem);
    setEditarOrigem(viagem.origem);
    setEditarDestino(viagem.destino);
    setEditarData(viagem.data ? dataViagem.toISOString().slice(0, 10) : '');
    setEditarHorario(viagem.data ? dataViagem.toTimeString().slice(0, 5) : viagem.horarioSaida);
    setEditarPreco(String(viagem.preco));
    setEditarApenasMulheres(viagem.apenasMulheres === true);
    setEditarAcessivelPcd(viagem.acessivelPcd === true);
    setEditarAceitaPet(viagem.aceitaPet === true);
  }

  async function salvarEdicao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!viagemEditando) return;

    const dataHora = new Date(`${editarData}T${editarHorario}:00`);
    const valor = Number(editarPreco);

    if (Number.isNaN(dataHora.getTime()) || dataHora < new Date() || !Number.isFinite(valor) || valor <= 0) {
      ToastAlerta('Informe uma data futura e um valor válido.', 'erro');
      return;
    }

    setEditando(true);

    try {
      await atualizarViagem({
        id: viagemEditando.id,
        partida: editarOrigem.trim(),
        destino: editarDestino.trim(),
        data: `${editarData}T${editarHorario}:00`,
        disponivelPCD: editarAcessivelPcd,
        apenasMulheres: editarApenasMulheres,
        aceitaPet: editarAceitaPet,
        valorTotal: valor,
        usuario: { id: viagemEditando.usuarioId },
        veiculo: { id: viagemEditando.veiculoId },
      }, usuario.token);

      setViagens((viagensAtuais) =>
        viagensAtuais.map((viagem) =>
          viagem.id === viagemEditando.id
            ? {
                ...viagem,
                origem: editarOrigem.trim(),
                destino: editarDestino.trim(),
                horarioSaida: editarHorario,
                data: `${editarData}T${editarHorario}:00`,
                preco: valor,
                apenasMulheres: editarApenasMulheres,
                acessivelPcd: editarAcessivelPcd,
                aceitaPet: editarAceitaPet,
              }
            : viagem
        )
      );
      setViagemEditando(null);
      ToastAlerta('Carona atualizada com sucesso!', 'sucesso');
    } catch (error: any) {
      const mensagem = error?.response?.data?.message || error?.response?.data?.error;
      ToastAlerta(mensagem || 'Não foi possível editar a carona.', 'erro');
    } finally {
      setEditando(false);
    }
  }

  async function excluirCarona(viagem: ViagemVisual) {
    if (viagem.usuarioId !== usuario.id) return;
    if (!window.confirm('Deseja realmente excluir esta carona?')) return;

    try {
      await removerViagem(viagem.id, usuario.token);
      setViagens((viagensAtuais) => viagensAtuais.filter((item) => item.id !== viagem.id));
      ToastAlerta('Carona excluída com sucesso!', 'sucesso');
    } catch (error: any) {
      const mensagem = error?.response?.data?.message || error?.response?.data?.error;
      ToastAlerta(mensagem || 'Não foi possível excluir a carona.', 'erro');
    }
  }

  // BUGFIX: antes, clicar em "Reservar" confirmava a vaga na hora — sem
  // checar se a motorista aceitava. Agora vira uma solicitação pendente de
  // aprovação, e o back trava tanto reservas duplicadas quanto mais de
  // `LIMITE_RESERVAS_PENDENTES` solicitações simultâneas do mesmo passageiro.
  async function solicitarCarona(viagem: ViagemVisual) {
    setSolicitando(viagem.id);
    try {
      const reserva = await solicitarReserva(viagem.id, usuario.token);
      setMinhasSolicitacoes((atuais) => [reserva, ...atuais.filter((r) => r.id !== reserva.id)]);
      ToastAlerta('Solicitação enviada! Você será avisado quando a motorista responder.', 'info');
      // Dupla confirmação: em vez de já tratar como reserva confirmada,
      // levamos a pessoa pra tela onde ela acompanha o status até a
      // motorista aceitar ou recusar.
      navigate('/historico-caronas');
    } catch (error) {
      const mensagem = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      ToastAlerta(mensagem || 'Não foi possível enviar a solicitação.', 'erro');
    } finally {
      setSolicitando(null);
    }
  }

  async function cancelarPedido(reserva: Reserva) {
    try {
      const atualizada = await cancelarSolicitacao(reserva.id, usuario.token);
      setMinhasSolicitacoes((atuais) => atuais.map((r) => (r.id === atualizada.id ? atualizada : r)));
      ToastAlerta('Solicitação cancelada.', 'sucesso');
    } catch {
      ToastAlerta('Não foi possível cancelar a solicitação.', 'erro');
    }
  }

  const viagensFiltradas = viagens.filter((viagem) => {
    const atendePartida = viagem.origem.toLowerCase().includes(origem.toLowerCase()) ||
      (viagem.bairroOrigem && viagem.bairroOrigem.toLowerCase().includes(origem.toLowerCase()));
    const atendeDestino = viagem.destino.toLowerCase().includes(destino.toLowerCase()) ||
      (viagem.bairroDestino && viagem.bairroDestino.toLowerCase().includes(destino.toLowerCase()));

    const atendeData = data
      ? viagem.data && new Date(viagem.data).toISOString().slice(0, 10) === data
      : true;
    const atendePeriodo = periodo === 'Todos' ? true : periodoDoHorario(viagem.horarioSaida) === periodo;
    const atendeVagas = vagas > 1 ? viagem.vagasRestantes >= vagas : true;

    const atendeMulheres = apenasMulheres ? viagem.apenasMulheres : true;
    const atendePcd = pcd ? viagem.acessivelPcd : true;
    const atendePet = pet ? viagem.aceitaPet : true;

    return atendePartida && atendeDestino && atendeData && atendePeriodo && atendeVagas && atendeMulheres && atendePcd && atendePet;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-black">Caronas disponíveis</h2>
          <span className="bg-surface-alt text-gray-800 text-[11px] sm:text-xs font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full whitespace-nowrap border border-border">
            {viagensFiltradas.length} encontradas
          </span>
        </div>
        <span className="text-xs font-medium text-gray-600">São Paulo e Região Metropolitana • Preços por assento</span>
      </div>

      <div className="flex flex-col gap-4 sm:gap-6">
        {carregandoViagens ? (
          <CarLoading label="Carregando caronas cadastradas..." />
        ) : viagensFiltradas.length === 0 ? (
          <div className="text-center py-12 bg-surface-alt rounded-2xl border border-border text-gray-600 font-semibold px-4 text-sm">Nenhuma carona encontrada com os filtros selecionados.</div>
        ) : (
          viagensFiltradas.map((viagem) => {
            const minhaSolicitacao = minhaSolicitacaoPorViagem.get(viagem.id);
            const souODono = viagem.usuarioId === usuario.id;
            const semVagas = viagem.vagasRestantes <= 0;

            return (
            <div key={viagem.id} className="bg-surface-alt rounded-2xl p-4 sm:p-6 border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row items-stretch justify-between gap-4 sm:gap-6 group">

              {/* Perfil e Detalhes da Rota */}
              <div className="flex-1 w-full space-y-3 sm:space-y-4">

                {/* Cabeçalho do Card: Perfil + Veículo */}
                <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <img src={viagem.motoristaFoto} alt={viagem.motoristaNome} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-border shadow-sm shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-black group-hover:text-blue-700 transition-colors">{viagem.motoristaNome}</h3>
                        <span className="text-xs font-bold text-black flex items-center gap-0.5">★ {viagem.avaliacao.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 font-medium">({viagem.totalCaronas})</span>
                      </div>

                      {/* TAGS */}
                      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                        {viagem.badge && <span className="bg-border text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">{viagem.badge}</span>}
                        {viagem.acessivelPcd && <span className="bg-pcd text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><span>♿</span> PCD (conceitual)</span>}
                        {viagem.apenasMulheres && <span className="bg-women text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><span>👩</span> Exclusivo Mulheres</span>}
                        {viagem.aceitaPet && <span className="bg-pet text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><span>🐾</span> Aceita pets</span>}
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
                      <span className="text-[11px] font-extrabold text-muted tracking-wider">EMBARQUE</span>
                      {viagem.data && (
                        <span className="text-[11px] font-bold text-muted uppercase">
                          {new Date(viagem.data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </span>
                      )}
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
                  <span>⏱ {viagem.tempoMinutos.toFixed(0)} min</span>
                  <span>🛣️ {viagem.distanciaKm.toFixed(1)} Km</span>
                  <span>🚗 {viagem.velocidadeMedia.toFixed(0)} Km/h</span>
                </div>
              </div>

              {/* NOVO MAPA COM MAPLIBRE E API */}
              <div className="w-full lg:w-64 h-36 sm:h-40 rounded-xl overflow-hidden border border-border shadow-inner relative bg-surface-soft shrink-0 group-hover:border-gray-400 transition-colors">
                <Mapa id={viagem.id.toString()} />

                {viagem.statusTransito && (
                  <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm z-10 shadow-sm">
                    {viagem.statusTransito}
                  </div>
                )}
              </div>

              {/* Preço e Botão de Reserva */}
              <div className="w-full lg:w-48 flex flex-row lg:flex-col justify-between items-center lg:justify-center border-t lg:border-t-0 lg:border-l border-border pt-3 lg:pt-0 lg:pl-6 gap-3 shrink-0">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Preço por assento</span>
                  <span className="text-xl sm:text-2xl font-black text-black block leading-none my-0.5">R$ {viagem.preco.toFixed(2).replace('.', ',')}</span>
                  {(() => {
                    const nivelPreco = classificarPreco(viagem.preco, viagem.precoSugerido);
                    if (!nivelPreco) return null;
                    return (
                      <span
                        title="Comparado com o preço médio calculado pela distância da rota"
                        className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-[11px] ${BADGE_PRECO[nivelPreco].classes}`}
                      >
                        {BADGE_PRECO[nivelPreco].texto}
                      </span>
                    );
                  })()}
                  <span className="block text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1">{viagem.vagasRestantes} vagas restantes</span>
                </div>

                <AcaoSolicitacao
                  souODono={souODono}
                  minhaSolicitacao={minhaSolicitacao}
                  semVagas={semVagas}
                  enviando={solicitando === viagem.id}
                  onSolicitar={() => solicitarCarona(viagem)}
                  onCancelar={() => minhaSolicitacao && cancelarPedido(minhaSolicitacao)}
                  onEditar={() => abrirEdicao(viagem)}
                  onExcluir={() => excluirCarona(viagem)}
                />
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Modal de Edição */}
      <ModalOverlay
        aberto={viagemEditando !== null}
        onFechar={() => setViagemEditando(null)}
        labelledBy="editar-carona-titulo"
        className="fixed inset-0 z-60 grid place-items-center bg-black/55 px-4"
      >
          <form onSubmit={salvarEdicao} className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-surface-alt p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Minhas caronas</p>
                <h2 id="editar-carona-titulo" className="mt-1 text-2xl font-black text-black">Editar carona</h2>
              </div>
              <button type="button" onClick={() => setViagemEditando(null)} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full text-xl text-gray-500 hover:bg-white hover:text-black">×</button>
            </div>

            <label className="block text-sm font-bold text-black">Partida<input required minLength={3} value={editarOrigem} onChange={(event) => setEditarOrigem(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
            <label className="block text-sm font-bold text-black">Destino<input required minLength={3} value={editarDestino} onChange={(event) => setEditarDestino(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-black">Data<input required type="date" value={editarData} onChange={(event) => setEditarData(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
              <label className="block text-sm font-bold text-black">Horário<input required type="time" value={editarHorario} onChange={(event) => setEditarHorario(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
            </div>

            <label className="block text-sm font-bold text-black">Valor por assento<input required min="0.01" step="0.01" type="number" value={editarPreco} onChange={(event) => setEditarPreco(event.target.value)} className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>

            <div className="flex flex-wrap gap-4 text-sm font-bold text-black">
              <label className="flex items-center gap-2"><input type="checkbox" checked={editarApenasMulheres} onChange={(event) => setEditarApenasMulheres(event.target.checked)} /> Exclusiva para mulher</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editarAcessivelPcd} onChange={(event) => setEditarAcessivelPcd(event.target.checked)} /> Acessibilidade (conceitual)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editarAceitaPet} onChange={(event) => setEditarAceitaPet(event.target.checked)} /> Aceita pets</label>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={editando} className="flex-1 rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60">{editando ? 'Salvando...' : 'Salvar alterações'}</button>
              <button type="button" onClick={() => setViagemEditando(null)} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-white">Cancelar</button>
            </div>
          </form>
      </ModalOverlay>
    </>
  );
}

export default ResultadosCaronas;
