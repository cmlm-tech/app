
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MeuPerfil = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800">
          Meu Perfil
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações pessoais e de segurança.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-32 w-32">
                <AvatarImage src="https://github.com/shadcn.png" alt="Foto do usuário" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <Button variant="link">Alterar Foto</Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" defaultValue="Ana Silva" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-perfil">E-mail</Label>
              <Input id="email-perfil" defaultValue="ana.silva@email.com" readOnly className="bg-gray-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Segurança</CardTitle>
            <CardDescription>Alterar Senha</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha-atual">Senha Atual</Label>
              <Input id="senha-atual" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nova-senha">Nova Senha</Label>
              <Input id="nova-senha" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmar-nova-senha">Confirme a Nova Senha</Label>
              <Input id="confirmar-nova-senha" type="password" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button>Salvar Alterações</Button>
      </div>
    </AppLayout>
  );
};

export default MeuPerfil;
