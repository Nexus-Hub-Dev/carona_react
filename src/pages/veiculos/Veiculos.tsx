import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import type { Veiculo } from '../../models/Veiculo';
import { salvarVeiculos, obterVeiculos } from '../../utils/veiculos';
import { listarVeiculos } from '../../services/Service';
import { AuthContext } from '../../contexts/AuthContext';

export function Veiculos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useContext(AuthContext);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregandoVeiculos, setCarregandoVeiculos] = useState(true);
  const [veiculoEditando, setVeiculoEditando] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');

  useEffect(() => {
    let montado = true;

    async function carregarVeiculos() {
      try {
        const veiculosDoBackend = await listarVeiculos(usuario.token);
        if (montado) setVeiculos(veiculosDoBackend);
      } catch {
        if (montado) setVeiculos(obterVeiculos());
      } finally {
        if (montado) setCarregandoVeiculos(false);
      }
    }

    carregarVeiculos();

    return () => {
      montado = false;
    };
  }, [usuario.token]);

  function cadastrarVeiculo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const listaAtualizada = veiculoEditando === null
      ? [...veiculos, { id: Date.now(), modelo, placa, cor, ativo: veiculos.length === 0 }]
      : veiculos.map((veiculo) => veiculo.id === veiculoEditando ? { ...veiculo, modelo, placa, cor } : veiculo);

    salvarVeiculos(listaAtualizada);
    setVeiculos(listaAtualizada);

    const destinoDepoisDoCadastro = (location.state as { from?: string } | null)?.from;
    if (destinoDepoisDoCadastro) {
      navigate(destinoDepoisDoCadastro, { replace: true });
      return;
    }

    limparFormulario();
  }

  function limparFormulario() {
    setModelo('');
    setPlaca('');
    setCor('');
    setVeiculoEditando(null);
    setMostrarModal(false);
  }

  function iniciarEdicao(veiculo: Veiculo) {
    setVeiculoEditando(veiculo.id);
    setModelo(veiculo.modelo);
    setPlaca(veiculo.placa);
    setCor(veiculo.cor);
    setMostrarModal(true);
  }

  function removerVeiculo(id: number) {
    if (!window.confirm('Deseja realmente remover este veículo?')) return;

    const listaAtualizada = veiculos.filter((veiculo) => veiculo.id !== id);
    salvarVeiculos(listaAtualizada);
    setVeiculos(listaAtualizada);
    if (veiculoEditando === id) limparFormulario();
  }

  function abrirCadastro() {
    limparFormulario();
    setMostrarModal(true);
  }

  function alternarAtivo(id: number) {
    const listaAtualizada = veiculos.map((veiculo) => ({
      ...veiculo,
      ativo: veiculo.id === id,
    }));
    salvarVeiculos(listaAtualizada);
    setVeiculos(listaAtualizada);
  }

  return (
    <section className="flex flex-1 justify-center bg-[#F6F3EB] px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] shadow-sm">
          <div className="flex items-center justify-between gap-3 bg-black p-6">
            <div>
              <h2 className="text-xl font-black text-white">Meus veículos</h2>
              <p className="mt-1 text-sm text-gray-300">Escolha qual carro está disponível para oferecer caronas.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">{veiculos.length}</span>
          </div>
          <div className="space-y-3 p-6">
            {carregandoVeiculos ? (
              <p className="rounded-xl bg-white p-5 text-center text-sm font-semibold text-gray-500">Carregando veículos...</p>
            ) : veiculos.length === 0 ? (
              <p className="rounded-xl bg-white p-5 text-center text-sm font-semibold text-gray-500">Nenhum veículo cadastrado.</p>
            ) : veiculos.map((veiculo) => (
              <div key={veiculo.id} className="flex flex-col gap-4 rounded-xl border border-[#E2DDD3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-black">{veiculo.modelo}</h3>
                    {veiculo.ativo && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">ATIVO</span>}
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{veiculo.cor} · {veiculo.placa}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!veiculo.ativo && <button type="button" onClick={() => alternarAtivo(veiculo.id)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800">Ativar</button>}
                  <button type="button" onClick={() => iniciarEdicao(veiculo)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-gray-800 hover:bg-gray-100">Editar</button>
                  <button type="button" onClick={() => removerVeiculo(veiculo.id)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50">Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={abrirCadastro} className="mt-6 flex w-full items-center justify-center rounded-2xl border border-black bg-black px-6 py-5 text-sm font-black text-white shadow-sm transition hover:bg-[#1d1d1d]">
          + Adicionar veículo
        </button>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 z-60 grid place-items-center bg-black/55 px-4" role="dialog" aria-modal="true" aria-labelledby="veiculo-modal-titulo">
          <form onSubmit={cadastrarVeiculo} className="w-full max-w-lg rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Minha garagem</p>
                <h2 id="veiculo-modal-titulo" className="mt-1 text-2xl font-black text-black">{veiculoEditando === null ? 'Adicionar veículo' : 'Editar veículo'}</h2>
              </div>
              <button type="button" onClick={limparFormulario} aria-label="Fechar" className="grid h-9 w-9 place-items-center rounded-full text-xl text-gray-500 hover:bg-white hover:text-black">×</button>
            </div>
            <div className="mt-6 space-y-4">
              <label className="block text-sm font-bold text-black">Modelo<input required value={modelo} onChange={(event) => setModelo(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="Ex: Nissan Kicks" /></label>
              <label className="block text-sm font-bold text-black">Placa<input required value={placa} onChange={(event) => setPlaca(event.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal uppercase outline-none focus:border-black" placeholder="Ex: BRA2E19" /></label>
              <label className="block text-sm font-bold text-black">Cor<input required value={cor} onChange={(event) => setCor(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="Ex: Azul" /></label>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="submit" className="flex-1 rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800">{veiculoEditando === null ? 'Salvar veículo' : 'Salvar alterações'}</button>
              <button type="button" onClick={limparFormulario} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Veiculos;