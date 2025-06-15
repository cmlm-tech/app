
import React, { useState } from "react";
import ModalEditarMesa from "./ModalEditarMesa";
import { Vereador } from "../vereadores/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

type ComposicaoMesa = {
  presidente: string;
  vicePresidente: string;
  primeiroSecretario: string;
  segundoSecretario: string;
  primeiroTesoureiro: string;
  segundoTesoureiro: string;
};

// MOCK dos vereadores (simples, poderia ser vindo de contexto/API)
const VEREADORES: Vereador[] = [
  {
    id: "1",
    nome: "Ana Paula Silva",
    partido: "Democratas",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "Presidente",
    foto: "https://static.wikia.nocookie.net/simpsons/images/0/0b/Marge_Simpson.png",
    email: "anapaula@cmlm.tech",
    telefone: "(61) 1234-5678",
    biografia: "Advogada, atuante na defesa dos direitos humanos.",
    legislatura: "2025-2028",
    comissoes: ["Educação", "Saúde"],
  },
  {
    id: "2",
    nome: "Carlos Moura",
    partido: "Republicanos",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "",
    foto: "/vereadores/bart.png",
    email: "carlos@cmlm.tech",
    telefone: "(61) 8765-4321",
    biografia: "Empresário e líder comunitário.",
    legislatura: "2025-2028",
    comissoes: ["Finanças"],
  },
  {
    id: "3",
    nome: "Lívia Rocha",
    partido: "Progressistas",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "Vice-presidente",
    foto: "https://static.wikia.nocookie.net/simpsons/images/e/ec/Lisa_Simpson.png",
    email: "livia@cmlm.tech",
    telefone: "(61) 2233-4455",
    biografia: "Professora e defensora do ensino público.",
    legislatura: "2025-2028",
    comissoes: ["Educação"],
  },
  {
    id: "4",
    nome: "Roberto Lima",
    partido: "Democratas",
    partidoLogo: "/placeholder.svg",
    cargoMesa: "",
    foto: "https://static.wikia.nocookie.net/simpsons/images/0/02/Homer_Simpson_2006.png",
    email: "roberto@cmlm.tech",
    telefone: "(61) 9988-7766",
    biografia: "Servidor público e líder sindical.",
    legislatura: "2025-2028",
    comissoes: ["Transportes", "Segurança Pública"],
  },
];

const LEGISLATURA_ATUAL = "2025-2028";
// Mapeamento dos cargos para ids dos vereadores
const COMPOSICAO_MESA_DEFAULT: ComposicaoMesa = {
  presidente: "1",
  vicePresidente: "3",
  primeiroSecretario: "2",
  segundoSecretario: "4",
  primeiroTesoureiro: "2",
  segundoTesoureiro: "4",
};

// Simulação de permissão admin
const isAdmin = true;

function getVereadorById(id: string) {
  return VEREADORES.find((v) => v.id === id) || null;
}

