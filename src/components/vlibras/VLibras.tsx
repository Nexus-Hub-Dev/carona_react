import React, { useEffect } from 'react';

// Declaramos a interface para evitar erros de tipo no 'window.VLibras'
declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => void;
    };
  }
}

export const VLibras: React.FC = () => {
  useEffect(() => {
    const scriptId = 'vlibras-script';

    // Evita a injeção duplicada do script em re-renders
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;

    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    // Escondido no celular: o botão flutuante do VLibras se posiciona
    // sozinho (é injetado pelo script do governo) e, em telas pequenas,
    // acaba flutuando por cima de cards e conteúdo. A partir de sm
    // (tablets/desktop) ele tem espaço de sobra e volta a aparecer —
    // continua acessível por lá.
    //
    // O "hidden"/"sm:block" fica num wrapper neutro por fora — nunca na
    // mesma div que leva a classe "enabled" (essa o próprio script do
    // VLibras estiliza). display:none num ancestral sempre esconde os
    // descendentes, então não corre risco de perder uma disputa de
    // especificidade CSS com o estilo injetado pelo widget.
    <div className="hidden sm:block">
      <div className="enabled">
        <div id="vlibras-widget" className="vw-plugin-wrapper">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
    </div>
  );
};