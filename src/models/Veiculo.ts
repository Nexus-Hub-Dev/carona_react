export interface Veiculo {
	id: number;
	modelo: string;
	placa: string;
	cor: string;
	ativo: boolean;
	acessivelPcd?: boolean;
}