export default function MesaDiretoraContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [composicaoMesa, setComposicaoMesa] = useState(COMPOSICAO_MESA_DEFAULT);
  const navigate = useNavigate();

  const membros = {
    presidente: getVereadorById(composicaoMesa.presidente),
    vicePresidente: getVereadorById(composicaoMesa.vicePresidente),
    primeiroSecretario: getVereadorById(composicaoMesa.primeiroSecretario),
    segundoSecretario: getVereadorById(composicaoMesa.segundoSecretario),
    primeiroTesoureiro: getVereadorById(composicaoMesa.primeiroTesoureiro),
    segundoTesoureiro: getVereadorById(composicaoMesa.segundoTesoureiro),
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header da página e botão */}
      <div className="flex items-start justify-between gap-2 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gov-blue-800 leading-tight mb-1">
            Mesa Diretora
          </h1>
          <div className="text-gray-600 text-lg">
            Composição para a Legislatura {LEGISLATURA_ATUAL}
          </div>
        </div>
        {isAdmin && (
          <Button variant="default" onClick={() => setModalOpen(true)}>
            Editar Composição
          </Button>
        )}
      </div>

      {/* PRESIDENTE */}
      <section className="flex flex-col items-center mb-6">
        <span className="uppercase text-gov-gold-700 font-bold mb-1 text-sm tracking-wider">Presidente</span>
        <div className="bg-white rounded-xl shadow-lg border w-full max-w-md flex flex-col items-center p-7 mb-4 relative">
          {membros.presidente && (
            <>
              <img
                src={membros.presidente.foto}
                alt={membros.presidente.nome}
                className="w-28 h-28 rounded-full object-cover border-4 border-gov-blue-100 mb-3 shadow"
              />
              <div className="text-2xl font-bold text-gov-blue-900 mb-0.5">
                {membros.presidente.nome}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <img src={membros.presidente.partidoLogo} alt="" className="h-6 w-6" />
                <span className="text-gray-600 text-base font-medium">
                  {membros.presidente.partido}
                </span>
              </div>
              <Button
                variant="secondary"
                className="mt-2"
                onClick={() => navigate(`/plenario/vereadores/${membros.presidente.id}`)}
              >
                Ver Perfil
              </Button>
            </>
          )}
        </div>
      </section>
      
      {/* VICE-PRESIDENTE */}
      <section className="flex flex-col items-center mb-7">
        <span className="uppercase text-gov-gold-700 font-bold mb-1 text-xs tracking-wider">Vice-presidente</span>
        <div className="bg-white rounded-xl shadow-md border w-full max-w-sm flex flex-col items-center p-6 relative">
          {membros.vicePresidente && (
            <>
              <img
                src={membros.vicePresidente.foto}
                alt={membros.vicePresidente.nome}
                className="w-20 h-20 rounded-full object-cover border-4 border-gov-blue-100 mb-2 shadow"
              />
              <div className="text-lg font-semibold text-gov-blue-900 mb-0.5">
                {membros.vicePresidente.nome}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <img src={membros.vicePresidente.partidoLogo} alt="" className="h-5 w-5" />
                <span className="text-gray-600 text-sm">{membros.vicePresidente.partido}</span>
              </div>
              <Button 
                variant="secondary"
                className="mt-1"
                size="sm"
                onClick={() => navigate(`/plenario/vereadores/${membros.vicePresidente.id}`)}
              >
                Ver Perfil
              </Button>
            </>
          )}
        </div>
      </section>

      {/* SECRETÁRIOS E TESOUREIROS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-3">
        {[
          { k: "primeiroSecretario", label: "1º Secretário" },
          { k: "segundoSecretario", label: "2º Secretário" },
          { k: "primeiroTesoureiro", label: "1º Tesoureiro" },
          { k: "segundoTesoureiro", label: "2º Tesoureiro" },
        ].map((cargo) => {
          const membro = membros[cargo.k as keyof typeof membros];
          return (
            <div key={cargo.k} className="bg-white rounded-lg shadow border flex flex-col items-center p-5">
              <span className="uppercase text-gov-gold-700 font-bold mb-1 text-xs tracking-wide">{cargo.label}</span>
              {membro && (
                <>
                  <img
                    src={membro.foto}
                    alt={membro.nome}
                    className="w-16 h-16 rounded-full object-cover border-4 border-gov-blue-100 mb-2 shadow"
                  />
                  <div className="text-base font-semibold text-gov-blue-900 mb-0.5">
                    {membro.nome}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <img src={membro.partidoLogo} alt="" className="h-4 w-4" />
                    <span className="text-gray-600 text-sm">{membro.partido}</span>
                  </div>
                  <Button 
                    variant="ghost"
                    className="mt-1 text-xs"
                    size="sm"
                    onClick={() => navigate(`/plenario/vereadores/${membro.id}`)}
                  >
                    Ver Perfil
                  </Button>
                </>
              )}
            </div>
          );
        })}
      </section>

      {/* Modal de edição */}
      <ModalEditarMesa
        open={modalOpen}
        onOpenChange={setModalOpen}
        vereadores={VEREADORES}
        composicaoMesa={composicaoMesa}
        onSave={setComposicaoMesa}
      />
    </div>
  );
}
