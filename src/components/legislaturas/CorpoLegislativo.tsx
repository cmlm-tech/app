import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CardVereador } from "@/components/vereadores/CardVereador";
import { Database } from "@/lib/database.types";
import { PlusCircle } from "lucide-react";

type Vereador = Database['public']['Tables']['agentespublicos']['Row'];

interface CorpoLegislativoProps {
  vereadores: Vereador[];
  isAdmin: boolean;
  onAdicionarClick: () => void;
  onRemove: (vereador: Vereador) => void;
}

export function CorpoLegislativo({ vereadores, isAdmin, onAdicionarClick, onRemove }: CorpoLegislativoProps) {
  return (
    <Accordion type="single" collapsible className="w-full mb-6" defaultValue="item-1">
      <AccordionItem value="item-1">
        <div className="flex items-center justify-between w-full">
            <AccordionTrigger className="text-xl font-semibold flex-1">
              Corpo Legislativo ({vereadores.length})
            </AccordionTrigger>
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={onAdicionarClick} className="ml-4">
                <PlusCircle className="h-5 w-5 mr-2" />
                Adicionar Vereador
              </Button>
            )}
        </div>
        <AccordionContent>
          {vereadores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
              {vereadores.map(vereador => (
                <CardVereador key={vereador.id} vereador={vereador} isAdmin={isAdmin} onRemove={() => onRemove(vereador)} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">Nenhum vereador associado a esta legislatura.</p>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}