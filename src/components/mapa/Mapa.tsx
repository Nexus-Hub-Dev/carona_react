import * as maplibre from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import type { Viagem } from '../../models/Viagem';
import { gerarMapa, buscar } from '../../services/Service';
import { ToastAlerta } from '../../utils/ToastAlerta';

interface MapaProps {
  id: string;
}

function Mapa({ id }: MapaProps) {
  const navigate = useNavigate();
  const [viagem, setViagem] = useState<Viagem>({} as Viagem);
  const [erroDoMapa, setErroDoMapa] = useState<string | null>(null);

  const mapaContainerRef = useRef<HTMLDivElement | null>(null);
  const mapaInstanciaRef = useRef<maplibre.Map | null>(null);
  const marcadoresRef = useRef<maplibre.Marker[]>([]);

  const { usuario, handleLogout, isLogout } = useContext(AuthContext);
  const token = usuario.token;

  const buscarViagemPorId = async (idViagem: string) => {
    try {
      await buscar(`/viagens/${idViagem}`, setViagem, {
        headers: { 'Authorization': token }
      });
    } catch (erro: any) {
      if (erro.toString().includes('401')) {
        handleLogout();
      } else {
        ToastAlerta('Erro ao localizar a viagem!', 'erro');
        navigate('/home');
      }
    }
  };

  const inicializarMapa = () => {
    if (!mapaContainerRef.current) return null;

    const mapa = new maplibre.Map({
      container: mapaContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [viagem.longitudePartida as number, viagem.latitudePartida as number],
      zoom: 13
    });

    mapa.addControl(new maplibre.NavigationControl());
    mapa.addControl(new maplibre.ScaleControl({ unit: 'metric' }));
    mapa.addControl(new maplibre.FullscreenControl());

    return mapa;
  };

  const desenharRotaNoMapa = async (
    mapa: maplibre.Map,
    coordenadasInicio: [number, number],
    coordenadasFim: [number, number]
  ) => {
    try {
      const rota = await gerarMapa(coordenadasInicio, coordenadasFim);

      if (!rota || rota.length === 0) return;

      if (mapa.getLayer('rota')) mapa.removeLayer('rota');
      if (mapa.getSource('rota')) mapa.removeSource('rota');

      mapa.addSource('rota', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: rota
          },
          properties: {}
        }
      });

      mapa.addLayer({
        id: 'rota',
        type: 'line',
        source: 'rota',
        paint: {
          'line-color': '#2563eb',
          'line-width': 5
        }
      });

      const limites = rota.reduce(
        (acumulador: maplibre.LngLatBounds, coordenada: [number, number]) =>
          acumulador.extend(coordenada),
        new maplibre.LngLatBounds(rota[0], rota[0])
      );

      mapa.fitBounds(limites, {
        padding: 40,
        duration: 1000
      });
    } catch (erro) {
      // Falha suave: se a API do OSRM bloquear, apenas ignoramos e a linha não aparece,
      // mas o mapa continua visível com os pinos de partida e destino!
      console.warn(`Rota não carregada para viagem ${id} (API ocupada)`);
    }
  };

  const adicionarMarcadores = (
    mapa: maplibre.Map,
    coordenadasInicio: [number, number],
    coordenadasFim: [number, number]
  ) => {
    marcadoresRef.current.forEach((marcador) => marcador.remove());
    marcadoresRef.current = [];

    const marcadorInicio = new maplibre.Marker({ color: '#b91c1c' })
      .setLngLat(coordenadasInicio)
      .addTo(mapa);
    marcadoresRef.current.push(marcadorInicio);

    const marcadorFim = new maplibre.Marker({ color: '#15803d' })
      .setLngLat(coordenadasFim)
      .addTo(mapa);
    marcadoresRef.current.push(marcadorFim);
  };

  useEffect(() => {
    if (token === '') {
      if (!isLogout) {
        ToastAlerta('Você precisa estar logado!', 'info');
        navigate('/');
      }
    }
  }, [token]);

  useEffect(() => {
    if (id) {
      buscarViagemPorId(id);
    }
  }, [id]);

  useEffect(() => {
    if (!viagem.id) return;

    if (!viagem.longitudePartida || !viagem.latitudePartida || !viagem.longitudeDestino || !viagem.latitudeDestino) {
      setErroDoMapa('Coordenadas indisponíveis para esta viagem.');
      return;
    }

    if (!mapaContainerRef.current) return;

    const coordenadasInicio: [number, number] = [
      viagem.longitudePartida as number,
      viagem.latitudePartida as number
    ];
    const coordenadasFim: [number, number] = [
      viagem.longitudeDestino as number,
      viagem.latitudeDestino as number
    ];

    if (mapaInstanciaRef.current) return;

    try {
      const mapa = inicializarMapa();
      if (!mapa) return;
      mapaInstanciaRef.current = mapa;

      mapa.on('load', () => {
        adicionarMarcadores(mapa, coordenadasInicio, coordenadasFim);

        // Atraso longo (entre 1s e 7s) para não engasgar a API pública do OSRM
        const atrasoAleatorio = Math.floor(Math.random() * 6000) + 1000;
        
        setTimeout(() => {
          desenharRotaNoMapa(mapa, coordenadasInicio, coordenadasFim);
        }, atrasoAleatorio);
      });

    } catch (erro) {
      console.error('Erro ao inicializar o mapa:', erro);
      setErroDoMapa('Erro ao inicializar o mapa.');
    }

    return () => {
      marcadoresRef.current.forEach((marcador) => marcador.remove());
      if (mapaInstanciaRef.current) {
        mapaInstanciaRef.current.remove();
        mapaInstanciaRef.current = null;
      }
    };
  }, [viagem]);

return erroDoMapa ? (
    <div className="flex items-center justify-center h-full w-full bg-[#FAF8F5] relative overflow-hidden rounded-xl">
      {/* Elemento de fundo decorativo pontilhado */}
      <div className="absolute inset-0 border-2 border-dashed border-gray-400/40 rounded-xl m-2 pointer-events-none"></div>
      
      {/* Conteúdo flutuante sem a caixa branca */}
      <div className="p-4 text-center z-10 flex flex-col items-center max-w-[90%]">
        {/* Carrinho animado com Tailwind */}
        <div className="text-4xl animate-bounce mb-2">🚗💨</div>
        
        <h2 className="text-sm font-black text-gray-800 mb-1">Ops! O carrinho se perdeu...</h2>
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
          {erroDoMapa === 'Coordenadas indisponíveis para esta viagem.' 
            ? 'Não achamos o caminho exato no GPS para essa carona.' 
            : erroDoMapa}
        </p>
      </div>
    </div>
  ) : (
    <div className="w-full h-full relative">
      <div ref={mapaContainerRef} className="w-full h-full absolute inset-0 rounded-xl overflow-hidden" />
    </div>
  );
}

export default Mapa;