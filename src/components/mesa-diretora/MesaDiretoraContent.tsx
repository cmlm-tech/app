
import React, { useState } from "react";
import ModalEditarMesa from "./ModalEditarMesa";
import { useSearchParams } from "react-router-dom";
import { ComposicaoMesa } from "./types";
import {
  VEREADORES,
  COMPOSICOES_MESA_INICIAL,
  ANOS_DISPONIVEIS,
  getVereadorById,
} from "./data";
import MesaDiretoraHeader from "./MesaDiretoraHeader";
import PresidenteCard from "./PresidenteCard";
import VicePresidenteCard from "./VicePresidenteCard";
import OutrosMembrosGrid from "./OutrosMembrosGrid";

// Simulação de permissão admin
const isAdmin = true;

const CARGOS_OUTROS_MEMBROS = [
  { key: "primeiroSecretario", label: "1º Secretário" },
  { key: "segundoSecretario", label: "2º Secretário" },
  { key: "primeiroTesoureiro", label: "1º Tesoureiro" },
  { key: "segundoTesoureiro", label: "2º Tesoureiro" },
];

export default function MesaDiretoraContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedYear, setSelectedYear] = useState(
    () => searchParams.get("periodo") || ANOS_DISPONIVEIS[0]
  );

  const [composicoesPorAno, setComposicoesPorAno] = useState(
    COMPOSICOES_MESA_INICIAL
  );

  const handleYearChange = (year: string) => {
    if (year) {
      setSelectedYear(year);
      setSearchParams({ periodo: year });
    }
  };

  const handleSaveComposition = (novaComposicao: ComposicaoMesa) => {
    setComposicoesPorAno((prev) => ({
      ...prev,
      [selectedYear]: novaComposicao,
    }));
    setModalOpen(false);
  };

  const composicaoMesaAtual = composicoesPorAno[selectedYear] || {
    presidente: "",
    vicePresidente: "",
    primeiroSecretario: "",
    segundoSecretario: "",
    primeiroTesoureiro: "",
    segundoTesoureiro: "",
  };

  const membros = {
    presidente: getVereadorById(composicaoMesaAtual.presidente),
    vicePresidente: getVereadorById(composicaoMesaAtual.vicePresidente),
    primeiroSecretario: getVereadorById(composicaoMesaAtual.primeiroSecretario),
    segundoSecretario: getVereadorById(composicaoMesaAtual.segundoSecretario),
    primeiroTesoureiro: getVereadorById(
      composicaoMesaAtual.primeiroTesoureiro
    ),
    segundoTesoureiro: getVereadorById(composicaoMesaAtual.segundoTesoureiro),
  };

  const outrosMembros = CARGOS_OUTROS_MEMBROS.map((cargo) => ({
    vereador: membros[cargo.key as keyof typeof membros],
    cargoLabel: cargo.label,
    cargoKey: cargo.key,
  }));

  return (
    <div className="max-w-6xl mx-auto">
      <MesaDiretoraHeader
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        anosDisponiveis={ANOS_DISPONIVEIS}
        isAdmin={isAdmin}
        onEditClick={() => setModalOpen(true)}
      />

      <PresidenteCard vereador={membros.presidente} ano={selectedYear} />

      <VicePresidenteCard vereador={membros.vicePresidente} ano={selectedYear} />

      <OutrosMembrosGrid membros={outrosMembros} />

      {/* Modal de edição */}
      <ModalEditarMesa
        open={modalOpen}
        onOpenChange={setModalOpen}
        vereadores={VEREADORES}
        composicaoMesa={composicaoMesaAtual}
        onSave={handleSaveComposition}
        ano={selectedYear}
      />
    </div>
  );
}
