import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from "react-toastify"
import { AuthProvider } from "./contexts/AuthContext"
import Home from "./pages/home/Home"
import Sobre from "./pages/sobre/Sobre"
import Login from "./pages/login/Login"
import Cadastro from "./pages/cadastro/Cadastro"
import { Caronas } from "./pages/caronas/Caronas"
import { CriarCarona } from "./pages/caronas/CriarCaronas"

function AppContent() {
	const { pathname } = useLocation()
	const isAuthenticationPage = pathname === "/login" || pathname === "/cadastro"

	return (
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