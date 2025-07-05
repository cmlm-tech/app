import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AbaGeral } from "@/components/configuracoes/Gerais";
import { AbaDadosCamara } from "@/components/configuracoes/DadosCamara";
import { AbaTiposMateria } from "@/components/configuracoes/TiposMateria";

const Configuracoes = () => {
  return (
    <AppLayout>
      {/* ALTERAÇÃO: Fonte do título agora é responsiva */}
      <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gov-blue-800 mb-6">
        Configurações do Sistema
      </h1>
      <Tabs defaultValue="geral" className="flex flex-col md:flex-row gap-8">
        
        {/* ALTERAÇÃO: Wrapper para permitir rolagem horizontal das abas no mobile */}
        <div className="relative w-full overflow-x-auto md:w-60 md:overflow-x-visible">
          <TabsList className="flex-shrink-0 flex-row md:flex-col h-auto w-full md:w-60 justify-start p-1 bg-gray-100/80 rounded-lg">
            <TabsTrigger value="geral" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Gerais
            </TabsTrigger>            
            <TabsTrigger value="dados-camara" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Dados da Câmara
            </TabsTrigger>
            <TabsTrigger value="tipos-materia" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Tipos de Matéria
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-grow">
          <TabsContent value="geral" className="mt-0">
            <AbaGeral />
          </TabsContent>          
          <TabsContent value="dados-camara" className="mt-0">
            <AbaDadosCamara />
          </TabsContent>
          <TabsContent value="tipos-materia" className="mt-0">
            <AbaTiposMateria />
          </TabsContent>
        </div>
      </Tabs>
    </AppLayout>
  );
};

export default Configuracoes;