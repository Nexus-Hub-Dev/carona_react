import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

export interface CalculoRota {
    distanciaKm: number
    tempoMinutos: number
    horarioChegada: string
}

export const calcularRota = async (origem: string, destino: string, token: string): Promise<CalculoRota> => {
    const resposta = await api.post('/viagens/sugestao-valor', { origem, destino }, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return resposta.data
}

export const atualizarUsuario = async (id: number, dados: object, token: string) => {
    const resposta = await api.put(`/usuarios/${id}`, dados, {
        headers: { Authorization: `Bearer ${token}` }
    })
    return resposta.data
}

// Função  cadastrar Usuario

export const cadastrarUsuario = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados)
    setDados(resposta.data)
}

// Função  autenticar Usuario

export const login = async (url: string, dados: Object, setDados: Function) => {
    const resposta = await api.post(url, dados)
    setDados(resposta.data)
}

// Função consultar com token
export const buscar = async (url: string, setDados: Function, header: Object) => {
    const resposta = await api.get(url, header)
    setDados(resposta.data)
}

// Função cadastrar com token
export const cadastrar = async (url: string, dados: Object, setDados: Function, header: Object) => {
    const resposta = await api.post(url, dados, header)
    setDados(resposta.data)
}

// Função atualizar com token
export const atualizar = async (url: string, dados: Object, setDados: Function, header: Object) => {
    const resposta = await api.put(url, dados, header)
    setDados(resposta.data)
}

// Função Deletar com token

export const deletar = async (url: string, header: Object) => {
    await api.delete(url, header)
}