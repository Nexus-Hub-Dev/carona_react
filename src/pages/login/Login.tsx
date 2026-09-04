import { useContext, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeSlash, LockKey, MapPin, User } from '@phosphor-icons/react'
import type UsuarioLogin from '../../models/UsuarioLogin'
import { AuthContext } from '../../contexts/AuthContext'

function Login() {
  const navigate = useNavigate()
  const { handleLogin, isLoading } = useContext(AuthContext)
  const [form, setForm] = useState<Pick<UsuarioLogin, 'usuario' | 'senha'>>({ usuario: '', senha: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.usuario.trim() || !form.senha) {
      setError('Informe seu e-mail e sua senha para continuar.')
      return
    }

    const authenticated = await handleLogin({ ...form, id: 0, nome: '', celular: '', foto: '', token: '' })
    if (authenticated) navigate('/home')
  }

  return (
    <section className="flex flex-1 items-center justify-center bg-[#f5efe4] px-5 py-12">
      <div className="grid w-full max-w-215 overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(24,59,53,0.14)] md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-[#0a0a0a] p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-30 border-[#d0d0d0]/90" />
          <div className="relative"><MapPin size={32} weight="fill" className="text-[#d0d0d0]" /><p className="mt-8 font-['Space_Grotesk'] text-4xl font-bold leading-tight">A cidade fica melhor quando a gente vai junto.</p></div>
          <p className="relative max-w-55 text-sm leading-6 text-[#d7e4d8]">Encontre caronas confiáveis e transforme cada trajeto em uma conexão.</p>
        </div>
        <div className="p-7 sm:p-11">
          <p className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-[#0a0a0a]">CORA</p>
          <h1 className="mt-10 font-['Space_Grotesk'] text-3xl font-bold text-[#0a0a0a]">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-[#65736e]">Entre para continuar sua jornada.</p>
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-semibold text-[#0a0a0a]">E-mail
              <span className="relative mt-2 block"><User size={19} className="absolute left-3 top-3 text-[#7a8983]" /><input value={form.usuario} onChange={(event) => updateField('usuario', event.target.value)} type="email" autoComplete="email" placeholder="voce@email.com" className="h-12 w-full rounded-xl border border-[#d7dfd8] bg-[#fbfcf9] pl-10 pr-3 outline-none transition focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#d0d0d0]" /></span>
            </label>
            <label className="block text-sm font-semibold text-[#0a0a0a]">Senha
              <span className="relative mt-2 block"><LockKey size={19} className="absolute left-3 top-3 text-[#7a8983]" /><input value={form.senha} onChange={(event) => updateField('senha', event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" className="h-12 w-full rounded-xl border border-[#d7dfd8] bg-[#fbfcf9] pl-10 pr-11 outline-none transition focus:border-[#0a0a0a] focus:ring-2 focus:ring-[#d0d0d0]" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-2.5 text-[#65736e]">{showPassword ? <EyeSlash size={21} /> : <Eye size={21} />}</button></span>
            </label>
            {error && <p role="alert" className="text-sm font-medium text-[#b42318]">{error}</p>}
            <button disabled={isLoading} className="h-12 w-full rounded-xl bg-[#d0d0d0] font-bold text-[#0a0a0a] transition hover:bg-[#bdbdbd] disabled:cursor-wait disabled:opacity-60">{isLoading ? 'Entrando...' : 'Entrar'}</button>
          </form>
          <p className="mt-7 text-center text-sm text-[#65736e]">Ainda não tem uma conta? <Link to="/cadastro" className="font-bold text-[#0a0a0a] underline underline-offset-4">Criar conta</Link></p>
        </div>
      </div>
    </section>
  )
}

export default Login