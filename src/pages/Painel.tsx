
import { AppLayout } from "@/components/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Gavel, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const nextSessionDate = "Segunda-feira, 16 de Junho de 2025, às 19:00";
const countdown = "Faltam 1 dia e 5 horas";
const pautaId = "123";
const userName = "Ana Silva";
const todayText = "domingo, 15 de junho de 2025";

const pendencias = [
  {
    id: "PL15",
    titulo: "Projeto de Lei nº 15/2025",
    status: "Aguardando parecer da Comissão de Justiça",
    link: "/documentos/materias/15",
  },
  {
    id: "PL13",
    titulo: "Projeto de Lei nº 13/2025",
    status: "Aguardando votação em plenário",
    link: "/documentos/materias/13",
  },
  {
    id: "PL12",
    titulo: "Projeto de Lei nº 12/2025",
    status: "Aguardando parecer da Comissão de Finanças",
    link: "/documentos/materias/12",
  },
];

const atividadeRecente = [
  "Joaquim Silva protocolou o Ofício nº 130/2025.",
  "A Comissão de Justiça emitiu parecer sobre o PL nº 14/2025.",
  "A Pauta da próxima sessão foi publicada.",
  "A Vereadora Maria Oliveira foi adicionada à Comissão de Cultura, Educação e Assistência Social.",
  "Sessão extraordinária agendada para o dia 20/06/2025.",
];

const atalhos = [
  {
    label: "Protocolar Matéria",
    icon: "+",
    to: "/documentos/materias", // ajuste conforme fluxo real
  },
  {
    label: "Agendar Sessão",
    icon: "+",
    to: "/atividade-legislativa/sessoes", // ajuste conforme fluxo real
  },
  {
    label: "Consultar Vereador",
    icon: "",
    to: "/plenario/vereadores",
  },
  {
    label: "Gerenciar Comissões",
    icon: "",
    to: "/plenario/comissoes",
  },
];

export default function Painel() {
  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-montserrat font-bold text-gov-blue-800 mb-2 animate-fade-in">
          Painel de Controle
        </h1>
        <p className="text-muted-foreground text-lg">
          Bem-vindo(a) de volta, <span className="font-semibold">{userName}</span>! Hoje é {todayText}.
        </p>
      </div>
      
      {/* Linha de cards de KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
        <Card className="flex flex-row items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-gov-blue-100 text-gov-blue-800 p-3">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">42</div>
            <div className="text-sm text-gray-500">Matérias Protocoladas no Mês</div>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-gov-gold-100 text-gov-gold-600 p-3">
            <Gavel className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-sm text-gray-500">Matérias em Votação</div>
          </div>
        </Card>
        <Card className="flex flex-row items-center gap-4 px-6 py-4 shadow-sm hover-scale animate-fade-in">
          <div className="rounded-full bg-green-100 text-green-700 p-3">
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
            <div className="mb-2 text-2xl font-bold text-gov-blue-800">{nextSessionDate}</div>
            <div className="mb-1 text-lg text-gray-700">{countdown}</div>
            <div className="text-gray-600 mb-4">12 matérias na pauta</div>
            <Button asChild size="lg" className="w-full mt-4 bg-gov-blue-700 hover:bg-gov-blue-900 text-white text-base font-bold py-3 rounded animate-scale-in">
              <Link to={`/atividade-legislativa/pautas/${pautaId}`}>Ver Pauta Completa</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pendências */}
        <Card className="shadow-lg animate-fade-in max-h-[420px] flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Aguardando Parecer ou Votação</CardTitle>
            <CardDescription>
              Itens que exigem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-48 pr-1">
              <ul className="space-y-3">
                {pendencias.map((item, idx) => (
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
          <CardFooter className="justify-end">
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
        {/* Atalhos rápidos */}
        <Card className="shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Atalhos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Atalhos com botões */}
              <Button asChild variant="secondary" className="flex flex-col items-center justify-center gap-2 py-6 text-lg">
                <Link to="/documentos/materias">
                  <span className="text-xl font-extrabold">+</span>
                  Protocolar Matéria
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex flex-col items-center justify-center gap-2 py-6 text-lg">
                <Link to="/atividade-legislativa/sessoes">
                  <span className="text-xl font-extrabold">+</span>
                  Agendar Sessão
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex flex-col items-center justify-center gap-2 py-6 text-lg">
                <Link to="/plenario/vereadores">
                  <span className="text-xl font-extrabold">🔍</span>
                  Consultar Vereador
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex flex-col items-center justify-center gap-2 py-6 text-lg">
                <Link to="/plenario/comissoes">
                  <span className="text-xl font-extrabold">👥</span>
                  Gerenciar Comissões
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="lg:col-span-2 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente no Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {atividadeRecente.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gov-gold-500 mt-2 mr-2" />
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
