import React, { useContext, useState } from 'react';
import { CaretDown, List, MapPin, Plus, UserCircle, X, Info } from '@phosphor-icons/react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
 
const navItems = [
  { label: 'Buscar\nCaronas', path: '/caronas', icon: MapPin },
  { label: 'Veículos', path: '/veiculos', icon: UserCircle },
  { label: 'Sobre', path: '/sobre', icon: Info }
];
 
export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { usuario, handleLogout } = useContext(AuthContext);
  const location = useLocation();
 
  const nomeExibido = usuario?.nome?.length > 7 ? `${usuario.nome.slice(0, 7)}...` : usuario?.nome;
 
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black px-4 text-white sm:px-6">
      <nav className="mx-auto flex h-19 max-w-[1200px] items-center gap-5" aria-label="Navegação principal">
       
        {/* LOGO ATUALIZADA - REDIRECIONA PARA /home */}
        <Link to="/home" className="mr-3 shrink-0 sm:mr-5">
          <img
            src="https://ik.imagekit.io/beakrg2dk/PI3/navbar.png"
            alt="Cora Logo"
            className="h-8 object-contain"
          />
        </Link>
 
        {/* ITENS DE NAVEGAÇÃO */}
        <ul className="hidden h-full items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex h-11 min-w-[106px] items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold leading-[1.15] no-underline transition-colors ${
                    isActive ? 'bg-[#292929] text-white' : 'text-white hover:bg-[#1d1d1d]'
                  }`}
                >
                  <item.icon size={19} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                  <span className="whitespace-pre-line text-center">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
 
        {/* LADO DIREITO (BOTAO E PERFIL) */}
        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <Link to="/oferecer-carona" className="flex h-11 min-w-[136px] items-center justify-center gap-2 rounded-full bg-white px-4 text-center text-xs font-bold leading-tight text-black no-underline transition hover:bg-[#e9e9e9]">
            <Plus size={18} weight="bold" aria-hidden="true" />
            Oferecer<br />Carona
          </Link>
 
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex h-11 items-center gap-2 rounded-full border border-[#3b3b3b] px-2.5 text-xs font-semibold text-white"
              aria-label="Abrir perfil"
              aria-expanded={isProfileOpen}
            >
              <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-[#7e9b91] text-black">
                {usuario?.foto ? (
                  <img src={usuario.foto} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle size={23} weight="fill" aria-hidden="true" />
                )}
              </span>
              <span title={usuario?.nome || 'Meu perfil'}>{nomeExibido || 'Meu perfil'}</span>
              <CaretDown size={13} aria-hidden="true" />
            </button>
           
            {isProfileOpen && (
              <div className="absolute right-0 top-13 z-50 w-56 rounded-2xl border border-[#333] bg-[#171717] p-2 shadow-2xl">
                <Link to="/perfil" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#292929]">Editar perfil</Link>
                <Link to="/historico-caronas" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#292929]">Histórico de caronas</Link>
                <Link to="/dados-bancarios" onClick={() => setIsProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#292929]">Dados bancários</Link>
                <button type="button" onClick={handleLogout} className="mt-1 w-full rounded-xl border-t border-[#333] px-3 py-2.5 text-left text-sm font-semibold text-red-300 hover:bg-[#292929]">Sair</button>
              </div>
            )}
          </div>
        </div>
 
        {/* BOTAO HAMBURGER MOBILE */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto grid h-10 w-10 place-items-center rounded-lg text-white transition hover:bg-[#292929] lg:hidden"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} aria-hidden="true" /> : <List size={24} aria-hidden="true" />}
        </button>
      </nav>
 
      {/* MENU MOBILE */}
      {isOpen && (
        <div className="border-t border-white/10 bg-black pb-4 pt-2 lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link to={item.path} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-[#292929]">
                  <item.icon size={20} aria-hidden="true" />
                  <span className="whitespace-pre-line">{item.label}</span>
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/oferecer-carona" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-black no-underline hover:bg-[#e9e9e9]">
                <Plus size={19} weight="bold" aria-hidden="true" />
                Oferecer carona
              </Link>
            </li>
            <li className="mt-2 border-t border-white/10 pt-2">
              <Link to="/perfil" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-[#292929]">Editar perfil</Link>
              <Link to="/historico-caronas" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-[#292929]">Histórico de caronas</Link>
              <Link to="/dados-bancarios" onClick={() => setIsOpen(false)} className="block rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-[#292929]">Dados bancários</Link>
              <button type="button" onClick={handleLogout} className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-[#292929]">Sair</button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
 
export default Navbar;
 