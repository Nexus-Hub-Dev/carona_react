import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { cadastrarUsuario } from '../../services/Service'
import type Usuario from '../../models/Usuario'
import { ToastAlerta } from '../../utils/ToastAlerta'
import { calcularIdade } from '../../utils/idade'
import { OPCOES_GENERO } from '../../utils/opcoesPerfil'
import { SENHA_MINIMA } from '../../utils/validacao'

type CadastroForm = Omit<Usuario, 'id'> & { confirmarSenha: string }

const IDADE_MINIMA = 18

const formInicial: CadastroForm = {
  nomeReal: '',
  nomeSocial: '',
  comoChamar: '',
  usuario: '',
  senha: '',
  confirmarSenha: '',
  celular: '',
  foto: '',
  genero: '',
  dataNascimento: '',
}

function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CadastroForm>(formInicial)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField<K extends keyof CadastroForm>(field: K, value: CadastroForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const formCompleto = Boolean(
    form.nomeReal.trim() &&
    form.usuario.trim() &&
    form.senha &&
    form.confirmarSenha &&
    form.celular.trim() &&
    form.genero &&
    form.dataNascimento
  )

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.nomeReal.trim() || !form.usuario.trim() || !form.senha || !form.celular.trim() || !form.genero || !form.dataNascimento) {
      return setError('Preencha todos os campos obrigatórios.')
    }
    if (form.senha.length < SENHA_MINIMA) return setError(`A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`)
    if (form.senha !== form.confirmarSenha) return setError('As senhas precisam ser iguais.')

    const idade = calcularIdade(form.dataNascimento)
    if (idade === null) return setError('Informe uma data de nascimento válida.')
    if (idade < IDADE_MINIMA) return setError(`Você precisa ter pelo menos ${IDADE_MINIMA} anos para se cadastrar.`)

    setIsLoading(true)
    try {
      const dados = {
        nomeReal: form.nomeReal.trim(),
        nomeSocial: form.nomeSocial.trim(),
        comoChamar: form.comoChamar.trim(),
        usuario: form.usuario.trim(),
        senha: form.senha,
        celular: form.celular.trim(),
        foto: form.foto.trim(),
        genero: form.genero,
        dataNascimento: form.dataNascimento,
      }
      await cadastrarUsuario('/usuarios/cadastrar', dados, () => undefined)
      ToastAlerta('Cadastro realizado com sucesso!', 'sucesso')
      navigate('/login')
    } catch (requestError) {
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
      setError(status === 409 ? 'Este e-mail já está cadastrado.' : 'Não foi possível concluir o cadastro. Tente novamente.')
    } finally { setIsLoading(false) }
  }

  return (
    <section className="flex flex-1 items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-160 rounded-3xl bg-white p-7 shadow-[0_24px_70px_rgba(24,59,53,0.14)] sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted no-underline hover:text-ink"><ArrowLeft size={18} /> Voltar para o login</Link>
        <div className="mt-8 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white"><CheckCircle size={25} weight="bold" /></span>
          <div>
            <h1 className="font-['Space_Grotesk'] text-3xl font-bold text-ink">Crie sua conta</h1>
            <p className="mt-1 text-sm text-muted">Faça parte de uma comunidade que compartilha caminhos.</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2" noValidate>

          {/* Identidade */}
          <p className="text-xs font-black uppercase tracking-widest text-muted sm:col-span-2">Identidade</p>

          <label className="block text-sm font-semibold text-ink">Nome<input required value={form.nomeReal} onChange={(e) => updateField('nomeReal', e.target.value)} autoComplete="name" placeholder="Seu nome completo" className="form-input" /></label>

          <label className="block text-sm font-semibold text-ink">Nome social <span className="font-normal text-muted">(opcional)</span><input value={form.nomeSocial} onChange={(e) => updateField('nomeSocial', e.target.value)} placeholder="Se diferente do nome" className="form-input" /></label>

          <label className="block text-sm font-semibold text-ink sm:col-span-2">
            Como deseja ser chamado <span className="font-normal text-muted">(opcional)</span>
            <input value={form.comoChamar} onChange={(e) => updateField('comoChamar', e.target.value)} placeholder="Como prefere ser chamado no app" className="form-input" />
          </label>

          <label className="block text-sm font-semibold text-ink">
            Gênero
            <select required value={form.genero} onChange={(e) => updateField('genero', e.target.value)} className="form-input">
              {OPCOES_GENERO.map((opcao) => <option key={opcao.value} value={opcao.value}>{opcao.label}</option>)}
            </select>
          </label>

          <label className="block text-sm font-semibold text-ink">Data de nascimento<input required value={form.dataNascimento} onChange={(e) => updateField('dataNascimento', e.target.value)} type="date" className="form-input" /></label>

          <label className="block text-sm font-semibold text-ink sm:col-span-2">Foto <span className="font-normal text-muted">(opcional)</span><input value={form.foto} onChange={(e) => updateField('foto', e.target.value)} type="url" placeholder="https://..." className="form-input" /></label>

          {/* Contato e acesso */}
          <p className="mt-2 text-xs font-black uppercase tracking-widest text-muted sm:col-span-2">Contato e acesso</p>

          <label className="block text-sm font-semibold text-ink sm:col-span-2">E-mail<input required value={form.usuario} onChange={(e) => updateField('usuario', e.target.value)} type="email" autoComplete="email" placeholder="voce@email.com" className="form-input" /></label>
          <label className="block text-sm font-semibold text-ink sm:col-span-2">Celular<input required value={form.celular} onChange={(e) => updateField('celular', e.target.value)} type="tel" autoComplete="tel" placeholder="(11) 98877-6655" className="form-input" /></label>
          <label className="block text-sm font-semibold text-ink">Senha<input required value={form.senha} onChange={(e) => updateField('senha', e.target.value)} type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" className="form-input" /></label>
          <label className="block text-sm font-semibold text-ink">Confirmar senha<input required value={form.confirmarSenha} onChange={(e) => updateField('confirmarSenha', e.target.value)} type="password" autoComplete="new-password" placeholder="Repita sua senha" className="form-input" /></label>

          {error && <p role="alert" className="text-sm font-medium text-[#b42318] sm:col-span-2">{error}</p>}
          <button
            disabled={isLoading || !formCompleto}
            className={`mt-2 h-12 rounded-xl font-bold transition disabled:opacity-60 sm:col-span-2 ${
              formCompleto ? 'bg-ink text-white hover:bg-black disabled:cursor-wait' : 'cursor-not-allowed bg-surface-alt text-muted'
            }`}
          >
            {isLoading ? 'Criando conta...' : 'Criar minha conta'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default Cadastro
