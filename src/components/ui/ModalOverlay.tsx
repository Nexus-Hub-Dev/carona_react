import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

/*
 * Overlay de modal acessível — reaproveitado pelos 3 modais do app
 * (adicionar/editar veículo, editar carona, alerta de "cadastre um
 * veículo"). Nenhum deles fechava com Esc, prendia o foco dentro do
 * diálogo ou devolvia o foco a quem abriu; isso ficava por conta do
 * navegador não fazer nada, e quem navega só por teclado ficava preso
 * "atrás" do modal.
 *
 * O visual continua sendo definido por quem chama (className do overlay
 * + o conteúdo em children) — este componente só adiciona
 * comportamento, não estilo. Uso:
 *
 *   <ModalOverlay aberto={mostrarModal} onFechar={fechar} labelledBy="titulo-id"
 *     className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4">
 *     <form className="w-full max-w-lg rounded-2xl ...">...</form>
 *   </ModalOverlay>
 */

const SELETOR_FOCAVEL =
  'input, select, textarea, button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

interface ModalOverlayProps {
  aberto: boolean;
  onFechar: () => void;
  labelledBy: string;
  className: string;
  children: ReactNode;
}

export function ModalOverlay({ aberto, onFechar, labelledBy, className, children }: ModalOverlayProps) {
  const painelRef = useRef<HTMLDivElement>(null);
  const focoAnteriorRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!aberto) return;

    focoAnteriorRef.current = document.activeElement;

    const painel = painelRef.current;
    const primeiroFocavel = painel?.querySelector<HTMLElement>(SELETOR_FOCAVEL);
    (primeiroFocavel ?? painel)?.focus();

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        onFechar();
        return;
      }

      if (evento.key !== 'Tab' || !painel) return;

      const itens = Array.from(painel.querySelectorAll<HTMLElement>(SELETOR_FOCAVEL)).filter(
        (item) => item.offsetParent !== null,
      );
      if (itens.length === 0) return;

      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primeiro.focus();
      }
    }

    document.addEventListener('keydown', aoTeclar);

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowOriginal;
      if (focoAnteriorRef.current instanceof HTMLElement) {
        focoAnteriorRef.current.focus();
      }
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className={className} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      {/* display:contents — não participa do layout, só empresta a ref
          pra achar/prender o foco nos elementos reais logo abaixo. */}
      <div ref={painelRef} className="contents">
        {children}
      </div>
    </div>
  );
}

export default ModalOverlay;
