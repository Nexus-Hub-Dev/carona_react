import { Car } from '@phosphor-icons/react';

type CarLoadingProps = {
  label?: string;
};

export default function CarLoading({ label = 'Carregando...' }: CarLoadingProps) {
  return (
    <div className="flex min-h-10 w-full items-center justify-center py-1" role="status" aria-live="polite">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-soft px-3 py-1.5 shadow-sm">
        <span className="inline-flex items-center justify-center motion-safe:animate-bounce">
          <Car size={16} className="block text-muted" weight="duotone" />
        </span>
        <span className="whitespace-nowrap text-[11px] font-bold tracking-wide text-muted">
          {label}
        </span>
      </span>
    </div>
  );
}
