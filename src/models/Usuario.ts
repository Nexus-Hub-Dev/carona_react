// Dados coletados no cadastro do cliente.
export default interface Usuario {
  id: number

  // Identidade
  nomeReal: string // nome
  nomeSocial: string // opcional — nome social, quando diferente do nome
  comoChamar: string // como a pessoa deseja ser chamada dentro do app (opcional; se vazio, usamos nomeSocial ou nomeReal)

  // Acesso
  usuario: string // e-mail / login
  senha: string

  // Contato e perfil
  celular: string
  foto: string

  // Dados pessoais
  genero: string // 'feminino' | 'masculino' | 'nao-binario' | 'outro' | 'prefiro-nao-informar'
  dataNascimento: string // yyyy-mm-dd
}
