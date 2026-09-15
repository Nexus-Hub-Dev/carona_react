import { useContext, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { PaperPlaneRight } from '@phosphor-icons/react';
import { AuthContext } from '../../contexts/AuthContext';
import { enviarMensagem, listarMensagens, type MensagemChat } from '../../services/Service';
import { ToastAlerta } from '../../utils/ToastAlerta';

interface ChatReservaProps {
  reservaId: number;
}

// Chat vinculado a uma reserva específica, para passageiro/a e motorista
// combinarem detalhes da viagem. Números de telefone e palavrões são
// filtrados no back antes de a mensagem ser salva (SanitizacaoService,
// no carona_api) — aqui só exibimos o que já vem sanitizado.
export function ChatReserva({ reservaId }: ChatReservaProps) {
  const { usuario } = useContext(AuthContext);
  const [mensagens, setMensagens] = useState<MensagemChat[]>([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const fimDaListaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let montado = true;

    async function carregar() {
      try {
        const dados = await listarMensagens(reservaId, usuario.token);
        if (montado) setMensagens(dados);
      } catch {
        // silencioso: não trava a tela por causa do chat
      } finally {
        if (montado) setCarregando(false);
      }
    }

    carregar();
    // Poll simples pra simular atualização quase em tempo real, sem
    // precisar de websocket para este ambiente local.
    const intervalo = setInterval(carregar, 4000);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, [reservaId, usuario.token]);

  useEffect(() => {
    fimDaListaRef.current?.scrollIntoView({ block: 'nearest' });
  }, [mensagens.length]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const textoEnviado = texto.trim();
    if (!textoEnviado) return;

    setEnviando(true);
    setTexto('');
    try {
      const mensagem = await enviarMensagem(reservaId, textoEnviado, usuario.token);
      setMensagens((atuais) => [...atuais, mensagem]);
    } catch {
      ToastAlerta('Não foi possível enviar a mensagem.', 'erro');
      setTexto(textoEnviado);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-border bg-surface-soft p-3">
      <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1" role="log" aria-live="polite" aria-label="Mensagens da conversa">
        {carregando ? (
          <p className="text-center text-xs text-muted">Carregando conversa...</p>
        ) : mensagens.length === 0 ? (
          <p className="text-center text-xs text-muted">Nenhuma mensagem ainda. Combine os detalhes da viagem por aqui.</p>
        ) : (
          mensagens.map((mensagem) => {
            const souEu = mensagem.autorId === usuario.id;
            return (
              <div key={mensagem.id} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
                <span
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    souEu ? 'bg-ink text-white' : 'bg-white text-ink border border-border'
                  }`}
                >
                  {mensagem.texto}
                </span>
                <span className="mt-0.5 text-[10px] text-muted">
                  {souEu ? 'Você' : mensagem.autor?.nome ?? 'Participante'} ·{' '}
                  {new Date(mensagem.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={fimDaListaRef} />
      </div>

      <form onSubmit={enviar} className="flex items-center gap-2">
        <input
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          placeholder="Escreva uma mensagem..."
          aria-label="Escrever mensagem"
          maxLength={1000}
          className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          aria-label="Enviar mensagem"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PaperPlaneRight size={16} weight="bold" />
        </button>
      </form>
      <p className="text-[10px] text-muted">
        Números de telefone e xingamentos são filtrados automaticamente das mensagens.
      </p>
    </div>
  );
}

export default ChatReserva;
