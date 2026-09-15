import { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../contexts/AuthContext';
import { listarMinhasSolicitacoes, listarSolicitacoesRecebidas, type Reserva } from '../services/Service';
import { opcoesToastPadrao } from '../utils/ToastAlerta';

const INTERVALO_MS = 8000;

type Snapshot = Record<number, Reserva['status']>;

function chaveArmazenamento(usuarioId: number) {
  return `cora_notificacoes_reservas_${usuarioId}`;
}

function carregarSnapshot(usuarioId: number): Snapshot {
  try {
    const bruto = localStorage.getItem(chaveArmazenamento(usuarioId));
    return bruto ? JSON.parse(bruto) : {};
  } catch {
    return {};
  }
}

function salvarSnapshot(usuarioId: number, snapshot: Snapshot) {
  try {
    localStorage.setItem(chaveArmazenamento(usuarioId), JSON.stringify(snapshot));
  } catch {
    // localStorage indisponível (aba anônima etc.) — só perde a
    // notificação, não trava nada.
  }
}

// Fica de olho nas solicitações de carona em segundo plano — sem isso,
// motorista só descobre que chegou um pedido (e passageiro só descobre
// que foi aceito/recusado) abrindo "Minhas solicitações" na mão. Roda em
// qualquer página, enquanto a pessoa estiver logada.
export function useNotificacoesReservas() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const primeiraChecagemRef = useRef(true);

  useEffect(() => {
    if (!usuario.token || !usuario.id) return;

    let montado = true;
    primeiraChecagemRef.current = true;

    async function checar() {
      try {
        const [minhas, recebidas] = await Promise.all([
          listarMinhasSolicitacoes(usuario.token),
          listarSolicitacoesRecebidas(usuario.token),
        ]);
        if (!montado) return;

        const anterior = carregarSnapshot(usuario.id);
        const primeiraChecagem = primeiraChecagemRef.current;
        const novoSnapshot: Snapshot = {};

        // Pedidos que EU fiz como passageiro/a: avisa quando alguém
        // responde (só a transição pendente -> aceita/recusada; um
        // cancelamento é ação da própria pessoa, não precisa avisar ela
        // mesma).
        for (const reserva of minhas) {
          novoSnapshot[reserva.id] = reserva.status;
          const statusAnterior = anterior[reserva.id];

          if (primeiraChecagem || statusAnterior !== 'pendente' || reserva.status === statusAnterior) continue;

          const destino = reserva.viagem?.destino ?? 'sua carona';
          if (reserva.status === 'aceita') {
            toast.success(`Sua solicitação para ${destino} foi aceita! 🎉`, {
              ...opcoesToastPadrao,
              onClick: () => navigate('/historico-caronas'),
            });
          } else if (reserva.status === 'recusada') {
            toast.info(`Sua solicitação para ${destino} foi recusada.`, {
              ...opcoesToastPadrao,
              onClick: () => navigate('/historico-caronas'),
            });
          }
        }

        // Pedidos que EU recebo como motorista: avisa quando chega um
        // pedido novo (pendente que ainda não existia na checagem
        // anterior).
        for (const reserva of recebidas) {
          novoSnapshot[reserva.id] = reserva.status;
          const jaConhecida = anterior[reserva.id] !== undefined;

          if (primeiraChecagem || jaConhecida || reserva.status !== 'pendente') continue;

          const nomePassageiro = reserva.passageiro?.nome ?? 'Alguém';
          const partida = reserva.viagem?.partida ?? 'uma das suas caronas';
          toast.info(`${nomePassageiro} quer uma vaga na carona saindo de ${partida}.`, {
            ...opcoesToastPadrao,
            onClick: () => navigate('/historico-caronas'),
          });
        }

        salvarSnapshot(usuario.id, novoSnapshot);
      } catch {
        // Silencioso: notificação é um extra, não deve incomodar com
        // toast de erro toda hora que a rede oscila.
      } finally {
        primeiraChecagemRef.current = false;
      }
    }

    checar();
    const intervalo = setInterval(checar, INTERVALO_MS);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, [usuario.token, usuario.id, navigate]);
}
