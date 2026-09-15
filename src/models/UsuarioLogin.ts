export default interface Usuario {
  id: number

  // Nome de exibição usado em todo o app (navbar, cards de carona, etc).
  // Resolvido no back como comoChamar || nomeSocial || nomeReal.
  nome: string

  nomeReal: string
  nomeSocial: string
  comoChamar: string

  usuario: string
  senha: string

  celular: string
  foto: string

  genero?: string
  dataNascimento?: string
  idade?: number | null

  // Vamos reaproveitar os dados para fazer a tela de perfil - dai n precisa consutar a api toda hora
  token: string
}
