import axios from "axios";
import { createContext, useEffect, useState, type ReactNode } from "react";
import type UsuarioLogin from "../models/UsuarioLogin";
import { atualizarUsuario, login } from "../services/Service";
import { ToastAlerta } from "../utils/ToastAlerta";

const STORAGE_KEY = 'blogPessoalUsuario';

const usuarioInicial: UsuarioLogin = {
    id: 0,
    nome: '',
    usuario: '',
    senha: '',
    celular: '',
    foto: '',
    token: '',
};

const sanitizeUsuario = (usuario: Partial<UsuarioLogin>): UsuarioLogin => ({
    ...usuarioInicial,
    ...usuario,
    senha: '',
});

//  Definir os Estados e Funções disponibilizadas pela Context
interface AuthContextProps {
    usuario: UsuarioLogin
    handleLogin(usuario: UsuarioLogin): Promise<boolean>
    handleUpdateProfile(dados: Pick<UsuarioLogin, 'nome' | 'usuario' | 'celular' | 'foto'>): Promise<boolean>
    handleLogout(): void
    isLoading: boolean
    isLogout: boolean

}

// Quem irá consumir a context
interface AuthProviderProps {
    children: ReactNode
}

// Criar o contexto usando a tipagem AuthContextProps
// O contexto irá disponibilizar os estados e as funções globalmente
export const AuthContext = createContext({} as AuthContextProps)

// INicializar o provedor AuthProvider
// O provedor irá implementar as funções e inicializar os estados

export function AuthProvider({ children }: AuthProviderProps) {

    const [usuario, setUsuario] = useState<UsuarioLogin>(() => {
        const usuarioSalvo = localStorage.getItem(STORAGE_KEY);

        if (!usuarioSalvo) {
            return usuarioInicial;
        }

        try {
            const usuarioPersistido = JSON.parse(usuarioSalvo) as Partial<UsuarioLogin>;
            return sanitizeUsuario(usuarioPersistido);
        } catch {
            return usuarioInicial;
        }
    });
    // Inicializar o estado isLoading
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isLogout, setIsLogout] = useState(false)

    useEffect(() => {
        if (usuario.token !== '') {
            const usuarioSeguro = sanitizeUsuario(usuario);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarioSeguro));
            return;
        }

        localStorage.removeItem(STORAGE_KEY);
    }, [usuario])

    // Implementar a função handleLogin
    async function handleLogin(usuarioLogin: UsuarioLogin): Promise<boolean> {

        setIsLoading(true);

        try {
            await login(`/usuarios/logar`, usuarioLogin, (dados: UsuarioLogin) => {
                setUsuario(sanitizeUsuario(dados))
            })
            ToastAlerta("Usuário Autenticado com sucesso!", "sucesso")

            setIsLogout(false)
            return true

        } catch (error) {
            if (axios.isAxiosError(error)) {
                ToastAlerta(`Erro ao autenticar o usuário (${error.response?.status})`, "erro")
                return false
            }
            ToastAlerta('Não foi possível autenticar o usuário.', 'erro')
            return false
        } finally {
            setIsLoading(false)
        }

    }
    // Implementar a função handleLogout (desconectar o Usuario)
    function handleLogout() {

        setIsLogout(true)

        setUsuario(usuarioInicial)
        localStorage.removeItem(STORAGE_KEY)

        ToastAlerta('Usuario desconectado com sucesso!', 'sucesso');

    }

    async function handleUpdateProfile(dados: Pick<UsuarioLogin, 'nome' | 'usuario' | 'celular' | 'foto'>): Promise<boolean> {
        try {
            const usuarioAtualizado = await atualizarUsuario(usuario.id, dados, usuario.token)
            setUsuario(sanitizeUsuario({ ...usuario, ...usuarioAtualizado, ...dados, token: usuario.token }))
            ToastAlerta('Perfil atualizado com sucesso!', 'sucesso')
            return true
        } catch (error) {
            if (axios.isAxiosError(error)) {
                ToastAlerta(`Não foi possível atualizar o perfil (${error.response?.status})`, 'erro')
            } else {
                ToastAlerta('Não foi possível atualizar o perfil.', 'erro')
            }
            return false
        }
    }
    return (
        <AuthContext.Provider value={{ usuario, handleLogin, handleUpdateProfile, handleLogout, isLoading, isLogout }}>
            {children}
        </AuthContext.Provider>
    )


}