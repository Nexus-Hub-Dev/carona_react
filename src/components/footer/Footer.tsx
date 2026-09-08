function App() {
  return (
    <div className="flex flex-col">

      {/* O resto do conteúdo da sua página entra aqui em cima */}
      <main className="flex-1">
        {/* ex: <h1>Bem-vindo</h1> */}
      </main>

      <footer className="border-t border-white/10 bg-black px-6 py-5 text-[#d0d0d0]">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-4">

          {/* Logo + Nome */}
          <div className="flex items-center gap-3">
            <img
              src="https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/Gemini_Generated_Image_obmllvobmllvobml.png"
              alt="Logo Carona"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
            />

            <span className="font-['Space_Grotesk'] text-lg font-bold tracking-[0.08em] text-white">
              Cora
            </span>
            
          </div>

          {/* Copyright + Nomes */}
          <div className="text-right text-xs">
            <p className="text-[#a7a7a7]">© 2026 Nexus Hub Dev.</p>
            <p className="text-[#686868]">Paula, Higor, Nayara, Thais, Guilherme, Edson, João.</p>
          </div>

        </div>
      </footer>
    </div>
  );
}

export default App;