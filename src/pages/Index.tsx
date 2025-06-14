
import { useState, useEffect } from 'react';
import { Clock, Shield, Gear, Database, ArrowRight, Users, Link, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gov-blue-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-montserrat font-bold text-gov-blue-800">cmlm.tech</span>
          </div>
          <Button 
            className="bg-gov-blue-800 hover:bg-gov-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            onClick={() => scrollToSection('login')}
          >
            Acesso ao Sistema
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gov-blue-800 to-gov-blue-600"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}
        />
        <div className="absolute inset-0 bg-gov-blue-800/80" />
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-montserrat font-bold mb-6 text-balance">
            Modernizando o Poder Legislativo
          </h1>
          <h2 className="text-xl md:text-2xl font-roboto font-light mb-8 text-balance opacity-90">
            Eficiência, transparência e gestão integrada em uma única plataforma.
          </h2>
          <Button 
            size="lg"
            className="bg-white text-gov-blue-800 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-lg transition-all transform hover:scale-105"
            onClick={() => scrollToSection('challenge')}
          >
            Conheça a Iniciativa
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Challenge and Solution Section */}
      <section id="challenge" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Archive className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-montserrat font-bold text-gray-800 mb-4">
                O Desafio Atual
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Atualmente, nossos processos diários dependem de múltiplos sistemas de diferentes fornecedores. 
                Essa fragmentação gera redundância, dificulta a gestão de dados e aumenta os custos operacionais.
              </p>
            </div>
            
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gov-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Link className="h-8 w-8 text-gov-blue-800" />
              </div>
              <h3 className="text-2xl font-montserrat font-bold text-gray-800 mb-4">
                A Nossa Solução: CMLM.TECH
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                A plataforma CMLM.TECH nasce para unificar todas as ferramentas legislativas e administrativas 
                em um só lugar. Um portal seguro, intuitivo e centralizado para otimizar o trabalho e servir melhor o cidadão.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-montserrat font-bold text-gray-800 mb-4">
              Vantagens da Plataforma Unificada
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossos pilares fundamentais para uma gestão pública mais eficiente
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow animate-fade-in">
              <div className="w-16 h-16 bg-gov-gold-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-3">Agilidade</h4>
              <p className="text-gray-600">
                Acesso rápido a todas as ferramentas com um único login, simplificando tarefas e economizando tempo.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow animate-fade-in">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-3">Economia</h4>
              <p className="text-gray-600">
                Redução de custos através da otimização de contratos e eliminação de sistemas redundantes.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow animate-fade-in">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gear className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-3">Integração</h4>
              <p className="text-gray-600">
                Dados consistentes e relatórios completos para embasar decisões estratégicas para o município.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow animate-fade-in">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-3">Transparência</h4>
              <p className="text-gray-600">
                Um portal único que facilita o acesso do cidadão às informações e atividades da Câmara.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-montserrat font-bold text-gray-800 mb-4">
              Nosso Caminho para a Inovação
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um projeto estruturado em fases para garantir implementação eficiente e segura
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gov-blue-800 transform md:-translate-x-px"></div>
              
              <div className="space-y-12">
                <div className="relative flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gov-blue-800 rounded-full flex items-center justify-center z-10">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <div className="ml-8 md:ml-0 md:w-1/2 md:pr-8 md:text-right">
                    <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-2">
                      Lançamento e Acesso Interno
                    </h4>
                    <p className="text-gray-600">
                      Implantação da plataforma e liberação do acesso para os colaboradores da Câmara para testes e feedback.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-center md:flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 bg-gov-blue-800 rounded-full flex items-center justify-center z-10 md:ml-auto">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <div className="ml-8 md:ml-0 md:w-1/2 md:pl-8">
                    <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-2">
                      Módulo Legislativo e Vereadores
                    </h4>
                    <p className="text-gray-600">
                      Integração das ferramentas do processo legislativo e liberação de acesso para os gabinetes dos vereadores.
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gov-blue-800 rounded-full flex items-center justify-center z-10">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <div className="ml-8 md:ml-0 md:w-1/2 md:pr-8 md:text-right">
                    <h4 className="text-xl font-montserrat font-bold text-gray-800 mb-2">
                      Portal da Transparência Integrado
                    </h4>
                    <p className="text-gray-600">
                      Lançamento do novo Portal da Transparência, totalmente integrado ao sistema, para acesso público.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="login" className="bg-gov-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-gov-blue-800 font-bold text-sm">C</span>
                </div>
                <span className="text-xl font-montserrat font-bold">CMLM.TECH</span>
              </div>
              <p className="text-gray-300 mb-4">
                Modernizando o Poder Legislativo de Lavras da Mangabeira
              </p>
            </div>
            
            <div>
              <h5 className="font-montserrat font-bold mb-4">Contato</h5>
              <p className="text-gray-300 mb-2">Rua Monsenhor Meceno, 56 - Centro</p>
              <p className="text-gray-300 mb-2">Lavras da Mangabeira - CE, 63300-000</p>
              <p className="text-gray-300 mb-2">(88) 99999-9999</p>
              <p className="text-gray-300">oi@cmlm.tech</p>
            </div>
            
            <div>
              <h5 className="font-montserrat font-bold mb-4">Acesso Rápido</h5>
              <Button 
                variant="outline" 
                className="w-full bg-transparent border-white text-white hover:bg-white hover:text-gov-blue-800 transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                Portal do Colaborador
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gov-blue-700 pt-8 text-center">
            <p className="text-gray-300">
              © 2025 Câmara Municipal de Lavras da Mangabeira. Todos os direitos reservados. Projeto CMLM.TECH.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
