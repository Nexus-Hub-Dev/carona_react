import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { buscarUsuario } from '../../services/Service';
import { calcularIdade } from '../../utils/idade';
import { OPCOES_GENERO } from '../../utils/opcoesPerfil';
import { SENHA_MINIMA } from '../../utils/validacao';

export default function Perfil() {
  const { usuario, handleUpdateProfile } = useContext(AuthContext);

  const [nomeReal, setNomeReal] = useState(usuario.nomeReal ?? '');
  const [nomeSocial, setNomeSocial] = useState(usuario.nomeSocial ?? '');
  const [comoChamar, setComoChamar] = useState(usuario.comoChamar ?? '');
  const [usuarioLogin, setUsuarioLogin] = useState(usuario.usuario);
  const [celular, setCelular] = useState(usuario.celular);
  const [celularOriginal, setCelularOriginal] = useState(usuario.celular);
  const [foto, setFoto] = useState(usuario.foto);
  const [genero, setGenero] = useState(usuario.genero ?? '');
  const [dataNascimento, setDataNascimento] = useState(usuario.dataNascimento ?? '');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!usuario.id || !usuario.token) return;

    buscarUsuario(usuario.id, usuario.token).then((dados) => {
      setNomeReal(dados.nomeReal ?? '');
      setNomeSocial(dados.nomeSocial ?? '');
      setComoChamar(dados.comoChamar ?? '');
      setUsuarioLogin(dados.usuario ?? '');
      setCelular(dados.celular ?? '');
      setCelularOriginal(dados.celular ?? '');
      setFoto(dados.foto ?? '');
      setGenero(dados.genero ?? '');
      setDataNascimento(dados.dataNascimento ?? '');
    }).catch(() => undefined);
  }, [usuario.id, usuario.token]);

  const idade = calcularIdade(dataNascimento);

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (senha.length < SENHA_MINIMA) {
      setErro(`Informe sua senha atual (pelo menos ${SENHA_MINIMA} caracteres) para confirmar a alteração.`);
      return;
    }
    setErro('');
    setSalvando(true);
    await handleUpdateProfile({
      nomeReal,
      nomeSocial,
      comoChamar,
      usuario: usuarioLogin,
      celular: celular.trim() || celularOriginal,
      foto,
      genero,
      dataNascimento,
      senha,
    });
    setSalvando(false);
  }

  return (
    <section className="flex flex-1 justify-center bg-bg px-4 py-10">
      <form onSubmit={salvarPerfil} className="h-fit w-full max-w-3xl rounded-2xl border border-border bg-surface-alt p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Minha conta</p>
        <h1 className="mt-1 text-2xl font-black text-ink">Editar perfil</h1>
        <p className="mt-1 text-sm text-muted">Atualize seus dados cadastrais.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <p className="text-xs font-black uppercase tracking-widest text-muted sm:col-span-2">Identidade</p>

          <label className="text-sm font-bold text-ink">Nome<input required value={nomeReal} onChange={(event) => setNomeReal(event.target.value)} className="form-input" /></label>
          <label className="text-sm font-bold text-ink">Nome social <span className="font-normal text-muted">(opcional)</span><input value={nomeSocial} onChange={(event) => setNomeSocial(event.target.value)} className="form-input" /></label>

          <label className="text-sm font-bold text-ink sm:col-span-2">Como deseja ser chamado <span className="font-normal text-muted">(opcional)</span><input value={comoChamar} onChange={(event) => setComoChamar(event.target.value)} placeholder="Como prefere ser chamado no app" className="form-input" /></label>

          <label className="text-sm font-bold text-ink">
            Gênero
            <select required value={genero} onChange={(event) => setGenero(event.target.value)} className="form-input">
              {OPCOES_GENERO.map((opcao) => <option key={opcao.value} value={opcao.value}>{opcao.label}</option>)}
            </select>
          </label>

          <label className="text-sm font-bold text-ink">Data de nascimento<input required type="date" value={dataNascimento} onChange={(event) => setDataNascimento(event.target.value)} className="form-input" /></label>
          <label className="text-sm font-bold text-ink">Idade
            <input disabled value={idade !== null ? `${idade} anos` : '—'} className="form-input cursor-not-allowed opacity-70" />
          </label>

          <label className="text-sm font-bold text-ink sm:col-span-2">Foto (URL) <span className="font-normal text-muted">(opcional)</span><input value={foto} onChange={(event) => setFoto(event.target.value)} type="url" placeholder="https://..." className="form-input" /></label>

          <p className="mt-2 text-xs font-black uppercase tracking-widest text-muted sm:col-span-2">Contato e acesso</p>

          <label className="text-sm font-bold text-ink">E-mail<input required type="email" value={usuarioLogin} onChange={(event) => setUsuarioLogin(event.target.value)} className="form-input" /></label>
          <label className="text-sm font-bold text-ink">Celular <span className="font-normal text-muted">(opcional)</span><input value={celular} onChange={(event) => setCelular(event.target.value)} type="tel" autoComplete="tel" placeholder="(11) 98877-6655" className="form-input" /></label>
          <label className="text-sm font-bold text-ink sm:col-span-2">Senha para confirmar<input required minLength={SENHA_MINIMA} value={senha} onChange={(event) => { setSenha(event.target.value); setErro(''); }} type="password" autoComplete="current-password" className="form-input" /></label>

          {erro && <p role="alert" className="text-sm font-medium text-danger sm:col-span-2">{erro}</p>}
        </div>

        <button disabled={salvando} type="submit" className="mt-6 w-full rounded-xl bg-ink px-5 py-3 font-bold text-white transition hover:bg-black disabled:cursor-wait disabled:opacity-60">{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
      </form>
    </section>
  );
}
