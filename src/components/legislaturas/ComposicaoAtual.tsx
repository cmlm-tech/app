import { VereadorComCondicao } from "./types"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VereadorAvatarList } from "./VereadorAvatarList";

interface ComposicaoAtualProps {
  emExercicio: VereadorComCondicao[]
  licenciados: VereadorComCondicao[]
  liderancasMap?: Record<number, 'governo' | 'oposicao'>;
  onLicencaClick?: () => void;
  onEndLicenca?: (vereador: VereadorComCondicao) => void;
}

export function ComposicaoAtual({
  emExercicio,
  licenciados,
  liderancasMap = {},
  onLicencaClick,
  onEndLicenca,
}: ComposicaoAtualProps) {
  return (
    <Accordion type="single" collapsible className="w-full mb-6" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl font-semibold justify-start gap-2">
          Composição Atual da Legislatura
        </AccordionTrigger>
        <AccordionContent>
          <div className="mt-6 space-y-8">
            <VereadorAvatarList
              title="Vereadores em Exercício"
              vereadores={emExercicio}
              emptyMessage="Nenhum vereador em exercício no momento."
              liderancasMap={liderancasMap}
            />
            <VereadorAvatarList
              title="Vereadores Titulares Licenciados"
              vereadores={licenciados}
              emptyMessage="Nenhum titular licenciado no momento."
              liderancasMap={liderancasMap}
              onActionClick={onLicencaClick}
              actionLabel="Licença"
              onEndLicenca={onEndLicenca}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}