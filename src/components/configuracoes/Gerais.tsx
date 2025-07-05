import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
// ALTERAÇÃO: Importando o 'Link' da biblioteca correta para o seu projeto.
import { Link } from "react-router-dom";

export const AbaGeral = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais da Instituição</CardTitle>
        <CardDescription>
          Ajuste as informações básicas que são exibidas em todo o sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Item: Nome da Instituição */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label htmlFor="nomeInstituicao">Nome da Instituição</Label>
            <p className="text-sm text-muted-foreground">
              O nome que aparecerá em todo o sistema.
            </p>
          </div>
          <Input 
            id="nomeInstituicao" 
            defaultValue="Câmara Municipal de Lavras da Mangabeira - CE" 
            className="w-full sm:max-w-md" 
          />
        </div>

        <Separator />

        {/* Item: Logo da Instituição */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label>Logo da Instituição</Label>
            <p className="text-sm text-muted-foreground">
              Faça o upload do brasão ou logo oficial.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* ALTERAÇÃO: Removida a propriedade 'initialPreview' que não existe no seu componente. */}
            <ImageUpload 
              onImageUploaded={() => {}} 
            />
            <Button variant="outline">Trocar Logo</Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Item: Legislatura Atual */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <Label>Legislatura Atual</Label>
                <p className="text-sm text-muted-foreground">Período que está em vigência.</p>
            </div>
            <div className="text-right">
                <p className="font-medium">2025-2028</p>
                {/* ALTERAÇÃO: Usando a propriedade 'to' em vez de 'href'. */}
                <Link to="/atividade-legislativa/legislaturas" className="text-sm text-blue-600 hover:underline">
                    Gerenciar Legislaturas
                </Link>
            </div>
        </div>

        <Separator />
        
        {/* Item: Período Legislativo Atual */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <Label>Período Legislativo Atual</Label>
                <p className="text-sm text-muted-foreground">Ano legislativo corrente.</p>
            </div>
            <p className="font-medium">2025</p>
        </div>
      </CardContent>
    </Card>
  );
};