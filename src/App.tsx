import { useContext } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import { VLibras } from "./components/vlibras/VLibras" // 1. Importação do seu componente VLibras
import { AuthContext, AuthProvider } from "./contexts/AuthContext"
import { useNotificacoesReservas } from "./hooks/useNotificacoesReservas"

import Cadastro from "./pages/cadastro/Cadastro"
import { Caronas } from "./pages/caronas/Caronas"
import { CriarCarona } from "./pages/caronas/CriarCaronas"
import ContaPage from "./pages/conta/ContaPage"
import Home from "./pages/home/Home"
import LandingPage from "./pages/landing/LandingPage"
import Login from "./pages/login/Login"
import Perfil from "./pages/perfil/Perfil"
import MinhasSolicitacoes from "./pages/solicitacoes/MinhasSolicitacoes"
import Sobre from "./pages/sobre/Sobre"
import Veiculos from "./pages/veiculos/Veiculos"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { usuario } = useContext(AuthContext)
  const location = useLocation()

  if (!usuario?.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <>{children}</>
}

function AppContent() {
  const { pathname } = useLocation()

  // Roda em qualquer página autenticada (o hook mesmo já checa se há
  // usuário logado) — pedido de carona recebido ou resposta a um pedido
  // feito viram toast na hora, sem precisar estar com "Minhas
  // solicitações" aberta.
  useNotificacoesReservas()

  // "/" (landing pública), "/login" e "/cadastro" não usam a navbar
  // autenticada. A landing, porém, é uma página de rolagem longa como a
  // Home — faz sentido manter o rodapé nela, diferente das telas de
  // login/cadastro (centralizadas, sem rodapé).
  const escondeNavbar =
    pathname === "/" || pathname === "/login" || pathname === "/cadastro"
  const escondeFooter =
    pathname === "/login" || pathname === "/cadastro"

  return (
    <div className="flex min-h-screen flex-col">
      {!escondeNavbar && <Navbar />}

      <main className="flex flex-1 flex-col">
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/cadastro"
            element={<Cadastro />}
          />

          {/* Rotas protegidas */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/caronas"
            element={
              <ProtectedRoute>
                <Caronas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/oferecer-carona"
            element={
              <ProtectedRoute>
                <CriarCarona />
              </ProtectedRoute>
            }
          />

          <Route
            path="/veiculos"
            element={
              <ProtectedRoute>
                <Veiculos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sobre"
            element={
              <ProtectedRoute>
                <Sobre />
              </ProtectedRoute>
            }
          />

          <Route
            path="/historico-caronas"
            element={
              <ProtectedRoute>
                <MinhasSolicitacoes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dados-bancarios"
            element={
              <ProtectedRoute>
                <ContaPage
                  titulo="Dados bancários"
                  descricao="Gerencie os dados usados para receber pelos seus trajetos."
                />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Navigate to="/home" replace />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!escondeFooter && <Footer />}

      {/* limit=1: evita toasts sobrepostos quando duas ações disparam alerta em
          sequência rápida (ex: deslogar e logar de novo). */}
      <ToastContainer limit={1} />
      
      {/* 2. Adicionado aqui ao final do layout */}
      <VLibras />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App