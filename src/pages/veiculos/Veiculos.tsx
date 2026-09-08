import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { FormEvent } from 'react';
import type { Veiculo } from '../../models/Veiculo';
import { salvarVeiculos, obterVeiculos } from '../../utils/veiculos';
import { cadastrarVeiculo as cadastrarVeiculoApi, atualizarVeiculo as atualizarVeiculoApi, listarVeiculos, removerVeiculo as removerVeiculoApi } from '../../services/Service';
import { AuthContext } from '../../contexts/AuthContext';
import { ToastAlerta } from '../../utils/ToastAlerta';

function aplicarSelecaoLocal(veiculos: Omit<Veiculo, 'ativo'>[], veiculosSalvos: Veiculo[]): Veiculo[] {
  const idAtivo = veiculosSalvos.find((veiculo) => veiculo.ativo)?.id;
  return veiculos.map((veiculo, index) => ({
    ...veiculo,
    ativo: idAtivo === veiculo.id || (!idAtivo && index === 0),
  }));
}

function adaptarVeiculoSalvo(veiculo: Veiculo & { adaptadoPCD?: boolean }): Veiculo {
  return {
    ...veiculo,
    acessivelPcd: veiculo.acessivelPcd ?? veiculo.adaptadoPCD ?? false,
  };
}

export function Veiculos() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useContext(AuthContext);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [veiculoEditando, setVeiculoEditando] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [foto, setFoto] = useState('');
  const [cor, setCor] = useState('');
  const [capacidade, setCapacidade] = useState(1);
  const [acessivelPcd, setAcessivelPcd] = useState(false);

  useEffect(() => {
    if (!usuario.token) return;

    async function carregarVeiculos() {
      setCarregando(true);
      setErro('');

      try {
        const veiculosApi = await listarVeiculos(usuario.token);
        const veiculosComSelecao = aplicarSelecaoLocal(veiculosApi.map(adaptarVeiculoSalvo), obterVeiculos().map(adaptarVeiculoSalvo));
        setVeiculos(veiculosComSelecao);
        salvarVeiculos(veiculosComSelecao);
      } catch {
        setErro('Não foi possível carregar seus veículos. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    }

    void carregarVeiculos();
  }, [usuario.token]);

  async function cadastrarVeiculo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);

    try {
      const dados = { modelo: modelo.trim(), placa: placa.trim().toUpperCase(), foto: foto.trim(), cor: cor.trim(), capacidade, acessivelPcd };
      const veiculoSalvo = veiculoEditando === null
        ? await cadastrarVeiculoApi(dados, usuario.token)
        : await atualizarVeiculoApi({ id: veiculoEditando, ...dados, ativo: veiculos.find((veiculo) => veiculo.id === veiculoEditando)?.ativo ?? false }, usuario.token);
      const listaAtualizada = veiculoEditando === null
        ? [...veiculos, { ...veiculoSalvo, ativo: veiculos.length === 0 }]
        : veiculos.map((veiculo) => veiculo.id === veiculoEditando ? { ...veiculo, ...veiculoSalvo } : veiculo);

      salvarVeiculos(listaAtualizada);
      setVeiculos(listaAtualizada);

      const destinoDepoisDoCadastro = (location.state as { from?: string } | null)?.from;
      if (destinoDepoisDoCadastro) {
        navigate(destinoDepoisDoCadastro, { replace: true });
        return;
      }

      ToastAlerta(veiculoEditando === null ? 'Veículo cadastrado com sucesso!' : 'Veículo atualizado com sucesso!', 'sucesso');
      limparFormulario();
    } catch {
      ToastAlerta('Não foi possível salvar o veículo. Confira os dados e tente novamente.', 'erro');
    } finally {
      setSalvando(false);
    }
  }

  function limparFormulario() {
    setModelo('');
    setPlaca('');
    setFoto('');
    setCor('');
    setCapacidade(1);
    setAcessivelPcd(false);
    setVeiculoEditando(null);
    setMostrarModal(false);
  }

  function iniciarEdicao(veiculo: Veiculo) {
    setVeiculoEditando(veiculo.id);
    setModelo(veiculo.modelo);
    setPlaca(veiculo.placa);
    setFoto(veiculo.foto);
    setCor(veiculo.cor);
    setCapacidade(veiculo.capacidade);
    setAcessivelPcd(veiculo.acessivelPcd);
    setMostrarModal(true);
  }

  async function removerVeiculo(id: number) {
    if (!window.confirm('Deseja realmente remover este veículo?')) return;

    try {
      await removerVeiculoApi(id, usuario.token);
      const listaAtualizada = veiculos.filter((veiculo) => veiculo.id !== id);
      salvarVeiculos(listaAtualizada);
      setVeiculos(listaAtualizada);
      if (veiculoEditando === id) limparFormulario();
      ToastAlerta('Veículo removido com sucesso!', 'sucesso');
    } catch {
      ToastAlerta('Não foi possível remover o veículo.', 'erro');
    }
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
            {carregando ? (
              <p className="rounded-xl bg-white p-5 text-center text-sm font-semibold text-gray-500">Carregando veículos...</p>
            ) : erro ? (
              <p className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-700">{erro}</p>
            ) : veiculos.length === 0 ? (
              <p className="rounded-xl bg-white p-5 text-center text-sm font-semibold text-gray-500">Nenhum veículo cadastrado.</p>
            ) : veiculos.map((veiculo) => (
              <div key={veiculo.id} className="flex flex-col gap-4 rounded-xl border border-[#E2DDD3] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-black">{veiculo.modelo}</h3>
                    {veiculo.ativo && <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">ATIVO</span>}
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{veiculo.cor} · {veiculo.placa} · {veiculo.capacidade} lugares</p>
                  {veiculo.acessivelPcd && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">Acessível para PCD</p>}
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
              <label className="block text-sm font-bold text-black">Placa<input required maxLength={7} pattern="^[A-Z]{3}-?[0-9]{4}$|^[A-Z]{3}-?[0-9][A-Z][0-9]{2}$" value={placa} onChange={(event) => setPlaca(event.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal uppercase outline-none focus:border-black" placeholder="Ex: QXO2M22" /></label>
              <label className="block text-sm font-bold text-black">Foto (URL)<input type="url" value={foto} onChange={(event) => setFoto(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="https://..." /></label>
              <label className="block text-sm font-bold text-black">Cor<input required value={cor} onChange={(event) => setCor(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" placeholder="Ex: Azul" /></label>
              <label className="block text-sm font-bold text-black">Capacidade<input required type="number" min={1} value={capacidade} onChange={(event) => setCapacidade(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[#E2DDD3] bg-white px-3 py-3 font-normal outline-none focus:border-black" /></label>
              <label className="flex items-center gap-3 text-sm font-bold text-black"><input type="checkbox" checked={acessivelPcd} onChange={(event) => setAcessivelPcd(event.target.checked)} className="h-4 w-4 accent-black" /> Acessível para PCD</label>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="submit" disabled={salvando} className="flex-1 rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60">{salvando ? 'Salvando...' : veiculoEditando === null ? 'Salvar veículo' : 'Salvar alterações'}</button>
              <button type="button" onClick={limparFormulario} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

export default Veiculos;