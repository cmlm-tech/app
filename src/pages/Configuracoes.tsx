import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AbaGeral } from "@/components/configuracoes/Gerais";
import { AbaDadosCamara } from "@/components/configuracoes/DadosCamara";
import { AbaTiposMateria } from "@/components/configuracoes/TiposMateria";
import { AbaDestinatarios } from "@/components/configuracoes/Destinatarios";
import { AbaPartidos } from "@/components/configuracoes/Partidos";

const Configuracoes = () => {
  return (
    <AppLayout>
      <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gov-blue-800 mb-6">
        Configurações do Sistema
      </h1>
      <Tabs defaultValue="geral" className="flex flex-col md:flex-row gap-8">

        <div className="relative w-full overflow-x-auto md:w-60 md:overflow-x-visible">
          {/* ALTERAÇÃO: Removido 'w-full' e 'justify-start' do modo mobile.
            Adicionado 'inline-flex' para que a lista de abas tenha a largura do seu conteúdo,
            o que permite que o 'overflow-x-auto' do pai funcione corretamente.
          */}
          <TabsList className="inline-flex flex-row md:flex-col md:w-60 h-auto p-1 bg-gray-100/80 rounded-lg">
            <TabsTrigger value="geral" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Gerais
            </TabsTrigger>
            <TabsTrigger value="dados-camara" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Dados da Câmara
            </TabsTrigger>
            <TabsTrigger value="tipos-materia" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Tipos de Matéria
            </TabsTrigger>
            <TabsTrigger value="destinatarios" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Destinatários
            </TabsTrigger>
            <TabsTrigger value="partidos" className="w-full justify-start data-[state=active]:bg-white data-[state=active]:text-gov-blue-800 data-[state=active]:shadow-sm">
              Partidos
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
          <TabsContent value="destinatarios" className="mt-0">
            <AbaDestinatarios />
          </TabsContent>
          <TabsContent value="partidos" className="mt-0">
            <AbaPartidos />
          </TabsContent>
        </div>
      </Tabs>
    </AppLayout>
  );
};

export default Configuracoes;