import { useContext, useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Clock, GenderFemale, MapPin, Wheelchair } from '@phosphor-icons/react';
import { ToastAlerta } from '../../utils/ToastAlerta';
import type { Veiculo } from '../../models/Veiculo';
import { cadastrarViagem, calcularRota, listarVeiculos, type CalculoRota } from '../../services/Service';
import { AuthContext } from '../../contexts/AuthContext';

export function CriarCarona() {
  const navigate = useNavigate();
  const { usuario } = useContext(AuthContext);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  
  const agora = new Date();
  const dataMinima = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  // Busca os veículos dinamicamente do banco de dados
  useEffect(() => {
    let montado = true;

    async function carregarVeiculos() {
      try {
        const veiculosDoBackend = await listarVeiculos(usuario.token);
        if (montado) setVeiculos(veiculosDoBackend);
      } catch {
        if (montado) setVeiculos([]);
      }
    }

    if (usuario.token) {
      carregarVeiculos();
    }

    return () => {
      montado = false;
    };
  }, [usuario.token]);

  const veiculoAtivo = useMemo(() => veiculos.find((v) => v.ativo) ?? veiculos[0], [veiculos]);
  const [veiculoSelecionadoId, setVeiculoSelecionadoId] = useState<number | null>(null);

  useEffect(() => {
    if (veiculoAtivo && !veiculos.some((veiculo) => veiculo.id === veiculoSelecionadoId)) {
      setVeiculoSelecionadoId(veiculoAtivo.id);
    }
  }, [veiculos, veiculoAtivo, veiculoSelecionadoId]);

  const veiculoSelecionado = veiculos.find((veiculo) => veiculo.id === veiculoSelecionadoId) ?? veiculoAtivo;

  // Estados dos campos do Formulário
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [bairroDestino, setBairroDestino] = useState('');
  const [dataSaida, setDataSaida] = useState(dataMinima);
  const [horarioSaida, setHorarioSaida] = useState('');
  const [vagasDisponiveis, setVagasDisponiveis] = useState(3);
  const [calculoRota, setCalculoRota] = useState<CalculoRota | null>(null);
  const [calculandoRota, setCalculandoRota] = useState(false);
  const [erroCalculoRota, setErroCalculoRota] = useState('');
  
  // Preferências/Filtros
  const [apenasMulheres, setApenasMulheres] = useState(false);
  const [acessivelPcd, setAcessivelPcd] = useState(false);

  // Valor definido pelo motorista
  const [precoDigitado, setPrecoDigitado] = useState<string>('');

  async function atualizarCalculoRota() {
    if (!origem.trim() || !destino.trim()) return;

    setCalculandoRota(true);
    setErroCalculoRota('');

    try {
      const resultado = await calcularRota(origem.trim(), destino.trim(), usuario.token);
      setCalculoRota(resultado);
      setPrecoDigitado(resultado.valorSugerido.toFixed(2));
    } catch {
      setCalculoRota(null);
      setErroCalculoRota('Não foi possível calcular a rota. Confira os endereços e tente novamente.');
    } finally {
      setCalculandoRota(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.id) {
      ToastAlerta('Sua sessão não possui um usuário válido. Faça login novamente.', 'erro');
      return;
    }

    if (!veiculoSelecionado) {
      ToastAlerta('Você precisa cadastrar e ativar um veículo para oferecer caronas.', 'erro');
      return;
    }

    if (!origem || !destino || !dataSaida || !horarioSaida || !precoDigitado || !calculoRota) {
      ToastAlerta('Preencha todos os campos obrigatórios da rota!', 'erro');
      return;
    }

    if (dataSaida < dataMinima) {
      ToastAlerta('A data da viagem não pode ser anterior à data atual.', 'erro');
      return;
    }

    const valorTotal = Number(precoDigitado);
    if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
      ToastAlerta('Informe um valor de viagem maior que zero.', 'erro');
      return;
    }

    const dataHoraViagem = new Date(`${dataSaida}T${horarioSaida}:00`);
    if (Number.isNaN(dataHoraViagem.getTime()) || dataHoraViagem < new Date()) {
      ToastAlerta('A data e o horário da viagem devem ser atuais ou futuros.', 'erro');
      return;
    }

    if (apenasMulheres && usuario.genero && usuario.genero.toLowerCase() !== 'feminino') {
      ToastAlerta('Apenas motoristas do gênero feminino podem criar viagens somente para mulheres.', 'erro');
      return;
    }

    if (acessivelPcd && veiculoSelecionado.acessivelPcd !== true) {
      ToastAlerta('O veículo selecionado não está cadastrado como acessível para PCD.', 'erro');
      return;
    }

    const [hora, minuto] = horarioSaida.split(':').map(Number);
    const dataFormatada = `${dataSaida}T${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`;

    const novaCorrida = {
      partida: origem,
      destino,
      bairroDestino,
      data: dataFormatada,
      disponivelPCD: acessivelPcd,
      apenasMulheres,
      valorSugerido: calculoRota.valorSugerido,
      valorTotal,
      vagasDisponiveis,
      usuario: { id: usuario.id },
      veiculo: { id: veiculoSelecionado.id },
    };

    try {
      await cadastrarViagem(novaCorrida, usuario.token);
      ToastAlerta('Carona cadastrada e publicada com sucesso!', 'sucesso');
      navigate('/caronas');
      
      // Limpar Formulário
      setOrigem('');
      setDestino('');
      setBairroDestino('');
      setDataSaida(dataMinima);
      setHorarioSaida('');
      setPrecoDigitado('');
      setCalculoRota(null);
    } catch (error: any) {
      const dadosErro = error?.response?.data;
      const erros = dadosErro?.errors;
      const mensagemErros = Array.isArray(erros)
        ? erros.map((item: any) => item?.defaultMessage || item?.message || item).join(', ')
        : typeof erros === 'object' && erros !== null
          ? Object.values(erros).join(', ')
          : erros;
      const mensagem = typeof dadosErro === 'string'
        ? dadosErro
        : mensagemErros || dadosErro?.message || dadosErro?.error || dadosErro?.detail;
      
      console.error('Erro ao cadastrar carona:', {
        status: error?.response?.status,
        resposta: dadosErro,
        payload: novaCorrida,
      });
      ToastAlerta(mensagem || 'Não foi possível publicar a carona. Verifique os dados e tente novamente.', 'erro');
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EB] text-[#000000] font-sans py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* CABEÇALHO */}
        <div className="border-b pb-4">
