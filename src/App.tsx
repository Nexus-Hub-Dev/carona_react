import { BrowserRouter, Routes, Route } from "react-router-dom"
import Footer from "./components/footer/Footer"
import Navbar from "./components/navbar/Navbar"
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from "react-toastify"
import { AuthProvider } from "./contexts/AuthContext"

function App() {
	return (
		<AuthProvider>
			<ToastContainer/>
				<BrowserRouter>
					<Navbar />
					<div className="min-h-[80vh]">
						<Routes>
						</Routes>
					</div>
					<Footer />
				</BrowserRouter>
		</AuthProvider>
	)
}

export default App