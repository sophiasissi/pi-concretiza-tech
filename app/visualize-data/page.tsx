"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HeaderWithIcons from "../../components/header-with-icons"; // Ajuste o caminho se necessário
import styles from "./visualize-data.module.css"; // Ajuste o caminho se necessário
import { ArrowLeft, X } from "lucide-react";

interface Project {
  id: number; // Mapeado de Orcamentos.id_orcamento
  idProjeto?: number; // Mapeado de Projetos.id_projeto
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
  previsaoDias?: string;
  diaria?: string;
  metro?: string;
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
  const [selectedColumn, setSelectedColumn] = useState("contratante"); // Coluna padrão para filtro
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
          } catch (jsonError) {
            console.warn("A resposta de erro da API não era JSON:", response);
          }
          throw new Error(errorPayload.details || errorPayload.message || `Erro: ${response.status}`);
        }

        const data: Project[] = await response.json();
        console.log("Dados recebidos da API (/api/data):", data);

        if (Array.isArray(data)) {
          setProjects(data);
          setFilteredProjects(data);
        } else {
          console.error("Os dados recebidos da API não são um array:", data);
          throw new Error("Formato de dados inesperado recebido do servidor.");
        }

      } catch (err) {
        console.error("Failed to fetch projects from /api/data:", err);
        setError((err as Error).message || "Falha ao carregar os dados. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProjects(projects);
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = projects.filter((project) => {
      const value = project[selectedColumn]; // selectedColumn é a chave da interface Project
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(lowerCaseSearchTerm);
    });
    setFilteredProjects(filtered);
  }, [searchTerm, selectedColumn, projects]);

  const handleBack = () => {
    router.push("/home"); // Ajuste para a rota correta
  };

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const displayValue = (value: any) => {
    // Se a API retornar datas como objetos Date, formate-as aqui, senão, deixe como está.
    // Exemplo se 'value' for um objeto Date e você quiser DD/MM/YYYY:
    // if (value instanceof Date) {
    //   return value.toLocaleDateString('pt-BR');
    // }
    return value === null || value === undefined || value === "" ? "-" : String(value);
  };

  const openObservationModal = (observationText: string | undefined, projectId?: number) => {
    if (projectId !== undefined) {
      const currentObservation = observationText === "-" || observationText === undefined ? "" : observationText;
      setEditingObservation(currentObservation);
      setCurrentEditingProjectId(projectId);
      setIsModalOpen(true);
    } else {
      console.warn("Tentativa de abrir modal de observação sem ID do projeto válido.");
    }
  };

  const closeObservationModal = () => {
    setIsModalOpen(false);
    setEditingObservation("");
    setCurrentEditingProjectId(null);
  };

  const handleSaveObservation = async () => {
    if (currentEditingProjectId === null) {
      alert("ID do projeto não encontrado para salvar observação.");
      return;
    }
    setIsSavingObservation(true);
    try {
      const response = await fetch("/api/observacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_projeto: currentEditingProjectId,
          descricao: editingObservation,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.details || result.error || "Falha ao salvar observação");
      }
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.idProjeto === currentEditingProjectId 
          ? { ...p, observacoes: editingObservation.trim() === "" ? undefined : editingObservation.trim() } 
          : p
        )
      );
      closeObservationModal();
      alert("Observação salva com sucesso!");
    } catch (err) {
      console.error("Erro ao salvar observação:", err);
      alert((err as Error).message || "Ocorreu um erro ao salvar a observação.");
    } finally {
      setIsSavingObservation(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById("observation-modal");
      if (modal && !modal.contains(event.target as Node) && isModalOpen) {
        closeObservationModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]); // Adicionada dependência correta

  // Define a ordem e os rótulos das colunas para exibição
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
    // { key: "totalMetros2", label: "Total Metros 2" }, // Opcional, não está no seu DDL de Projetos como campo separado para frontend
    { key: "diametro3", label: "Diâmetro 3" },
    { key: "unidades3", label: "Unid. 3 (Qtd)" },
    { key: "profundidade3", label: "Profundidade 3" },
    // { key: "totalMetros3", label: "Total Metros 3" }, // Opcional
    { key: "previsaoDias", label: "Previsão Dias" },
    { key: "diaria", label: "Valor Diária" },
    { key: "metro", label: "Valor Metro" },
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
          <button className={styles.backButton} onClick={handleBack} aria-label="Voltar para a página inicial">
            <ArrowLeft />
          </button>
          <h1 className={styles.title}>Visualize todas as obras já realizadas e filtre a tabela como quiser!</h1>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.filterBar}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Filtrar por:</span>
              {/* O select já está completo no seu código original, mantendo-o */}
              <select className={styles.columnSelect} value={selectedColumn} onChange={handleColumnChange}>
                <option value="contratante">Contratante</option>
                <option value="cliente">Cliente</option>
                <option value="contato">Contato</option>
                <option value="endereco">Endereço</option>
                <option value="bairro">Bairro</option>
                <option value="cidade">Cidade</option>
                <option value="estado">Estado</option>
                <option value="cep">CEP</option>
                <option value="celular">Celular</option>
                <option value="email">Email</option>
                <option value="documento">CNPJ/CPF</option>
                <option value="ie">IE</option>
                <option value="numeroProposta">Número da Proposta</option>
                <option value="vendedora">Vendedora</option>
                <option value="data">Data</option>
                <option value="enderecoObra">Endereço da Obra</option>
                <option value="diametro">Diâmetro</option>
                <option value="diametro2">Diâmetro 2</option>
                <option value="diametro3">Diâmetro 3</option>
                <option value="unidades">Unidades</option>
                <option value="unidades2">Unidades 2</option>
                <option value="unidades3">Unidades 3</option>
                <option value="profundidade">Profundidade</option>
                <option value="profundidade2">Profundidade 2</option>
                <option value="profundidade3">Profundidade 3</option>
                <option value="totalMetros">Total de Metros</option>
                <option value="previsaoDias">Previsão de Dias</option>
                <option value="diaria">Diária</option>
                <option value="metro">Metro</option>
                <option value="taxaTransporte">Taxa de Transporte</option>
                <option value="segurancaEquipamento">Segurança do Equipamento</option>
                <option value="art">ART</option>
                <option value="observacoes">Observações</option>
                <option value="dataInicial">Data Inicial da Obra</option>
                <option value="dataFinal">Data Final da Obra</option>
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

          <div className={styles.tableWrapper}> {/* Adicione overflow-x: auto; aqui no CSS */}
            {isLoading ? (
              <div className={styles.loadingState}>Carregando dados...</div>
            ) : error ? (
              <div className={styles.errorState}>{error}</div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    {columnsToShow.map(col => (
                        <th key={col.key} className={col.key === 'observacoes' ? styles.observacoesColumn : undefined}>
                            {col.label}
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.id}> {/* Usando project.id (id_orcamento) como chave */}
                        {columnsToShow.map(col => (
                            col.isSpecial && col.key === 'observacoes' ? (
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
                    ))
                  ) : (
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

        {/* Observation Modal */}
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
                  className={styles.observationTextarea} // Defina este estilo no seu CSS
                  value={editingObservation}
                  onChange={(e) => setEditingObservation(e.target.value)}
                  rows={10}
                  placeholder="Digite as observações aqui..."
                  disabled={isSavingObservation}
                />
              </div>
              <div className={styles.modalFooter}> {/* Defina este estilo no seu CSS */}
                <button
                  className={styles.cancelButton} // Defina este estilo
                  onClick={closeObservationModal}
                  disabled={isSavingObservation}
                >
                  Cancelar
                </button>
                <button
                  className={styles.saveButton} // Defina este estilo
                  onClick={handleSaveObservation}
                  disabled={isSavingObservation}
                >
                  {isSavingObservation ? "Salvando..." : "Salvar Observação"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}