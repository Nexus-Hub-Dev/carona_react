import { useContext } from "react"
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import { AuthProvider } from "./contexts/AuthContext"
import { AuthContext } from "./contexts/AuthContext"
import Cadastro from "./pages/cadastro/Cadastro"
import { Caronas } from "./pages/caronas/Caronas"
import { CriarCarona } from "./pages/caronas/CriarCaronas"
import ContaPage from "./pages/conta/ContaPage"
import Home from "./pages/home/Home"
import Login from "./pages/login/Login"
import Perfil from "./pages/perfil/Perfil"
import Veiculos from "./pages/veiculos/Veiculos"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
	const { usuario } = useContext(AuthContext)
	const location = useLocation()

	if (!usuario.token) {
		return <Navigate to="/login" replace state={{ from: location }} />
	}

	return children
}
import { Caronas } from "./pages/caronas/Caronas"
import { CriarCarona } from "./pages/caronas/CriarCaronas"
import Home from "./pages/home/Home"
import Login from "./pages/login/Login"
import Sobre from "./pages/sobre/Sobre"

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
		<>
			{!isAuthenticationPage && <Navbar />}
			<div className="min-h-[80vh]">
				<Routes>
					<Route path="/" element={<Navigate to="/home" replace />} />
					<Route path="/home" element={<Home />} />
					<Route path="/sobre" element={<Sobre />} />
					<Route path="/login" element={<Login />} />
					<Route path="/cadastro" element={<Cadastro />} />
					<Route path="/caronas" element={<Caronas />} />
					<Route path="/oferecer-carona" element={<CriarCarona />} />
				</Routes>
			</div>
			{!isAuthenticationPage && <Footer />}
		</>
	)
}

function App() {
	return (
		<AuthProvider>
			<ToastContainer />
			<BrowserRouter>
				<AppContent />
			</BrowserRouter>
		</AuthProvider>
	)
}

export default App