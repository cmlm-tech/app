import { CardVereador } from "@/components/vereadores/CardVereador"
import { VereadorComCondicao } from "@/pages/atividade-legislativa/DetalheLegislatura"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ComposicaoAtualProps {
  emExercicio: VereadorComCondicao[]
  licenciados: VereadorComCondicao[]
}

export function ComposicaoAtual({
  emExercicio,
  licenciados,
}: ComposicaoAtualProps) {
  return (
    <Accordion type="single" collapsible className="w-full mb-6" defaultValue="item-1">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-xl font-semibold">
          Composição Atual da Legislatura
        </AccordionTrigger>
        <AccordionContent>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">
                Vereadores em Exercício ({emExercicio.length})
              </h3>
              <div className="mt-4 space-y-4">
                {emExercicio.length > 0 ? (
                  emExercicio.map((vereador) => (
                    <CardVereador key={vereador.id} vereador={vereador} isAdmin={false} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum vereador em exercício no momento.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">
                Vereadores Titulares Licenciados ({licenciados.length})
              </h3>
              <div className="mt-4 space-y-4">
                {licenciados.length > 0 ? (
                  licenciados.map((vereador) => (
                    <CardVereador key={vereador.id} vereador={vereador} isAdmin={false} onRemove={() => {}} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum titular licenciado no momento.
                  </p>
                )}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
