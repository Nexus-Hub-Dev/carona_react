import axios from 'axios'
import { type FormEvent, useContext, useState } from 'react'
import { AuthContext } from './contexts/AuthContext'
import { cadastrarUsuario } from './services/Service'
import { ToastAlerta } from './utils/ToastAlerta'
import './App.css'

function App() {
  const { usuario, handleLogin, handleLogout, isLoading } = useContext(AuthContext)
  const [modoCadastro, setModoCadastro] = useState(false)
  const [nome, setNome] = useState('')
  const [celular, setCelular] = useState('')
  const [genero, setGenero] = useState('')
  const [usuarioLogin, setUsuarioLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [enviandoCadastro, setEnviandoCadastro] = useState(false)

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (modoCadastro) {
      setEnviandoCadastro(true)
      try {
        await cadastrarUsuario('/usuarios/cadastrar', { nome, celular, genero, usuario: usuarioLogin, senha, foto: '' }, () => {})
        ToastAlerta('Cadastro realizado com sucesso!', 'sucesso')
        setModoCadastro(false)
        setNome('')
        setCelular('')
        setGenero('')
        setSenha('')
      } catch (error) {
        const status = axios.isAxiosError(error) ? ` (${error.response?.status ?? 'sem resposta'})` : ''
        const detalhe = axios.isAxiosError(error) && typeof error.response?.data === 'string'
          ? `: ${error.response.data}`
          : ''
        ToastAlerta(`Erro ao cadastrar o usuário${status}${detalhe}.`, 'erro')
      } finally {
        setEnviandoCadastro(false)
      }
      return
    }

    handleLogin({ id: 0, nome: '', usuario: usuarioLogin, senha, celular: '', foto: '', token: '' })
  }

  if (usuario.token) {
    return (
      <main className="app-shell">
        <section className="welcome-panel" aria-live="polite">
          <span className="eyebrow">Carona</span>
          <h1>Olá, {usuario.nome || usuario.usuario}.</h1>
          <p>Seu acesso foi autenticado com sucesso.</p>
          <button className="secondary-button" type="button" onClick={handleLogout}>Sair da conta</button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <section className="login-panel">
        <div className="login-intro">
          <span className="eyebrow">Carona</span>
          <h1>Viaje melhor, junto.</h1>
          <p>{modoCadastro ? 'Crie sua conta para começar.' : 'Entre para encontrar suas próximas caronas.'}</p>
        </div>
        <form className="login-form" onSubmit={enviarFormulario}>
          {modoCadastro && <>
            <label htmlFor="nome">Nome</label>
            <input id="nome" type="text" value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Digite seu nome" required />
            <label htmlFor="celular">Celular</label>
            <input id="celular" type="tel" value={celular} onChange={(event) => setCelular(event.target.value)} placeholder="(00) 00000-0000" minLength={11} required />
            <label htmlFor="genero">Gênero</label>
            <input id="genero" type="text" value={genero} onChange={(event) => setGenero(event.target.value)} placeholder="Digite seu gênero" required />
          </>}
          <label htmlFor="usuario">Usuário</label>
          <input id="usuario" type="email" value={usuarioLogin} onChange={(event) => setUsuarioLogin(event.target.value)} placeholder="email@exemplo.com" autoComplete="username" required />
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" value={senha} onChange={(event) => setSenha(event.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required />
          <button className="login-button" type="submit" disabled={isLoading || enviandoCadastro}>{isLoading || enviandoCadastro ? 'Enviando...' : modoCadastro ? 'Cadastrar' : 'Entrar'}</button>
          <button className="switch-button" type="button" onClick={() => setModoCadastro((modoAtual) => !modoAtual)}>
            {modoCadastro ? 'Já tenho uma conta' : 'Ainda não tenho cadastro'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default App
