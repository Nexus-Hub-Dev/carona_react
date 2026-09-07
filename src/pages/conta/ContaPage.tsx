interface ContaPageProps {
  titulo: string;
  descricao: string;
}

export default function ContaPage({ titulo, descricao }: ContaPageProps) {
  return (
    <section className="flex flex-1 items-start justify-center bg-[#F6F3EB] px-4 py-10">
      <div className="w-full max-w-2xl rounded-2xl border border-[#E2DDD3] bg-[#EFECE6] p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black text-black">{titulo}</h1>
        <p className="mt-2 text-sm text-gray-600">{descricao}</p>
        <p className="mt-8 rounded-xl bg-white p-5 text-sm font-semibold text-gray-500">Esta área será conectada ao backend.</p>
      </div>
    </section>
  );
}