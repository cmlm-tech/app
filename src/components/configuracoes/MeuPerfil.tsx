
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const AbaMeuPerfil = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-gov-blue-800 mb-6">Meu Perfil</h2>
        <div className="space-y-6">
          <div className="space-y-2">
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                      <AvatarImage src="https://github.com/shadcn.png" alt="Foto do usuário" />
                      <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Alterar Foto</Button>
              </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" defaultValue="Ana Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-perfil">E-mail</Label>
            <Input id="email-perfil" defaultValue="ana.silva@email.com" readOnly className="bg-gray-100" />
          </div>

          <Separator />
          
          <div>
              <h3 className="text-lg font-semibold text-gov-blue-800 mb-4">Alterar Senha</h3>
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="senha-atual">Senha Atual</Label>
                      <Input id="senha-atual" type="password" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="nova-senha">Nova Senha</Label>
                      <Input id="nova-senha" type="password" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="confirmar-nova-senha">Confirmar Nova Senha</Label>
                      <Input id="confirmar-nova-senha" type="password" />
                  </div>
              </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button>Salvar Alterações do Perfil</Button>
        </div>
      </CardContent>
    </Card>
  );
};
