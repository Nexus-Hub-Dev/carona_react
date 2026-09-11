import axios from "axios";
import type { Veiculo } from "../models/Veiculo";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

const authorizationHeader = (token: string) => ({
    Authorization: token.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`,
});


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
