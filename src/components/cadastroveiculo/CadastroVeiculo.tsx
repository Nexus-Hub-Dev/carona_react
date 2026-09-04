import React from "react"

function CadastroVeiculo() {

    return (

        <div className="min-h-[80vh] bg-black px-4 py-8 text-white sm:px-6">

            <div className="mx-auto max-w-5xl">

                {/* Título */}

                <div className="mb-7">

                    <span className="mb-2 inline-block rounded-full bg-[#292929] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-300">

                        Meus veículos

                    </span>

                    <h1 className="text-3xl font-bold">

                        Cadastre seu veículo

                    </h1>

                    <p className="mt-2 text-sm text-gray-400">

                        Adicione seu veículo para começar a oferecer caronas.

                    </p>

                </div>


                {/* Conteúdo principal */}

                <div className="grid gap-6 lg:grid-cols-2">


                    {/* IMAGEM */}

                    <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">

                        <img
                            src="https://ik.imagekit.io/oiocs8j87/imagem-horizontal-para-interface-de-um-aplicativo.png?updatedAt=1788533042202"
                            alt="Veículo do aplicativo CORA"
                            className="h-full min-h-[420px] w-full object-cover"
                        />

                        {/* Gradiente sobre a imagem */}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        {/* Texto sobre a imagem */}

                        <div className="absolute bottom-6 left-6">

                            <p className="text-xl font-bold text-white">

                                Seu veículo, suas caronas.

                            </p>

                            <p className="mt-1 text-sm text-gray-300">

                                Faça parte da comunidade CORA.

                            </p>

                        </div>

                    </div>


                    {/* FORMULÁRIO */}

                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111111]">

                        <div className="border-b border-white/10 px-6 py-5">

                            <h2 className="font-semibold">

                                Informações do veículo

                            </h2>

                            <p className="mt-1 text-xs text-gray-500">

                                Preencha os dados abaixo

                            </p>

                        </div>


                        <form className="space-y-4 px-6 py-6">


                            {/* Marca */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-300">

                                    Marca

                                </label>

                                <input
                                    type="text"
                                    placeholder="Ex: Volkswagen"
                                    className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-white/30"
                                />

                            </div>


                            {/* Modelo */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-300">

                                    Modelo

                                </label>

                                <input
                                    type="text"
                                    placeholder="Ex: T-Cross"
                                    className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-white/30"
                                />

                            </div>


                            {/* Placa + Ano */}

                            <div className="grid grid-cols-2 gap-4">

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-300">

                                        Placa

                                    </label>

                                    <input
                                        type="text"
                                        placeholder="ABC1D23"
                                        maxLength={7}
                                        className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm uppercase text-white placeholder:text-gray-600 outline-none transition focus:border-white/30"
                                    />

                                </div>


                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-gray-300">

                                        Ano

                                    </label>

                                    <input
                                        type="number"
                                        placeholder="2022"
                                        className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-white/30"
                                    />

                                </div>

                            </div>


                            {/* Tipo de veículo */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-gray-300">

                                    Tipo de veículo

                                </label>

                                <select
                                    defaultValue=""
                                    className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm text-gray-400 outline-none transition focus:border-white/30"
                                >

                                    <option value="" disabled>

                                        Selecione

                                    </option>

                                    <option value="carro">

                                        Carro

                                    </option>

                                    <option value="moto">

                                        Moto

                                    </option>

                                    <option value="van">

                                        Van

                                    </option>

                                </select>

                            </div>


                            {/* Informação */}

                            <div className="rounded-xl bg-[#181818] px-4 py-3">

                                <p className="text-xs leading-5 text-gray-500">

                                    As informações do veículo serão utilizadas
                                    para identificação dentro da plataforma.

                                </p>

                            </div>


                            {/* Botão */}

                            <button
                                type="submit"
                                className="w-full rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-gray-200"
                            >

                                Cadastrar veículo

                            </button>


                        </form>

                    </div>

                </div>

            </div>

        </div>

    )

}

export default CadastroVeiculo

