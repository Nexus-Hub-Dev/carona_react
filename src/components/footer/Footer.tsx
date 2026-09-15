function Footer() {
  return (
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
          <p className="text-white/70">© 2026 Nexus Hub Dev.</p>
          {/* Era #686868 sobre preto (~3.8:1, abaixo do mínimo de 4.5:1
              pra texto normal) — branco a 55% de opacidade sobre preto
              já passa. */}
          <p className="text-white/55">Paula, Higor, Nayara, Thais, Guilherme, Edson, João.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
