
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export const AbaGeral = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-gov-blue-800 mb-6">Configurações Gerais da Instituição</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome-instituicao">Nome da Instituição</Label>
            <Input id="nome-instituicao" defaultValue="Câmara Municipal de Lavras da Mangabeira - CE" />
          </div>
          <div className="space-y-2">
            <Label>Logo da Instituição</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt="Logo" />
                <AvatarFallback>CMLM</AvatarFallback>
              </Avatar>
              <Button variant="outline">Trocar Logo</Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Legislatura Atual</Label>
            <div className="flex items-center gap-2">
              <p className="text-gray-700">2025-2028</p>
              <Link to="/atividade-legislativa/legislaturas" className="text-sm text-blue-600 hover:underline">
                (Gerenciar Legislaturas)
              </Link>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Período Legislativo Atual</Label>
            <p className="text-gray-700">2025</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button>Salvar Alterações Gerais</Button>
        </div>
      </CardContent>
    </Card>
  );
};
