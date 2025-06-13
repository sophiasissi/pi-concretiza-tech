"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderWithIcons from "../../components/header-with-icons";
import styles from "./visualize-data.module.css";
import { ArrowLeft, X } from "lucide-react";

interface Project {
  id: number;
  idProjeto?: number;
  contratante?: string;
  cliente?: string;
  contato?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  celular?: string;
  email?: string;
  documento?: string;
  ie?: string;
  numeroProposta?: string;
  vendedora?: string;
  data?: string;
  enderecoObra?: string;
  diametro?: string;
  diametro2?: string;
  diametro3?: string;
  unidades?: string;
  unidades2?: string;
  unidades3?: string;
  profundidade?: string;
  profundidade2?: string;
  profundidade3?: string;
  totalMetros?: string;
  totalMetros2?: string;
  totalMetros3?: string;
  previsaoDias?: string;
  diaria?: string;
  metro?: string;
  metro2?: string;
  metro3?: string;
  taxaTransporte?: string;
  segurancaEquipamento?: string;
  art?: string;
  observacoes?: string;
  dataInicial?: string;
  dataFinal?: string;
  [key: string]: any;
}

export default function VisualizeDataPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<keyof Project>("contratante");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingObservation, setEditingObservation] = useState<string>("");
  const [currentEditingProjectId, setCurrentEditingProjectId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingObservation, setIsSavingObservation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/data");
        if (!response.ok) {
          let errorPayload = { details: `Erro HTTP: ${response.status}`, message: `Erro HTTP: ${response.status}` };
          try {
            errorPayload = await response.json();
          } catch {
            console.warn("A resposta de erro da API não era JSON:", response);
          }
          throw new Error(errorPayload.details || errorPayload.message || `Erro: ${response.status}`);
        }
        const data: Project[] = await response.json();
        if (Array.isArray(data)) {
          setProjects(data);
          setFilteredProjects(data);
        } else {
          throw new Error("Formato de dados inesperado recebido do servidor.");
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = projects.filter((project) => {
      const value = project[selectedColumn];
      if (value == null) return false;
      return String(value).toLowerCase().includes(lower);
    });
    setFilteredProjects(filtered);
  }, [searchTerm, selectedColumn, projects]);

  const handleBack = () => router.push("/home");
  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedColumn(e.target.value as keyof Project);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const displayValue = (value: any) => (value === null || value === undefined || value === "" ? "-" : String(value));

  const openObservationModal = (obs: string | undefined, idProjeto?: number) => {
    if (idProjeto !== undefined) {
      setEditingObservation(obs && obs !== "-" ? obs : "");
      setCurrentEditingProjectId(idProjeto);
      setIsModalOpen(true);
    }
  };
  const closeObservationModal = () => {
    setIsModalOpen(false);
    setEditingObservation("");
    setCurrentEditingProjectId(null);
  };
  const handleSaveObservation = async () => {
    if (currentEditingProjectId == null) return;
    setIsSavingObservation(true);
    try {
      const res = await fetch("/api/observacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_projeto: currentEditingProjectId, descricao: editingObservation }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.details || result.error || "Falha ao salvar observação");
      setProjects(prev => prev.map(p => p.idProjeto === currentEditingProjectId ? { ...p, observacoes: editingObservation.trim() || undefined } : p));
      closeObservationModal();
      alert("Observação salva com sucesso!");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingObservation(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const modal = document.getElementById("observation-modal");
      if (modal && !modal.contains(e.target as Node) && isModalOpen) closeObservationModal();
    };
    if (isModalOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  const columnsToShow: Array<{ key: keyof Project; label: string; isSpecial?: boolean }> = [
    { key: "contratante", label: "Contratante" },
    { key: "cliente", label: "Cliente" },
    { key: "contato", label: "Contato (Tel.)" },
    { key: "endereco", label: "Endereço Cliente" },
    { key: "bairro", label: "Bairro Cliente" },
    { key: "cidade", label: "Cidade Cliente" },
    { key: "estado", label: "Estado Cliente" },
    { key: "cep", label: "CEP Cliente" },
    { key: "celular", label: "Celular Cliente" },
    { key: "email", label: "Email Cliente" },
    { key: "documento", label: "CNPJ/CPF" },
    { key: "ie", label: "IE" },
    { key: "numeroProposta", label: "Nº Proposta" },
    { key: "vendedora", label: "Vendedora" },
    { key: "data", label: "Data Proposta" },
    { key: "enderecoObra", label: "Endereço da Obra" },
    { key: "diametro", label: "Diâmetro" },
    { key: "unidades", label: "Unid. (Qtd)" },
    { key: "profundidade", label: "Profundidade" },
    { key: "totalMetros", label: "Total Metros" },
    { key: "diametro2", label: "Diâmetro 2" },
    { key: "unidades2", label: "Unid. 2 (Qtd)" },
    { key: "profundidade2", label: "Profundidade 2" },
    { key: "totalMetros2", label: "Total Metros 2" },
    { key: "diametro3", label: "Diâmetro 3" },
    { key: "unidades3", label: "Unid. 3 (Qtd)" },
    { key: "profundidade3", label: "Profundidade 3" },
    { key: "totalMetros3", label: "Total Metros 3" },
    { key: "previsaoDias", label: "Previsão Dias" },
    { key: "diaria", label: "Valor Diária" },
    { key: "metro", label: "Valor Metro" },
    { key: "metro2", label: "Valor Metro 2" },
    { key: "metro3", label: "Valor Metro 3" },
    { key: "taxaTransporte", label: "Taxa Transporte" },
    { key: "segurancaEquipamento", label: "Segurança Equip." },
    { key: "art", label: "ART" },
    { key: "observacoes", label: "Observações", isSpecial: true },
    { key: "dataInicial", label: "Data Inicial Obra" },
    { key: "dataFinal", label: "Data Final Obra" },
  ];

  return (
    <div className={styles.container}>
      <HeaderWithIcons />
      <main className={styles.content}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={handleBack} aria-label="Voltar">
            <ArrowLeft />
          </button>
          <h1 className={styles.title}>
            Visualize todas as obras já realizadas e filtre como quiser!
          </h1>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Filtrar por:</span>
              <select className={styles.columnSelect} value={selectedColumn} onChange={handleColumnChange}>
                {columnsToShow.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Digite para filtrar..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            {isLoading ? (
              <div className={styles.loadingState}>Carregando dados...</div>
            ) : error ? (
              <div className={styles.errorState}>{error}</div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    {columnsToShow.map(col => (
                      <th key={col.key} className={col.isSpecial ? styles.observacoesColumn : undefined}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {filteredProjects.length ? filteredProjects.map(project => (
                    <tr key={project.id}>
                      {columnsToShow.map(col => (
                        col.isSpecial && col.key === "observacoes" ? (
                          <td
                            key={col.key}
                            className={styles.observacoesCell}
                            onClick={() => openObservationModal(project.observacoes, project.idProjeto)}
                            title={project.observacoes && displayValue(project.observacoes) !== "-" ? "Clique para ver/editar" : "Adicionar observação"}
                            style={{ cursor: "pointer" }}
                          >
                            {project.observacoes && displayValue(project.observacoes) !== "-" ? "Ver/Editar" : "Adicionar"}
                          </td>
                        ) : (
                          <td key={col.key}>{displayValue(project[col.key])}</td>
                        )
                      ))}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={columnsToShow.length} className={styles.emptyState}>
                        Nenhum projeto encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div id="observation-modal" className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Observações do Projeto ID: {currentEditingProjectId}</h3>
                <button className={styles.closeButton} onClick={closeObservationModal} aria-label="Fechar modal">
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalContent}>
                <textarea
                  className={styles.observationTextarea}
                  value={editingObservation}
                  onChange={e => setEditingObservation(e.target.value)}
                  rows={10} 
                  placeholder="Digite as observações aqui..."
                  disabled={isSavingObservation}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}