import { useState } from 'react'
import type { FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { cadastrarUsuario } from '../../services/Service'
import type Usuario from '../../models/Usuario'
import { ToastAlerta } from '../../utils/ToastAlerta'

type CadastroForm = Omit<Usuario, 'id'> & { confirmarSenha: string }

function Cadastro() {
  const navigate = useNavigate()
  const [form, setForm] = useState<CadastroForm>({ nome: '', usuario: '', senha: '', confirmarSenha: '', celular: '', foto: '', sexo: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  function updateField(field: keyof CadastroForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.nome.trim() || !form.usuario.trim() || !form.senha || !form.celular.trim() || !form.sexo) return setError('Preencha todos os campos obrigatórios.')
    if (form.senha !== form.confirmarSenha) return setError('As senhas precisam ser iguais.')
    setIsLoading(true)
    try {
      const dados = {
        nome: form.nome,
        usuario: form.usuario,
        senha: form.senha,
        celular: form.celular,
        foto: form.foto,
        sexo: form.sexo,
      }
      await cadastrarUsuario('/usuarios', dados, () => undefined)
      ToastAlerta('Cadastro realizado com sucesso!', 'sucesso')
      navigate('/login')
    } catch (requestError) {
      const status = axios.isAxiosError(requestError) ? requestError.response?.status : undefined
      setError(status === 409 ? 'Este e-mail já está cadastrado.' : 'Não foi possível concluir o cadastro. Tente novamente.')
    } finally { setIsLoading(false) }
  }

  return (
    <section className="flex flex-1 items-center justify-center bg-[#f5efe4] px-5 py-10">
      <div className="w-full max-w-130 rounded-3xl bg-white p-7 shadow-[0_24px_70px_rgba(24,59,53,0.14)] sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-[#65736e] no-underline hover:text-[#0a0a0a]"><ArrowLeft size={18} /> Voltar para o login</Link>
        <div className="mt-8 flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d0d0d0] text-[#0a0a0a]"><CheckCircle size={25} weight="bold" /></span><div><h1 className="font-['Space_Grotesk'] text-3xl font-bold text-[#0a0a0a]">Crie sua conta</h1><p className="mt-1 text-sm text-[#65736e]">Faça parte de uma comunidade que compartilha caminhos.</p></div></div>
        <form onSubmit={submit} className="mt-8 grid gap-4 sm:grid-cols-2" noValidate>
          <label className="block text-sm font-semibold text-[#0a0a0a] sm:col-span-2">Nome completo<input required value={form.nome} onChange={(e) => updateField('nome', e.target.value)} autoComplete="name" placeholder="Como podemos chamar você?" className="form-input" /></label>
          <label className="block text-sm font-semibold text-[#0a0a0a] sm:col-span-2">E-mail<input required value={form.usuario} onChange={(e) => updateField('usuario', e.target.value)} type="email" autoComplete="email" placeholder="voce@email.com" className="form-input" /></label>
          <label className="block text-sm font-semibold text-[#0a0a0a]">Celular<input required value={form.celular} onChange={(e) => updateField('celular', e.target.value)} type="tel" autoComplete="tel" placeholder="(11) 98877-6655" className="form-input" /></label>
          <label className="block text-sm font-semibold text-[#0a0a0a]">Foto <span className="font-normal text-[#89958f]">(opcional)</span><input value={form.foto} onChange={(e) => updateField('foto', e.target.value)} type="url" placeholder="https://..." className="form-input" /></label>
          <label className="block text-sm font-semibold text-[#0a0a0a]">Senha<input required value={form.senha} onChange={(e) => updateField('senha', e.target.value)} type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" className="form-input" /></label>
          <label className="block text-sm font-semibold text-[#0a0a0a]">Confirmar senha<input required value={form.confirmarSenha} onChange={(e) => updateField('confirmarSenha', e.target.value)} type="password" autoComplete="new-password" placeholder="Repita sua senha" className="form-input" /></label>
          <label className="block text-sm font-semibold text-[#0a0a0a] sm:col-span-2">Sexo<select required value={form.sexo} onChange={(e) => updateField('sexo', e.target.value)} className="form-input"><option value="">Selecione uma opção</option><option value="f">Feminino</option><option value="m">Masculino</option><option value="outro">Outro</option></select></label>
          {error && <p role="alert" className="text-sm font-medium text-[#b42318] sm:col-span-2">{error}</p>}
          <button disabled={isLoading} className="mt-2 h-12 rounded-xl bg-[#0a0a0a] font-bold text-white transition hover:bg-[#1a1a1a] disabled:cursor-wait disabled:opacity-60 sm:col-span-2">{isLoading ? 'Criando conta...' : 'Criar minha conta'}</button>
        </form>
      </div>
    </section>
  )
}

export default Cadastro