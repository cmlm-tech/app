import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CardVereador } from "@/components/vereadores/CardVereador";
import { Database } from "@/lib/database.types";

type Vereador = Database['public']['Tables']['agentespublicos']['Row'];

interface CorpoLegislativoProps {
  vereadores: Vereador[];
}

export function CorpoLegislativo({ vereadores }: CorpoLegislativoProps) {
  return (
    <Accordion type="single" collapsible className="w-full mb-6">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl font-semibold">Corpo Legislativo ({vereadores.length})</AccordionTrigger>
        <AccordionContent>
          {vereadores.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
              {vereadores.map(vereador => (
                <CardVereador key={vereador.id} vereador={vereador} />
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