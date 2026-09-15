// Compartilhado entre Cadastro (senha nova) e Perfil (senha atual, usada
// só pra confirmar a alteração) — evita que os dois divirjam sem
// querer. 8 pra bater com a regra do back real (Usuario.senha exige no
// mínimo 8 caracteres); as contas de demonstração usam "12345678".
export const SENHA_MINIMA = 8;
