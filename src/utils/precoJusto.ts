// Classifica o valor cobrado pelo motorista contra o valor sugerido
// (calculado a partir da rota, no back-end) — mesma régua usada no campo de
// preço de CriarCaronas.tsx, agora compartilhada para que o card de
// resultados (visão do passageiro) mostre a mesma cor.
export type NivelPreco = 'justo' | 'moderado' | 'alto';

const LIMITE_MODERADO = 1; // acima do sugerido já deixa de ser "justo"
const LIMITE_ALTO = 1.3; // 30% acima do sugerido é considerado abusivo

export function classificarPreco(
  valorCobrado: number,
  valorSugerido?: number | null
): NivelPreco | null {
  if (
    !Number.isFinite(valorCobrado) ||
    valorSugerido == null ||
    !Number.isFinite(valorSugerido) ||
    valorSugerido <= 0
  ) {
    return null;
  }

  if (valorCobrado > valorSugerido * LIMITE_ALTO) return 'alto';
  if (valorCobrado > valorSugerido * LIMITE_MODERADO) return 'moderado';
  return 'justo';
}

export const TEXTO_COR_PRECO: Record<NivelPreco, string> = {
  justo: 'text-success',
  moderado: 'text-warning',
  alto: 'text-danger',
};

export const BADGE_PRECO: Record<NivelPreco, { texto: string; classes: string }> = {
  justo: { texto: 'Preço justo', classes: 'text-success bg-success-soft' },
  moderado: { texto: 'Um pouco acima da média', classes: 'text-warning bg-warning-soft' },
  alto: { texto: 'Bem acima da média', classes: 'text-danger bg-danger-soft' },
};
