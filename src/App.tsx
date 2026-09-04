import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom"
import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import Login from "./pages/login/Login"
import Cadastro from "./pages/cadastro/Cadastro"

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