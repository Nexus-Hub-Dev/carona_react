export interface Viagem {
	id: number
	motoristaNome: string
	badge?: string
	veiculoModelo: string
	veiculoPlaca: string
	origem: string
	bairroOrigem?: string
	destino: string
	bairroDestino?: string
	horarioSaida: string
	horarioChegada: string
	distanciaKm: number
	tempoMinutos: number
	velocidadeMedia?: number
	statusTransito?: string
	preco: number
	vagasDisponiveis: number

	// Adicionada 4 linhas:
	latitudePartida?: number
	longitudePartida?: number
	latitudeDestino?: number
	longitudeDestino?: number
}
