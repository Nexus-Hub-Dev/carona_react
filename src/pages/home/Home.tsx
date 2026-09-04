import React from 'react';
import { MagnifyingGlass, CalendarBlank, Users, MapPin, Handshake, Leaf, Wheelchair, GenderFemale } from '@phosphor-icons/react';

function Home() {
  return (
    <>
      {/* SEÇÃO HERO  */}
    
      <div className="flex justify-center bg-[#F8F6F0] pt-16 pb-12 md:pt-24 md:pb-20">
        <div className="container grid grid-cols-1 md:grid-cols-2 gap-10 px-6 max-w-7xl items-center">
          
          {/* Conteúdo de Texto e Busca */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold w-fit border border-gray-200">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Viagens Disponíveis Hoje
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black">
              Vá mais longe, <br /> compartilhando o caminho.
            </h1>
            
            <p className="text-lg text-gray-600 max-w-md">
              Conectamos condutores e passageiros em rotas metropolitanas e intermunicipais com economia de até 70%, fomentando uma rede colaborativa e menor impacto urbano.
            </p>

            {/* Barra de Busca Mockada */}
            <div className="mt-4 flex flex-wrap lg:flex-nowrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <div className="h-3 w-3 rounded-full border-2 border-black"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Origem</span>
                  <input type="text" placeholder="São Paulo, SP" className="outline-none text-sm font-semibold w-full bg-transparent" defaultValue="São Paulo, SP" />
                </div>
              </div>
              <div className="hidden lg:block h-8 w-px bg-gray-200"></div>
              
              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <MapPin size={18} weight="bold" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Destino</span>
                  <input type="text" placeholder="Para onde vai?" className="outline-none text-sm font-semibold w-full bg-transparent" />
                </div>
              </div>
              <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <CalendarBlank size={18} weight="bold" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Data</span>
                  <span className="text-sm font-semibold">Hoje, 04 Abr</span>
                </div>
              </div>
              <div className="hidden lg:block h-8 w-px bg-gray-200"></div>

              <div className="flex flex-1 items-center gap-2 px-3 py-2">
                <Users size={18} weight="bold" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Passageiros</span>
                  <span className="text-sm font-semibold">1 pessoa</span>
                </div>
              </div>

              <button className="flex h-12 items-center justify-center gap-2 rounded-lg bg-black px-6 text-white font-bold transition hover:bg-gray-800">
                <MagnifyingGlass size={20} weight="bold" />
                Buscar
              </button>
            </div>
          </div>

          {/* Imagem da página home */}
          <div className="flex justify-center md:justify-end">
            <img 
              src="https://ik.imagekit.io/beakrg2dk/PI3/ilustracao-viagem.jpg" 
              alt="Imagem da página Home" 
              className="w-full max-w-lg rounded-2xl object-cover shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* SEÇÃO DE FLAGS: INCLUSÃO E SEGURANÇA  */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Nossos Filtros</span>
            <h2 className="text-3xl font-bold mt-2">Viagens com Segurança e Acessibilidade</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Flag PCD */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 w-fit rounded bg-[#1e3a8a] px-3 py-1.5 text-sm font-bold text-white">
                <Wheelchair size={20} weight="fill" />
                Apta para PCD
              </div>
              <h3 className="text-xl font-bold">Mobilidade para Todos</h3>
              <p className="text-gray-600 leading-relaxed">
                Filtre por veículos sinalizados como aptos para PCD. Esses carros possuem espaço adequado para acomodação de equipamentos de mobilidade, garantindo que o seu trajeto seja confortável e livre de barreiras.
              </p>
            </div>

            {/* Flag Mulheres */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 w-fit rounded bg-[#831843] px-3 py-1.5 text-sm font-bold text-white">
                <GenderFemale size={20} weight="fill" />
                Exclusivo Mulheres
              </div>
              <h3 className="text-xl font-bold">Rede de Apoio Feminina</h3>
              <p className="text-gray-600 leading-relaxed">
                Opção desenvolvida para promover um ambiente de tranquilidade. Ao ativar esta flag, a plataforma conecta exclusivamente motoristas mulheres a passageiras mulheres, criando uma comunidade mais segura.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE VANTAGENS */}
      <div className="bg-[#F8F6F0] py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Por que escolher o Cora</span>
            <h2 className="text-3xl font-bold mt-2">Mobilidade construída sobre confiança</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="flex flex-col gap-3 rounded-2xl bg-white shadow-sm p-8">
              <Handshake size={32} weight="fill" className="text-black" />
              <h3 className="text-lg font-bold">Comunidade Cora</h3>
              <p className="text-sm text-gray-600">Construímos uma rede focada em colaboração, onde passageiros e motoristas compartilham trajetos diários com respeito e pontualidade.</p>
            </div>
            
            <div className="flex flex-col gap-3 rounded-2xl bg-white shadow-sm p-8">
              <MagnifyingGlass size={32} weight="fill" className="text-black" />
              <h3 className="text-lg font-bold">Economia Garantida</h3>
              <p className="text-sm text-gray-600">Divida apenas os custos de combustível e pedágios, viajando por uma fração da tarifa de transportes convencionais.</p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-white shadow-sm p-8">
              <Leaf size={32} weight="fill" className="text-black" />
              <h3 className="text-lg font-bold">Menor Impacto Ambiental</h3>
              <p className="text-sm text-gray-600">Ao preencher assentos vazios, retiramos veículos de circulação diária e otimizamos o tráfego urbano coletivo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA INFERIOR  */}
      <div className="bg-gray-100 px-6 py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between rounded-3xl bg-black p-10 md:p-14 text-white">
            <div className="mb-6 md:mb-0 max-w-lg">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Vai viajar no seu carro?</span>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Ofereça carona e reduza seus custos</h2>
              <p className="mt-4 text-gray-400">Cadastre sua rota habitual ou próxima viagem intermunicipal em minutos e compense seus gastos de estrada com praticidade.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button className="rounded-lg bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200">
                Publicar Carona
              </button>
              <button className="rounded-lg border border-gray-700 bg-transparent px-6 py-3 font-bold text-white transition hover:bg-gray-800">
                Como funciona
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;