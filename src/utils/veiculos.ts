import type { Veiculo } from '../models/Veiculo';

export const VEICULOS_STORAGE_KEY = 'coraVeiculos';

export function obterVeiculos(): Veiculo[] {
  const veiculosSalvos = localStorage.getItem(VEICULOS_STORAGE_KEY);

  if (!veiculosSalvos) return [];

  try {
    return JSON.parse(veiculosSalvos) as Veiculo[];
  } catch {
    return [];
  }
}

export function salvarVeiculos(veiculos: Veiculo[]) {
  localStorage.setItem(VEICULOS_STORAGE_KEY, JSON.stringify(veiculos));
}