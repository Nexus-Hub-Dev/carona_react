import axios from "axios";
import type { Veiculo } from "../models/Veiculo";
import { ToastAlerta } from "../utils/ToastAlerta";
import { STORAGE_KEY } from "../utils/authStorage";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

const authorizationHeader = (token: string) => ({
    Authorization: token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`,
});

// Em desenvolvimento local o back roda com banco H2 em memória: toda vez
// que ele reinicia, os tokens emitidos antes disso deixam de existir,
// mas a sessão salva no navegador continua lá. Sem isso, uma chamada
// autenticada falha (401) em silêncio — a tela cai pra um estado vazio,
// e parece que "a busca não funciona" quando na real é só sessão
// expirada. Duas mensagens de 401 NÃO são sessão expirada (são
// validação de negócio, com o próprio toast de quem chamou) e por isso
// ficam de fora: login com senha errada, e "senha atual incorreta" ao
// tentar trocar a senha no perfil.
const MENSAGENS_401_QUE_NAO_SAO_SESSAO_EXPIRADA = ['Usuário ou senha inválidos.', 'Senha atual incorreta.'];

api.interceptors.response.use(
    (resposta) => resposta,
    (erro) => {
        const mensagem = erro?.response?.data?.message;
        const eSessaoExpirada =
            erro?.response?.status === 401 && !MENSAGENS_401_QUE_NAO_SAO_SESSAO_EXPIRADA.includes(mensagem);

        if (eSessaoExpirada && window.location.pathname !== "/login") {
            localStorage.removeItem(STORAGE_KEY);
            ToastAlerta("Sua sessão expirou. Faça login novamente.", "erro");
            window.location.assign("/login");
        }

        return Promise.reject(erro);
    }
);


// ======================================================
// VIAGENS
// ======================================================

export interface CalculoRota {
    distanciaKm: number;
    tempoEstimadoMin: number;
    valorSugerido: number;
}

export const calcularRota = async (
    partida: string,
    destino: string,
    token: string
): Promise<CalculoRota> => {
    const resposta = await api.post(
        "/viagens/sugestao-valor",
        { partida, destino },
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};

export const cadastrarViagem = async (
    dados: object,
    token: string
) => {
    const resposta = await api.post(
        "/viagens",
        dados,
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};

export const atualizarViagem = async (
    dados: object,
    token: string
) => {
    const resposta = await api.put(
        "/viagens",
        dados,
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};

export const removerViagem = async (
    id: number,
    token: string
): Promise<void> => {
    await api.delete(`/viagens/${id}`, {
        headers: authorizationHeader(token),
    });
};

export const listarViagens = async (
    token: string
): Promise<any[]> => {
    const resposta = await api.get("/viagens", {
        headers: authorizationHeader(token),
    });

    return resposta.data;
};


// ======================================================
// USUÁRIOS
// ======================================================

export const atualizarUsuario = async (
    id: number,
    dados: object,
    token: string
) => {
    const resposta = await api.put(
        "/usuarios/atualizar",
        {
            id,
            ...dados,
        },
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};

export const buscarUsuario = async (
    id: number,
    token: string
) => {
    const resposta = await api.get(
        `/usuarios/${id}`,
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};


// ======================================================
// AUTENTICAÇÃO / FUNÇÕES GENÉRICAS
// ======================================================

// Cadastrar usuário
export const cadastrarUsuario = async (
    url: string,
    dados: object,
    setDados: Function
) => {
    const resposta = await api.post(url, dados);

    setDados(resposta.data);
};


// Autenticar usuário
export const login = async (
    url: string,
    dados: object,
    setDados: Function
) => {
    const resposta = await api.post(url, dados);

    setDados(resposta.data);
};


// Consultar com token
export const buscar = async (
    url: string,
    setDados: Function,
    header: object
) => {
    const resposta = await api.get(url, header);

    setDados(resposta.data);
};


// Cadastrar com token
export const cadastrar = async (
    url: string,
    dados: object,
    setDados: Function,
    header: object
) => {
    const resposta = await api.post(
        url,
        dados,
        header
    );

    setDados(resposta.data);
};


// Atualizar com token
export const atualizar = async (
    url: string,
    dados: object,
    setDados: Function,
    header: object
) => {
    const resposta = await api.put(
        url,
        dados,
        header
    );

    setDados(resposta.data);
};


// Deletar com token
export const deletar = async (
    url: string,
    header: object
): Promise<void> => {
    await api.delete(url, header);
};


// ======================================================
// VEÍCULOS
// ======================================================

export type DadosVeiculo = Omit<
    Veiculo,
    "id" | "ativo"
>;


// Listar veículos
export const listarVeiculos = async (
    token: string
): Promise<Veiculo[]> => {
    const resposta = await api.get(
        "/veiculos",
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};


// Cadastrar veículo
export const cadastrarVeiculo = async (
    dados: DadosVeiculo,
    token: string
): Promise<Veiculo> => {
    const resposta = await api.post(
        "/veiculos",
        dados,
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};


// Atualizar veículo
export const atualizarVeiculo = async (
    dados: Veiculo,
    token: string
): Promise<Veiculo> => {

    const {
        ativo: _ativo,
        ...dadosApi
    } = dados;

    const resposta = await api.put(
        "/veiculos",
        dadosApi,
        {
            headers: authorizationHeader(token),
        }
    );

    return resposta.data;
};


// Remover veículo
export const removerVeiculo = async (
    id: number,
    token: string
): Promise<void> => {

    await api.delete(
        `/veiculos/${id}`,
        {
            headers: authorizationHeader(token),
        }
    );
};

// ======================================================
// RESERVAS (solicitações de carona)
// ======================================================

export interface Reserva {
  id: number;
  viagemId: number;
  passageiroId: number;
  status: 'pendente' | 'aceita' | 'recusada' | 'cancelada';
  motivo: string | null;
  criadoEm: string;
  atualizadoEm: string;
  viagem: any;
  passageiro: { id: number; nome: string; foto: string } | null;
}

// Solicitar uma vaga numa carona (fica pendente até o motorista aceitar).
export const solicitarReserva = async (
  viagemId: number,
  token: string
): Promise<Reserva> => {
  const resposta = await api.post(
    "/reservas",
    { viagemId },
    { headers: authorizationHeader(token) }
  );

  return resposta.data;
};

// Solicitações que EU fiz como passageiro/a.
export const listarMinhasSolicitacoes = async (
  token: string
): Promise<Reserva[]> => {
  const resposta = await api.get("/reservas/minhas", {
    headers: authorizationHeader(token),
  });

  return resposta.data;
};

// Solicitações recebidas nas caronas que EU ofereço.
export const listarSolicitacoesRecebidas = async (
  token: string
): Promise<Reserva[]> => {
  const resposta = await api.get("/reservas/recebidas", {
    headers: authorizationHeader(token),
  });

  return resposta.data;
};

export const aceitarSolicitacao = async (
  id: number,
  token: string
): Promise<Reserva> => {
  const resposta = await api.put(
    `/reservas/${id}/aceitar`,
    {},
    { headers: authorizationHeader(token) }
  );

  return resposta.data;
};

export const recusarSolicitacao = async (
  id: number,
  token: string
): Promise<Reserva> => {
  const resposta = await api.put(
    `/reservas/${id}/recusar`,
    {},
    { headers: authorizationHeader(token) }
  );

  return resposta.data;
};

export const cancelarSolicitacao = async (
  id: number,
  token: string
): Promise<Reserva> => {
  const resposta = await api.delete(`/reservas/${id}`, {
    headers: authorizationHeader(token),
  });

  return resposta.data;
};

// ======================================================
// CHAT DA RESERVA
// ======================================================

export interface MensagemChat {
  id: number;
  reservaId: number;
  autorId: number;
  texto: string;
  criadoEm: string;
  autor: { id: number; nome: string; foto: string } | null;
}

export const listarMensagens = async (
  reservaId: number,
  token: string
): Promise<MensagemChat[]> => {
  const resposta = await api.get(`/reservas/${reservaId}/mensagens`, {
    headers: authorizationHeader(token),
  });

  return resposta.data;
};

export const enviarMensagem = async (
  reservaId: number,
  texto: string,
  token: string
): Promise<MensagemChat> => {
  const resposta = await api.post(
    `/reservas/${reservaId}/mensagens`,
    { texto },
    { headers: authorizationHeader(token) }
  );

  return resposta.data;
};

//feat_Mapa: Função gerarMapa
export const gerarMapa = async (startCoordinates: [number, number], endCoordinates: [number, number]) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoordinates[0]},${startCoordinates[1]};${endCoordinates[0]},${endCoordinates[1]}?overview=full&geometries=geojson`
    const response = await axios.get(url)
    return response.data.routes[0].geometry.coordinates
  } catch (error) {
    console.error('Erro ao obter a rota', error)
    throw error
  }
}
