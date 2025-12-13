// Corrigindo as importações, removendo linhas de diff
import { useState, useEffect } from 'react';
import { Cloud, Clock, Shield, Settings, Database, ArrowRight, Users, Link, Archive, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link as RouterLink } from "react-router-dom";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
        }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className={`flex items-center gap-2 transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-gov-blue-800 to-gov-blue-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
              <Cloud className="text-white h-6 w-6" />
            </div>
            <span className={`text-xl font-montserrat font-bold tracking-tight ${isScrolled ? 'text-gov-blue-900' : 'text-white'} transition-colors`}>
              cmlm.tech
            </span>
          </div>
          <div className="flex items-center gap-4">
            <RouterLink to="/entrar">
              <Button
                className={`${isScrolled
                  ? 'bg-gov-blue-800 hover:bg-gov-blue-900 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm'
                  } p-2 md:px-6 md:py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
              >
                <LogIn className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Acesso ao Sistema</span>
              </Button>
            </RouterLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax-like fixed attachment */}
        <div
          className="absolute inset-0 z-0 bg-fixed"
          style={{
            backgroundImage: `url('https://itjlzbnrdileuapsqwwe.supabase.co/storage/v1/object/public/assets/background_home_final.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'top',
          }}
        />

        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gov-blue-900/95 via-gov-blue-800/90 to-blue-900/80 z-10" />

        {/* Animated Background Shapes */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative z-20 text-center text-white px-4 max-w-5xl mx-auto">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-fade-in">
            <span className="text-sm font-medium tracking-wider uppercase text-blue-100">Inovação na Gestão Pública</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-montserrat font-bold mb-8 leading-tight tracking-tight animate-fade-in [animation-delay:200ms]">
            Modernizando
            <br className="md:hidden" />
            <span className="hidden md:inline"> </span>
            o
            <span className="md:hidden"> </span>
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Poder
              <br className="md:hidden" />
              <span className="hidden md:inline"> </span>
              Legislativo
            </span>
          </h1>

          <p className="text-lg md:text-2xl font-light mb-10 max-w-3xl mx-auto text-blue-100/90 leading-relaxed animate-fade-in [animation-delay:400ms]">
            Eficiência, transparência e gestão integrada em uma única plataforma digital inteligente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in [animation-delay:600ms]">
            <Button
              size="lg"
              className="bg-white text-gov-blue-900 hover:bg-blue-50 px-8 py-6 text-lg font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1"
              onClick={() => scrollToSection('challenge')}
            >
              Conheça a Iniciativa
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <RouterLink to="/entrar">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-full backdrop-blur-sm transition-all duration-300"
              >
                Acessar Portal
              </Button>
            </RouterLink>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-white rounded-full animate-accordion-down" />
          </div>
        </div>
      </section>

      {/* Challenge and Solution Section */}
      <section id="challenge" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="text-gov-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block animate-fade-in">Contexto</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-gray-900 mb-6 animate-fade-in [animation-delay:100ms]">
              Transformando Desafios em Soluções
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto items-stretch">
            {/* Challenge Card */}
            <div className="group bg-white p-10 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden animate-fade-in [animation-delay:200ms]">
              <div className="absolute right-0 top-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <Archive className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-2xl font-montserrat font-bold text-gray-800 mb-4 flex items-center gap-3">
                  O Desafio Atual
                  <span className="h-px flex-1 bg-red-100" />
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Processos fragmentados, dependência de múltiplos fornecedores e sistemas desconectados criam redundância e dificultam a gestão de dados, elevando custos operacionais.
                </p>
              </div>
            </div>

            {/* Solution Card */}
            <div className="group bg-gov-blue-50/50 p-10 rounded-2xl shadow-lg border border-gov-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden animate-fade-in [animation-delay:400ms]">
              <div className="absolute right-0 top-0 w-32 h-32 bg-gov-blue-100/50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gov-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Link className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-2xl font-montserrat font-bold text-gov-blue-900 mb-4 flex items-center gap-3">
                  A Nossa Solução
                  <span className="h-px flex-1 bg-gov-blue-200" />
                </h3>
                <p className="text-gov-blue-800/80 text-lg leading-relaxed">
                  <strong className="text-gov-blue-900">cmlm.tech</strong> unifica todas as ferramentas legislativas em um portal seguro e intuitivo. Centralização que otimiza o trabalho e aproxima o cidadão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl font-montserrat font-bold text-gray-900 mb-6">
              Vantagens da Plataforma Unificada
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Pilares fundamentais para uma gestão pública mais eficiente e moderna.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                icon: Clock,
                title: "Agilidade",
                desc: "Acesso unificado simplifica tarefas e poupa tempo precioso dos servidores.",
                color: "bg-gov-gold-500",
                delay: "0"
              },
              {
                icon: Database,
                title: "Economia",
                desc: "Otimização de contratos e eliminação de sistemas redundantes reduzem custos.",
                color: "bg-green-500",
                delay: "100"
              },
              {
                icon: Settings,
                title: "Integração",
                desc: "Dados consistentes e relatórios cruzados para embasar decisões estratégicas.",
                color: "bg-purple-500",
                delay: "200"
              },
              {
                icon: Shield,
                title: "Transparência",
                desc: "Portal único que aproxima o cidadão das atividades da Câmara Municipal.",
                color: "bg-blue-500",
                delay: "300"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 cursor-default animate-fade-in"
                style={{ animationDelay: `${item.delay}ms` }}
              >
                <div className={`w-16 h-16 ${item.color} rounded-2xl rotate-3 group-hover:rotate-6 flex items-center justify-center mx-auto mb-8 shadow-lg transition-transform duration-500`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-4 group-hover:text-gov-blue-700 transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gray-50/50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 animate-fade-in">
            <span className="text-gov-blue-600 font-semibold tracking-wider uppercase text-sm mb-2 block">Roadmap</span>
            <h2 className="text-4xl font-montserrat font-bold text-gray-900 mb-6">
              Nosso Caminho para a Inovação
            </h2>
            <p className="text-xl text-gray-500 max-w-3xl mx-auto font-light leading-relaxed">
              Um projeto estruturado em fases para garantir implementação eficiente e segura.
            </p>
          </div>

          <div className="max-w-5xl mx-auto relative">
            {/* Absolute Center Line */}
            <div className="absolute left-[2.5rem] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gov-blue-200 via-gov-blue-500 to-gov-blue-200 transform -translate-x-1/2 hidden md:block" />

            <div className="space-y-24">
              {/* Fase 1 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between group">
                <div className="order-1 md:w-5/12 text-left md:text-right animate-fade-in [animation-delay:100ms]">
                  <h4 className="text-2xl font-montserrat font-bold text-gov-blue-900 mb-3 group-hover:text-gov-blue-600 transition-colors">
                    Lançamento e Acesso Interno
                  </h4>
                  <p className="text-gray-500 leading-relaxed text-lg">
                    Implantação da plataforma e liberação do acesso para os colaboradores da Câmara para testes e feedback.
                  </p>
                </div>

                <div className="z-20 flex items-center order-1 bg-white shadow-xl w-16 h-16 rounded-full border-4 border-gov-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <h1 className="mx-auto font-semibold text-lg text-gov-blue-600">1</h1>
                </div>

                <div className="order-1 md:w-5/12 md:opacity-0" />
              </div>

              {/* Fase 2 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between group">
                <div className="order-1 md:w-5/12 md:opacity-0" />

                <div className="z-20 flex items-center order-1 bg-white shadow-xl w-16 h-16 rounded-full border-4 border-gov-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <h1 className="mx-auto font-semibold text-lg text-gov-blue-600">2</h1>
                </div>

                <div className="order-1 md:w-5/12 text-left animate-fade-in [animation-delay:300ms]">
                  <h4 className="text-2xl font-montserrat font-bold text-gov-blue-900 mb-3 group-hover:text-gov-blue-600 transition-colors">
                    Módulo Legislativo e Vereadores
                  </h4>
                  <p className="text-gray-500 leading-relaxed text-lg">
                    Integração das ferramentas do processo legislativo e liberação de acesso para os gabinetes dos vereadores.
                  </p>
                </div>
              </div>

              {/* Fase 3 */}
              <div className="relative flex flex-col md:flex-row items-center justify-between group">
                <div className="order-1 md:w-5/12 text-left md:text-right animate-fade-in [animation-delay:500ms]">
                  <h4 className="text-2xl font-montserrat font-bold text-gov-blue-900 mb-3 group-hover:text-gov-blue-600 transition-colors">
                    Portal da Transparência Integrado
                  </h4>
                  <p className="text-gray-500 leading-relaxed text-lg">
                    Lançamento do novo Portal da Transparência, totalmente integrado ao sistema, para acesso público.
                  </p>
                </div>

                <div className="z-20 flex items-center order-1 bg-white shadow-xl w-16 h-16 rounded-full border-4 border-gov-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <h1 className="mx-auto font-semibold text-lg text-gov-blue-600">3</h1>
                </div>

                <div className="order-1 md:w-5/12 md:opacity-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="login" className="bg-gov-blue-900/95 text-white py-16 border-t border-gov-blue-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <Cloud className="text-gov-blue-900 h-6 w-6" />
                </div>
                <span className="text-2xl font-montserrat font-bold tracking-tight">cmlm.tech</span>
              </div>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed max-w-xs">
                Inovação e eficiência para modernizar o Poder Legislativo de Lavras da Mangabeira.
              </p>
            </div>

            <div>
              <h5 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
                Contato
                <span className="h-px bg-white/20 flex-1 ml-4"></span>
              </h5>
              <div className="space-y-3 text-sm text-gray-300">
                <p>Rua Monsenhor Meceno, 56 - Centro</p>
                <p>Lavras da Mangabeira - CE, 63300-000</p>
                <p className="mt-4 font-semibold text-white">(88) 99999-9999</p>
                <p className="text-gov-blue-200">oi@cmlm.tech</p>
              </div>
            </div>

            <div>
              <h5 className="font-montserrat font-bold text-lg mb-6 flex items-center gap-2">
                Acesso Restrito
                <span className="h-px bg-white/20 flex-1 ml-4"></span>
              </h5>
              <RouterLink to="/entrar">
                <Button
                  variant="outline"
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white hover:text-gov-blue-900 transition-all duration-300 h-12 rounded-xl group"
                >
                  <Users className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Portal do Colaborador
                </Button>
              </RouterLink>
            </div>
          </div>

          <div className="border-t border-gov-blue-800/50 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Câmara Municipal de Lavras da Mangabeira. <span className="opacity-50 mx-2">|</span> Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
