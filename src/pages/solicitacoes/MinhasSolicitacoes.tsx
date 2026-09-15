import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, ChatCircleDots, Clock, XCircle } from '@phosphor-icons/react';
import { AuthContext } from '../../contexts/AuthContext';
import {
  aceitarSolicitacao,
  cancelarSolicitacao,
  listarMinhasSolicitacoes,
  listarSolicitacoesRecebidas,
  recusarSolicitacao,
  type Reserva,
} from '../../services/Service';
import { ToastAlerta } from '../../utils/ToastAlerta';
import CarLoading from '../../components/loading/CarLoading';
import { ChatReserva } from '../../components/chat/ChatReserva';

type Aba = 'enviadas' | 'recebidas';

const STATUS_LABEL: Record<Reserva['status'], string> = {
  pendente: 'Aguardando resposta',
  aceita: 'Aceita',
  recusada: 'Recusada',
  cancelada: 'Cancelada',
};

function BadgeStatus({ status }: { status: Reserva['status'] }) {
  const estilos: Record<Reserva['status'], string> = {
    pendente: 'bg-amber-100 text-amber-800',
    aceita: 'bg-emerald-100 text-emerald-700',
    recusada: 'bg-red-100 text-red-700',
    cancelada: 'bg-gray-200 text-gray-600',
  };
  const icones: Record<Reserva['status'], React.ReactNode> = {
    pendente: <Clock size={13} weight="bold" />,
    aceita: <CheckCircle size={13} weight="bold" />,
    recusada: <XCircle size={13} weight="bold" />,
    cancelada: <XCircle size={13} weight="bold" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${estilos[status]}`}>
      {icones[status]} {STATUS_LABEL[status]}
    </span>
  );
}

function formatarDataHora(iso?: string | null) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return '—';
  return data.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function MinhasSolicitacoes() {
  const { usuario } = useContext(AuthContext);
  const [aba, setAba] = useState<Aba>('enviadas');

  const [enviadas, setEnviadas] = useState<Reserva[]>([]);
  const [recebidas, setRecebidas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<number | null>(null);
  const [chatAberto, setChatAberto] = useState<number | null>(null);

  useEffect(() => {
    if (!usuario.token) return;

    let montado = true;

    // Poll a cada 8s: enquanto a tela está aberta, um pedido novo
    // recebido ou uma resposta a um pedido enviado aparece sozinho, sem
    // precisar recarregar a página (mesma ideia do polling do chat).
    async function carregarTudo(primeiraVez: boolean) {
      try {
        const [minhas, dosOutros] = await Promise.all([
          listarMinhasSolicitacoes(usuario.token),
          listarSolicitacoesRecebidas(usuario.token),
        ]);
        if (montado) {
          setEnviadas(minhas);
          setRecebidas(dosOutros);
        }
      } catch {
        if (montado && primeiraVez) ToastAlerta('Não foi possível carregar suas solicitações.', 'erro');
      } finally {
        if (montado) setCarregando(false);
      }
    }

    carregarTudo(true);
    const intervalo = setInterval(() => carregarTudo(false), 8000);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, [usuario.token]);

  async function cancelar(reserva: Reserva) {
    setProcessando(reserva.id);
    try {
      const atualizada = await cancelarSolicitacao(reserva.id, usuario.token);
      setEnviadas((atuais) => atuais.map((r) => (r.id === atualizada.id ? atualizada : r)));
      ToastAlerta('Solicitação cancelada.', 'sucesso');
    } catch {
      ToastAlerta('Não foi possível cancelar a solicitação.', 'erro');
    } finally {
      setProcessando(null);
    }
  }

  async function aceitar(reserva: Reserva) {
    setProcessando(reserva.id);
    try {
      const atualizada = await aceitarSolicitacao(reserva.id, usuario.token);
      setRecebidas((atuais) => atuais.map((r) => (r.id === atualizada.id ? atualizada : r)));
      ToastAlerta('Solicitação aceita! As outras pendentes desse passageiro foram canceladas.', 'sucesso');
    } catch (error) {
      const mensagem = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      ToastAlerta(mensagem || 'Não foi possível aceitar a solicitação.', 'erro');
    } finally {
      setProcessando(null);
    }
  }

  async function recusar(reserva: Reserva) {
    setProcessando(reserva.id);
    try {
      const atualizada = await recusarSolicitacao(reserva.id, usuario.token);
      setRecebidas((atuais) => atuais.map((r) => (r.id === atualizada.id ? atualizada : r)));
      ToastAlerta('Solicitação recusada.', 'sucesso');
    } catch {
      ToastAlerta('Não foi possível recusar a solicitação.', 'erro');
    } finally {
      setProcessando(null);
    }
  }

  const lista = aba === 'enviadas' ? enviadas : recebidas;

  return (
    <section className="flex flex-1 justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Acompanhamento</p>
        <h1 className="mt-1 text-2xl font-black text-ink">Minhas solicitações de carona</h1>
        <p className="mt-1 text-sm text-muted">Acompanhe pedidos que você fez como passageiro/a e responda pedidos recebidos nas caronas que você oferece.</p>

        <div role="tablist" aria-label="Filtrar solicitações" className="mt-6 flex gap-2 rounded-xl border border-border bg-surface-alt p-1">
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'enviadas'}
            aria-controls="painel-solicitacoes"
            onClick={() => setAba('enviadas')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${aba === 'enviadas' ? 'bg-ink text-white' : 'text-gray-700 hover:bg-white'}`}
          >
            Enviadas ({enviadas.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={aba === 'recebidas'}
            aria-controls="painel-solicitacoes"
            onClick={() => setAba('recebidas')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition ${aba === 'recebidas' ? 'bg-ink text-white' : 'text-gray-700 hover:bg-white'}`}
          >
            Recebidas ({recebidas.length})
          </button>
        </div>

        <div id="painel-solicitacoes" role="tabpanel" className="mt-6 flex flex-col gap-3">
          {carregando ? (
            <CarLoading label="Carregando solicitações..." />
          ) : lista.length === 0 ? (
            <p className="rounded-xl bg-surface-alt p-6 text-center text-sm font-semibold text-muted">
              {aba === 'enviadas' ? 'Você ainda não solicitou nenhuma carona.' : 'Você ainda não recebeu nenhuma solicitação.'}
            </p>
          ) : (
            lista.map((reserva) => (
              <div key={reserva.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={(aba === 'enviadas' ? reserva.viagem?.usuario?.foto : reserva.passageiro?.foto) || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {aba === 'enviadas' ? reserva.viagem?.usuario?.nome ?? 'Motorista' : reserva.passageiro?.nome ?? 'Passageiro/a'}
                      </p>
                      <p className="text-xs text-muted">
                        {reserva.viagem?.partida} → {reserva.viagem?.destino}
                      </p>
                      <p className="text-xs text-muted">Viagem em {formatarDataHora(reserva.viagem?.data)}</p>
                    </div>
                  </div>
                  <BadgeStatus status={reserva.status} />
                </div>

                {reserva.motivo && (
                  <p className="mt-2 text-xs italic text-gray-500">{reserva.motivo}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
                  <span>Solicitado em {formatarDataHora(reserva.criadoEm)}</span>

                  <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setChatAberto((atual) => (atual === reserva.id ? null : reserva.id))}
                    className="flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-ink transition hover:bg-surface-soft"
                  >
                    <ChatCircleDots size={14} weight="bold" />
                    {chatAberto === reserva.id ? 'Fechar chat' : 'Conversar'}
                  </button>

                  {aba === 'enviadas' && reserva.status === 'pendente' && (
                    <button
                      type="button"
                      disabled={processando === reserva.id}
                      onClick={() => cancelar(reserva)}
                      className="min-h-8 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}

                  {aba === 'recebidas' && reserva.status === 'pendente' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={processando === reserva.id}
                        onClick={() => recusar(reserva)}
                        className="min-h-8 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        Recusar
                      </button>
                      <button
                        type="button"
                        disabled={processando === reserva.id}
                        onClick={() => aceitar(reserva)}
                        className="min-h-8 rounded-lg bg-success px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                      >
                        Aceitar
                      </button>
                    </div>
                  )}
                  </div>
                </div>

                {chatAberto === reserva.id && <ChatReserva reservaId={reserva.id} />}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
