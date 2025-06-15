
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export const AbaDadosCamara = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-gov-blue-800 mb-6">Informações de Contato e Endereço</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Textarea id="endereco" placeholder="Digite o endereço completo" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="00.000.000/0000-00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone de Contato</Label>
              <Input id="telefone" placeholder="(00) 0000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail Oficial</Label>
            <Input id="email" type="email" placeholder="contato@camara.gov.br" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horario">Horário de Funcionamento</Label>
            <Input id="horario" placeholder="Segunda a Sexta, das 8h às 17h" />
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button>Salvar Informações</Button>
        </div>
      </CardContent>
    </Card>
  );
};
