import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, Briefcase, UserCog } from "lucide-react";
import { TabPessoas } from "@/components/configuracoes/destinatarios/TabPessoas";
import { TabOrgaos } from "@/components/configuracoes/destinatarios/TabOrgaos";
import { TabCargos } from "@/components/configuracoes/destinatarios/TabCargos";
import { TabOcupacoes } from "@/components/configuracoes/destinatarios/TabOcupacoes";

export function AbaDestinatarios() {
    const [activeTab, setActiveTab] = useState("pessoas");

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gov-blue-800">Gerenciar Destinatários</h2>
                <p className="text-sm text-gray-500">Gerencie pessoas, órgãos, cargos e ocupações para os documentos.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-gray-100/80">
                    <TabsTrigger value="pessoas" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gov-blue-800">
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline">Pessoas</span>
                    </TabsTrigger>
                    <TabsTrigger value="orgaos" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gov-blue-800">
                        <Building2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Órgãos</span>
                    </TabsTrigger>
                    <TabsTrigger value="cargos" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gov-blue-800">
                        <Briefcase className="w-4 h-4" />
                        <span className="hidden sm:inline">Cargos</span>
                    </TabsTrigger>
                    <TabsTrigger value="ocupacoes" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gov-blue-800">
                        <UserCog className="w-4 h-4" />
                        <span className="hidden sm:inline">Ocupações</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pessoas" className="mt-0">
                    <TabPessoas />
                </TabsContent>

                <TabsContent value="orgaos" className="mt-0">
                    <TabOrgaos />
                </TabsContent>

                <TabsContent value="cargos" className="mt-0">
                    <TabCargos />
                </TabsContent>

                <TabsContent value="ocupacoes" className="mt-0">
                    <TabOcupacoes />
                </TabsContent>
            </Tabs>
        </div>
    );
}
