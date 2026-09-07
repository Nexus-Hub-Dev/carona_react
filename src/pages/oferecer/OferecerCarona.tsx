import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export default function OferecerCarona() {
  const navigate = useNavigate()
  const [origem, setOrigem] = useState('')
  const [destino, setDestino] = useState('')
  const [horarioSaida, setHorarioSaida] = useState('')

  function publicarCarona(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/home')
  }

  return (
    <section className="flex flex-1 items-start justify-center bg-[#F6F3EB] px-4 py-10">
      <form onSubmit={publicarCarona} className="w-full max-w-2xl rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Visão do motorista</p>
        <h1 className="mt-1 text-2xl font-black text-black">Oferecer nova carona</h1>
        <p className="mt-2 text-sm text-gray-600">Informe o trajeto e o horário de saída para publicar sua viagem.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-black">Ponto de partida<input required value={origem} onChange={(event) => setOrigem(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="Ex: Avenida Paulista, 900" /></label>
          <label className="text-sm font-bold text-black">Destino<input required value={destino} onChange={(event) => setDestino(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="Ex: Faria Lima, 2777" /></label>
          <label className="text-sm font-bold text-black sm:col-span-2">Horário de saída<input required type="time" value={horarioSaida} onChange={(event) => setHorarioSaida(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
        </div>
        <button type="submit" className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800">Publicar carona</button>
      </form>
    </section>
  )
}
