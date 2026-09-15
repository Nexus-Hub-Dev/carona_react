// Opções compartilhadas entre Cadastro, Perfil e as regras de negócio
// que dependem de gênero (ex: carona exclusiva para mulher). Ter um único
// lugar evita o valor salvo (ex: "feminino") divergir do texto comparado
// nas validações espalhadas pelo app.

export const OPCOES_GENERO = [
  { value: '', label: 'Selecione uma opção' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'nao-binario', label: 'Não-binário' },
  { value: 'outro', label: 'Outro' },
  { value: 'prefiro-nao-informar', label: 'Prefiro não informar' },
] as const;

export function ehGeneroFeminino(genero: string | undefined | null): boolean {
  return (genero ?? '').trim().toLowerCase() === 'feminino';
}
