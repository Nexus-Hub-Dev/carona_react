import { useContext, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppleLogo, Eye, EyeSlash, GoogleLogo, LockKey, MapPin, User } from '@phosphor-icons/react'
import type UsuarioLogin from '../../models/UsuarioLogin'
import { AuthContext } from '../../contexts/AuthContext'
import { ToastAlerta } from '../../utils/ToastAlerta'

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

  // Vitrine: os botões de login social são só visuais, pra apresentação
  // do produto. Não autenticam de verdade — não há integração com
  // Google/Apple por trás.
  function loginSocialEmBreve(provedor: string) {
    ToastAlerta(`Login com ${provedor} em breve.`, 'info')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.usuario.trim() || !form.senha) {
      setError('Informe seu e-mail e sua senha para continuar.')
      return
    }

    const authenticated = await handleLogin({
      usuario: form.usuario.trim(),
      senha: form.senha,
    })
    if (authenticated) {
      navigate('/home', { replace: true })
    }
  }

  return (
    <section className="flex flex-1 items-center justify-center bg-bg px-5 py-12">
      <div className="grid w-full max-w-215 overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(24,59,53,0.14)] md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-ink p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-30 border-white/15" />
          <div className="relative"><MapPin size={32} weight="fill" className="text-white" /><p className="mt-8 font-['Space_Grotesk'] text-4xl font-bold leading-tight">A cidade fica melhor quando a gente vai junto.</p></div>
          <p className="relative max-w-55 text-sm leading-6 text-gray-300">Encontre caronas confiáveis e transforme cada trajeto em uma conexão.</p>
        </div>
        <div className="p-7 sm:p-11">
          <p className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-ink">CORA</p>
          <h1 className="mt-10 font-['Space_Grotesk'] text-3xl font-bold text-ink">Bem-vindo de volta</h1>
          <p className="mt-2 text-sm text-muted">Entre para continuar sua jornada.</p>
          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block text-sm font-semibold text-ink">E-mail
              <span className="relative mt-2 block"><User size={19} className="absolute left-3 top-3 text-muted" /><input value={form.usuario} onChange={(event) => updateField('usuario', event.target.value)} type="email" autoComplete="email" placeholder="voce@email.com" className="h-12 w-full rounded-xl border border-border bg-surface-soft pl-10 pr-3 outline-none transition focus:border-ink focus:ring-2 focus:ring-brand/30" /></span>
            </label>
            <label className="block text-sm font-semibold text-ink">Senha
              <span className="relative mt-2 block"><LockKey size={19} className="absolute left-3 top-3 text-muted" /><input value={form.senha} onChange={(event) => updateField('senha', event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" className="h-12 w-full rounded-xl border border-border bg-surface-soft pl-10 pr-11 outline-none transition focus:border-ink focus:ring-2 focus:ring-brand/30" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-2.5 text-muted">{showPassword ? <EyeSlash size={21} /> : <Eye size={21} />}</button></span>
            </label>
            {error && <p role="alert" className="text-sm font-medium text-[#b42318]">{error}</p>}
            {/* Feedback visual de campo válido: o botão só "acorda" (fica na
                cor de ação) quando a senha está preenchida. */}
            <button
              disabled={isLoading}
              className={`h-12 w-full rounded-xl font-bold transition disabled:cursor-wait disabled:opacity-60 ${
                form.senha
                  ? 'bg-brand text-white hover:bg-brand-dark'
                  : 'bg-surface-alt text-muted'
              }`}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-7 flex items-center gap-3" role="separator" aria-label="Ou continue com">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">ou continue com</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => loginSocialEmBreve('Google')}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-bold text-ink transition hover:border-ink hover:bg-surface-alt"
            >
              <GoogleLogo size={19} weight="bold" />
              Google
            </button>
            <button
              type="button"
              onClick={() => loginSocialEmBreve('Apple')}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-bold text-ink transition hover:border-ink hover:bg-surface-alt"
            >
              <AppleLogo size={19} weight="fill" />
              Apple
            </button>
          </div>

          <p className="mt-7 text-center text-sm text-muted">Ainda não tem uma conta? <Link to="/cadastro" className="font-bold text-ink underline underline-offset-4">Criar conta</Link></p>
        </div>
      </div>
    </section>
  )
}

export default Login