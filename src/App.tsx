import { useContext } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import { AuthContext } from "./contexts/AuthContext"
import Login from "./pages/login/Login"
import Cadastro from "./pages/cadastro/Cadastro"
import Home from "./pages/home/Home"
import { Caronas } from "./pages/caronas/Caronas"
import { CriarCarona } from "./pages/caronas/CriarCaronas"
import Veiculos from "./pages/veiculos/Veiculos"
import Perfil from "./pages/perfil/Perfil"
import ContaPage from "./pages/conta/ContaPage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { usuario } = useContext(AuthContext)
	const location = useLocation()

	if (!usuario.token) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	return children
}

function AppContent() {
	const { pathname } = useLocation()
	const isAuthenticationPage = pathname === "/login" || pathname === "/cadastro"

	return (
		<div className="flex min-h-screen flex-col">
				{!isAuthenticationPage && <Navbar />}
				<main className="flex flex-1 flex-col">
					<Routes>
						<Route path="/" element={<Navigate to="/login" replace />} />
						<Route path="/login" element={<Login />} />
						<Route path="/cadastro" element={<Cadastro />} />
						<Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
						<Route path="/caronas" element={<ProtectedRoute><Caronas /></ProtectedRoute>} />
						<Route path="/oferecer-carona" element={<ProtectedRoute><CriarCarona /></ProtectedRoute>} />
						<Route path="/veiculos" element={<ProtectedRoute><Veiculos /></ProtectedRoute>} />
						<Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
						<Route path="/historico-caronas" element={<ProtectedRoute><ContaPage titulo="Histórico de caronas" descricao="Consulte suas viagens oferecidas e reservadas." /></ProtectedRoute>} />
						<Route path="/dados-bancarios" element={<ProtectedRoute><ContaPage titulo="Dados bancários" descricao="Gerencie os dados usados para receber pelos seus trajetos." /></ProtectedRoute>} />
						<Route path="*" element={<ProtectedRoute><Navigate to="/home" replace /></ProtectedRoute>} />
					</Routes>
				</main>
				{!isAuthenticationPage && <Footer />}
		</div>
	)
}

function App() {
	return (
		<BrowserRouter>
			<AppContent />
		</BrowserRouter>
	)
}

export default App