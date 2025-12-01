import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Gavel, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const nextSessionDate = "Segunda-feira, 16 de Junho de 2025, às 19:00";
const countdown = "Faltam 1 dia e 5 horas";
const pautaId = "123";

const pendencias = [
  { id: "PL15", titulo: "Projeto de Lei nº 15/2025", status: "Aguardando parecer da Comissão de Justiça", link: "/documentos/materias/15" },
  { id: "PL13", titulo: "Projeto de Lei nº 13/2025", status: "Aguardando votação em plenário", link: "/documentos/materias/13" },
  { id: "PL12", titulo: "Projeto de Lei nº 12/2025", status: "Aguardando parecer da Comissão de Finanças", link: "/documentos/materias/12" },
];

const atividadeRecente = [
  "Joaquim Silva protocolou o Ofício nº 130/2025.",
  "A Comissão de Justiça emitiu parecer sobre o PL nº 14/2025.",
  "A Pauta da próxima sessão foi publicada.",
  "A Vereadora Maria Oliveira foi adicionada à Comissão de Cultura, Educação e Assistência Social.",
  "Sessão extraordinária agendada para o dia 20/06/2025.",
];

// ... (array 'atalhos' não utilizado no JSX, pode ser removido se não for usado em outro lugar)

export default function Painel() {
  const { user } = useAuth();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const todayText = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="mb-8">
        {/* ALTERAÇÃO: Fonte responsiva para melhor visualização em telas pequenas */}
        <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-gov-blue-800 mb-2 animate-fade-in">
          Painel de Controle
        </h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo(a) de volta, <span className="font-semibold">{userName}</span>! Hoje é {todayText}.
        </p>
      </div>

      {/* Linha de cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* ALTERAÇÃO: Layout interno dos cards responsivo (flex-col sm:flex-row) */}
        <Card className="flex flex-col text-center sm:flex-row sm:text-left items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-gov-blue-100 text-gov-blue-800 p-3 flex-shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">42</div>
            <div className="text-sm text-gray-500">Matérias Protocoladas no Mês</div>
          </div>
        </Card>
        <Card className="flex flex-col text-center sm:flex-row sm:text-left items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-gov-gold-100 text-gov-gold-600 p-3 flex-shrink-0">
            <Gavel className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-gray-500">Matérias em Votação</div>
          </div>
        </Card>
        <Card className="flex flex-col text-center sm:flex-row sm:text-left items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-green-100 text-green-700 p-3 flex-shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">4</div>
            <div className="text-sm text-gray-500">Sessões Realizadas no Mês</div>
          </div>
        </Card>
      </div>

      {/* Bloco central: cards principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próxima Sessão Plenária */}
        <Card className="lg:col-span-2 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gov-blue-700" />
              Próxima Sessão
            </CardTitle>
            <CardDescription>Reunião ordinária do Plenário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-xl md:text-2xl font-bold text-gov-blue-800">{nextSessionDate}</div>
            <div className="mb-1 text-base md:text-lg text-gray-700">{countdown}</div>
            <div className="text-gray-600 mb-4">12 matérias na pauta</div>
            <Button asChild size="lg" className="w-full mt-4 bg-gov-blue-700 hover:bg-gov-blue-900 text-white text-base font-bold py-3 rounded animate-scale-in">
              <Link to={`/atividade-legislativa/pautas/${pautaId}`}>Ver Pauta Completa</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pendências */}
        {/* ALTERAÇÃO: Altura do card agora é flexível (h-full) para se alinhar com o vizinho no desktop */}
        <Card className="shadow-lg animate-fade-in h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Aguardando Parecer ou Votação</CardTitle>
            <CardDescription>
              Itens que exigem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-48 pr-1">
              <ul className="space-y-3">
                {pendencias.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={item.link}
                      className="block rounded px-3 py-2 bg-gray-50 hover:bg-gov-blue-50 border-l-4 border-gov-gold-500 transition-colors cursor-pointer"
                    >
                      <span className="font-semibold">{item.titulo}</span>
                      <br />
                      <span className="text-sm text-gray-600">{item.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
          <CardFooter className="mt-auto justify-end pt-4">
            <Link
              to="/documentos/materias?filtro=pendentes"
              className="text-sm text-gov-blue-700 font-semibold hover:underline"
            >
              Ver todas as pendências
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Linha inferior: Atalhos Rápidos + Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Atividade Recente */}
        <Card className="lg:col-span-3 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente no Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {atividadeRecente.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gov-gold-500 mt-2 mr-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}