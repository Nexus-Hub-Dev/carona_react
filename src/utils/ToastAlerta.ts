import { toast, type ToastOptions } from 'react-toastify';

// Tema "light" (texto escuro sobre branco, barra colorida) em vez de
// "colored": o texto branco sobre verde/azul do tema colorido ficava
// abaixo de 4.5:1 e as cores fugiam da paleta neutra. Pausar no hover e
// ao perder o foco dá tempo de ler; sem isso o aviso some em 5s.
// Exportado para quem precisa de uma opção do react-toastify que
// ToastAlerta não expõe (ex.: onClick, usado nas notificações de
// reserva) mas quer manter a mesma aparência/comportamento.
export const opcoesToastPadrao: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
    draggable: true,
    theme: 'light',
};

export function ToastAlerta(mensagem: string, tipo: 'sucesso' | 'erro' | 'info' = 'info') {
    switch (tipo) {
        case 'sucesso':
            toast.success(mensagem, opcoesToastPadrao);
            break;
        case 'erro':
            toast.error(mensagem, opcoesToastPadrao);
            break;
        case 'info':
        default:
            toast.info(mensagem, opcoesToastPadrao);
            break;
    }
}
