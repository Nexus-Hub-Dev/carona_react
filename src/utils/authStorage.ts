// Chave usada pra persistir a sessão logada no localStorage. Fica num
// arquivo à parte (em vez de só dentro de AuthContext) porque o
// interceptor de erros em Service.ts também precisa dela pra limpar uma
// sessão que o back-end não reconhece mais — e Service.ts não pode
// importar de AuthContext sem criar um ciclo (AuthContext já importa de
// Service.ts).
export const STORAGE_KEY = 'blogPessoalUsuario';
