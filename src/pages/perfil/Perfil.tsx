import { useContext, useState } from 'react';
import type { FormEvent } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function Perfil() {
  const { usuario, handleUpdateProfile } = useContext(AuthContext);
  const [nome, setNome] = useState(usuario.nome);
  const [usuarioLogin, setUsuarioLogin] = useState(usuario.usuario);
  const [celular, setCelular] = useState(usuario.celular);
  const [foto, setFoto] = useState(usuario.foto);
  const [salvando, setSalvando] = useState(false);

  async function salvarPerfil(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    await handleUpdateProfile({ nome, usuario: usuarioLogin, celular, foto });
    setSalvando(false);
  }

  return (
    <section className="flex flex-1 justify-center bg-[#F6F3EB] px-4 py-10">
      <form onSubmit={salvarPerfil} className="h-fit w-full max-w-2xl rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Minha conta</p>
        <h1 className="mt-1 text-2xl font-black text-black">Editar perfil</h1>
        <p className="mt-1 text-sm text-gray-600">Atualize seus dados cadastrais.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-black">Nome completo<input required value={nome} onChange={(event) => setNome(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
          <label className="text-sm font-bold text-black">E-mail<input required type="email" value={usuarioLogin} onChange={(event) => setUsuarioLogin(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
          <label className="text-sm font-bold text-black">Celular<input required value={celular} onChange={(event) => setCelular(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
          <label className="text-sm font-bold text-black">Foto (URL)<input value={foto} onChange={(event) => setFoto(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="https://..." /></label>
        </div>
        <button disabled={salvando} type="submit" className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60">{salvando ? 'Salvando...' : 'Salvar alterações'}</button>
      </form>
    </section>
  );
}