import React, { useState } from 'react';
import { CaretDown, List, MagnifyingGlass, MapPin, Plus, UserCircle, X } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

const navItems = [
  { label: 'Buscar\nCaronas', path: '/caronas', icon: MapPin },
  { label: 'Oferecer\nCarona', path: '/oferecer-carona', icon: Plus },
  { label: 'Minhas\nViagens', path: '/minhas-caronas', icon: List },
  { label: 'Meus\nVeículos', path: '/veiculos', icon: UserCircle },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black px-4 text-white sm:px-6">
      <nav className="mx-auto flex min-h-19 max-w-300 items-center gap-5" aria-label="Navegação principal">
        <Link to="/" className="mr-3 shrink-0 text-2xl font-bold tracking-[-0.04em] text-white no-underline sm:mr-5">
          CORA
        </Link>

        <ul className="hidden h-full items-stretch gap-1 lg:flex">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link to={item.path} className={`flex min-w-26.5 items-center gap-2 rounded-full px-3 text-[13px] font-semibold leading-[1.15] no-underline transition-colors ${item.path === '/' ? 'bg-[#292929] text-white' : 'text-white hover:bg-[#1d1d1d]'}`}>
                <item.icon size={19} weight={item.path === '/' ? 'fill' : 'regular'} aria-hidden="true" />
                <span className="whitespace-pre-line">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <div className="flex h-11 w-59.5 items-center gap-2 rounded-full bg-[#292929] px-4 text-xs text-[#d0d0d0]">
            <MagnifyingGlass size={18} className="shrink-0 text-[#a7b2b8]" aria-hidden="true" />
            <span className="flex-1">Para onde você vai hoje?</span>
            <span className="rounded-full bg-[#3c3c3c] px-2 py-1 text-[10px] font-bold tracking-wide text-white">ROTAS</span>
          </div>
          <Link to="/oferecer-carona" className="flex h-11 min-w-34 items-center justify-center gap-2 rounded-full bg-white px-4 text-center text-xs font-bold leading-tight text-black no-underline transition hover:bg-[#e9e9e9]">
            <Plus size={18} weight="bold" aria-hidden="true" />
            Oferecer<br />Carona
          </Link>
          <button type="button" className="flex h-11 items-center gap-2 rounded-full border border-[#3b3b3b] px-2.5 text-xs font-semibold text-white" aria-label="Abrir perfil">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#7e9b91] text-black"><UserCircle size={23} weight="fill" aria-hidden="true" /></span>
            <span>Paula</span>
            <CaretDown size={13} aria-hidden="true" />
          </button>
        </div>

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

      {isOpen && (
        <div className="border-t border-white/10 bg-black pb-4 pt-2 lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link to={item.path} onClick={() => setIsOpen(false)} className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white no-underline hover:bg-[#292929]"><item.icon size={20} aria-hidden="true" /><span className="whitespace-pre-line">{item.label}</span></Link>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/oferecer-carona" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-black no-underline hover:bg-[#e9e9e9]"><Plus size={19} weight="bold" aria-hidden="true" />Oferecer carona</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;