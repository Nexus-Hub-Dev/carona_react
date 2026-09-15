import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// AuthProvider e ToastContainer ficam em App.tsx — aqui havia uma segunda
// cópia dos dois, o que duplicava os toasts na tela.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
