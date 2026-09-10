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
    <div className="enabled">
      <div id="vlibras-widget" className="vw-plugin-wrapper">
        <div className="vw-plugin-top-wrapper" />
      </div>
    </div>
  );
};