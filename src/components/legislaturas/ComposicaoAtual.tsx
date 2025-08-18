import { CardVereador } from "@/components/vereadores/CardVereador"
import { VereadorComCondicao } from "@/pages/atividade-legislativa/DetalheLegislatura"

interface ComposicaoAtualProps {
  emExercicio: VereadorComCondicao[]
  licenciados: VereadorComCondicao[]
}

export function ComposicaoAtual({
  emExercicio,
  licenciados,
}: ComposicaoAtualProps) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold tracking-tight">
        Composição Atual da Legislatura
      </h2>

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
    </div>
  )
}