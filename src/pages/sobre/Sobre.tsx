```tsx
import {
  MapPin,
  ArrowRight,
  SteeringWheel,
  MapTrifold,
  RoadHorizon,
} from '@phosphor-icons/react';

const teamMembers = [
  {
    name: 'Paula Leão',
    role: 'Desenvolvedora Full Stack',
    city: 'São Paulo, SP',
    emoji: '💻',
    description:
      'Movida pela curiosidade de entender como as coisas funcionam — do universo à lógica dos algoritmos — encontrei na tecnologia o espaço ideal para construir soluções reais através do código. Embora minha base venha da Engenharia, a paixão pela computação falou mais alto e hoje uso essa mentalidade analítica para criar soluções completas com Java e desenvolvimento Full Stack. Certificações em andamento: CCST e AWS Cloud Practitioner.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/Paula_Leao.png?updatedAt=1787577575005',
    portfolioUrl: 'https://paularegina396-ai.github.io/portifolio/',
  },
  {
    name: 'Nayara Bastos',
    role: 'Desenvolvedora Full Stack',
    city: 'São Paulo, SP',
    emoji: '💻',
    description:
      'Graduanda em Análise e Desenvolvimento de Sistemas e participante do Bootcamp Java da Generation Brasil. Focada no desenvolvimento Java Full Stack para criação de soluções completas e escaláveis, unindo boas práticas de código à segurança com a certificação CCST.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/nayara_bastos.png?updatedAt=1787577575093',
    portfolioUrl: 'https://nayarabastos.github.io/Portifolio/',
  },
  {
    name: 'Thais Santana',
    role: 'Desenvolvedora Full Stack',
    city: 'São Paulo, SP',
    emoji: '💻',
    description:
      'Bacharel em Administração de Empresas migrando com entusiasmo para a tecnologia. Apaixonada por resolver problemas e transformar ideias em código limpo e soluções inovadoras, um commit de cada vez.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/thais_santana.jpg?updatedAt=1787577574971',
    portfolioUrl: 'https://thaissantanaa.github.io/portfolio/',
  },
  {
    name: 'Higor Damasceno',
    role: 'Desenvolvedor Full Stack',
    city: 'São Paulo, SP',
    emoji: '💻',
    description:
      'Com sólida bagagem como QA Pleno em automação e garantia de qualidade, direciono minha atuação para o Desenvolvimento de software com foco em Java e ecossistema Full Stack. Aplico boas práticas, Orientação a Objetos e arquitetura limpa para construir APIs robustas, confiáveis e de fácil manutenção.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/higor_damasceno.png?updatedAt=1787577575121',
    portfolioUrl: 'https://higormu2.github.io/Portifolio_Frontend/',
  },
  {
    name: 'Guilherme Sandoli',
    role: 'Desenvolvedor Full Stack',
    city: 'São Paulo, SP',
    emoji: '💻',
    description:
      'Desenvolvedor Full Stack Java em formação (USJT & Generation Brasil). Prática sólida na criação de APIs REST com Spring Boot, Spring Security/JWT e MySQL, aplicando MVC e boas práticas de POO. Experiência prévia como instrutor de robótica e lógica de programação.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/guilherme_sandoli.png?updatedAt=1787577575273',
    portfolioUrl: 'https://guitxc.github.io/portifolio_t/',
  },
  {
    name: 'Edson Nascimento',
    role: 'Desenvolvedor Full Stack',
    city: 'São Paulo, SP',
    emoji: '💻',
    description:
      'Desenvolvedor Full Stack Java formado pela Generation Brasil. Capacitado na construção de aplicações web de ponta a ponta, desenvolvimento de APIs RESTful com Spring Boot, modelagem de banco de dados e integração com front-end moderno, sempre priorizando código limpo e trabalho colaborativo.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/edson_nascimento.jpg?updatedAt=1787577574969',
    portfolioUrl: 'https://dinhovdp.github.io/portifolio/',
  },
  {
    name: 'João Ribeiro',
    role: 'Desenvolvedor Full Stack',
    city: 'Rio de Janeiro, RJ',
    emoji: '💻',
    description:
      'Desenvolvedor com foco em Java e Python, cursando Engenharia de Software e o bootcamp Full Stack Java. Gosto de construir soluções que resolvem problemas operacionais reais — desde scripts de automação até aplicações completas. Sempre em busca do próximo aprendizado para codificar e colocar em produção.',
    image:
      'https://ik.imagekit.io/beakrg2dk/PI1%20-%20CRM/joao_ribeiro.jpg?updatedAt=1787577575328',
    portfolioUrl: 'https://jvribe.github.io/portfolio_generation/',
  },
];

function Sobre() {
  return (
    <div className="min-h-screen bg-gray-100 py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-6">

        {/* Logo Cora */}
        <img
          src="https://ik.imagekit.io/beakrg2dk/PI3/logo-preto.png?updatedAt=1788823341120"
          alt="Logo Cora"
          className="mx-auto mb-8 h-auto w-36 object-contain md:w-44"
        />

        {/* Cabeçalho da Página */}
        <div className="mb-16 text-center md:mb-24">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-500">
            Quem somos
          </span>

          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-tight text-black md:text-5xl">
            No banco de trás do Cora não tem segredo: tem um time de devs
            programando o seu próximo destino.
          </h1>
        </div>

        {/* Lista de Cards do Time */}
        <div className="flex flex-col gap-12">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className={`flex flex-col items-center gap-8 rounded-[2.5rem] border border-gray-200 bg-[#F8F6F0] p-8 shadow-sm md:flex-row md:gap-12 md:p-12 ${
                index % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >

              {/* Coluna da Imagem */}
              <div className="relative shrink-0">

                {/* Elementos decorativos */}
                <div className="absolute -left-4 -top-4 text-gray-400 opacity-60">
                  <SteeringWheel size={40} weight="light" />
                </div>

                <div className="absolute -bottom-2 -right-4 text-gray-400 opacity-60">
                  <MapTrifold size={48} weight="light" />
                </div>

                <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-gray-400 opacity-60">
                  <RoadHorizon size={32} weight="light" />
                </div>

                {/* Foto */}
                <img
                  src={member.image}
                  alt={`Foto de ${member.name}`}
                  className="relative z-10 h-48 w-48 rounded-full border-4 border-white object-cover shadow-md md:h-64 md:w-64"
                />
              </div>

              {/* Coluna do Texto */}
              <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">

                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    {member.role}
                  </span>

                  <span className="text-lg">
                    {member.emoji}
                  </span>
                </div>

                <h2 className="mb-3 text-3xl font-bold text-black md:text-4xl">
                  {member.name}
                </h2>

                <div className="mb-4 flex items-center gap-1.5 font-medium text-gray-600">
                  <MapPin
                    size={18}
                    weight="fill"
                    className="text-[#1e3a8a]"
                  />

                  {member.city}
                </div>

                <p className="mb-8 max-w-lg leading-relaxed text-gray-700">
                  {member.description}
                </p>

                <a
                  href={member.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-wide text-black transition-all hover:gap-3 hover:border-gray-600 hover:text-gray-600"
                >
                  Conheça meu portfólio

                  <ArrowRight size={16} weight="bold" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sobre;
```
