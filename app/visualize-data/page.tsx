"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderWithIcons from "../../components/header-with-icons"
import styles from "./visualize-data.module.css"
import { ArrowLeft, X } from "lucide-react"

// Update the Project interface to include the new fields
interface Project {
  id: number
  contratante?: string
  cliente?: string
  contato?: string
  endereco?: string
  bairro?: string
  cidade?: string
  cep?: string
  celular?: string
  email?: string
  documento?: string
  ie?: string
  numeroProposta?: string
  vendedora?: string
  data?: string
  enderecoObra?: string
  diametro?: string
  diametro2?: string
  diametro3?: string
  unidades?: string
  unidades2?: string
  unidades3?: string
  profundidade?: string
  profundidade2?: string
  profundidade3?: string
  totalMetros?: string
  previsaoDias?: string
  diaria?: string
  metro?: string
  taxaTransporte?: string
  segurancaEquipamento?: string
  art?: string
  observacoes?: string
  dataInicial?: string
  dataFinal?: string
  [key: string]: any // Index signature for dynamic access
}

export default function VisualizeDataPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [selectedColumn, setSelectedColumn] = useState("contratante")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for observation modal
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch data from the database
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Replace this with your actual API endpoint
        const response = await fetch("/api/projects")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        setProjects(data)
        setFilteredProjects(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch projects:", err)
        setError("Falha ao carregar os dados. Por favor, tente novamente.")

        // For demo purposes only - remove in production
        // Using mock data as fallback when API fails
        const mockData = [
          {
            id: 1,
            contratante: "Construtora Horizonte",
            cliente: "João Silva",
            contato: "Maria Oliveira",
            endereco: "Av. Paulista, 1000",
            bairro: "Bela Vista",
            cidade: "São Paulo",
            cep: "01310-100",
            celular: "(11) 98765-4321",
            email: "joao.silva@email.com",
            documento: "12.345.678/0001-90",
            ie: "123.456.789.000",
            numeroProposta: "PROP-2023-001",
            vendedora: "Ana Santos",
            data: "15/03/2023",
            enderecoObra: "Rua Augusta, 500",
            diametro: "30cm",
            diametro2: "25cm",
            diametro3: null,
            unidades: "10",
            unidades2: "5",
            unidades3: null,
            profundidade: "15m",
            profundidade2: "12m",
            profundidade3: null,
            totalMetros: "150m",
            previsaoDias: "45",
            diaria: "R$ 2.500,00",
            metro: "R$ 350,00",
            taxaTransporte: "R$ 1.800,00",
            segurancaEquipamento: "Sim",
            art: "ART123456",
            observacoes:
              "Terreno com acesso limitado. Necessário agendamento prévio com o cliente. Verificar condições do solo antes de iniciar a perfuração. Área com restrições de horário para obras.",
            dataInicial: "20/04/2023",
            dataFinal: "05/06/2023",
          },
          {
            id: 2,
            contratante: "Incorporadora Visão",
            cliente: "Carlos Mendes",
            contato: null,
            endereco: "Rua Oscar Freire, 500",
            bairro: "Jardins",
            cidade: "São Paulo",
            cep: "01426-001",
            celular: "(11) 97654-3210",
            email: "carlos.mendes@email.com",
            documento: "23.456.789/0001-01",
            ie: null,
            numeroProposta: "PROP-2023-002",
            vendedora: "Beatriz Lima",
            data: "10/05/2023",
            enderecoObra: "Alameda Santos, 700",
            diametro: "40cm",
            diametro2: "35cm",
            diametro3: "30cm",
            unidades: "15",
            unidades2: "8",
            unidades3: "6",
            profundidade: "20m",
            profundidade2: "18m",
            profundidade3: "15m",
            totalMetros: "300m",
            previsaoDias: "60",
            diaria: "R$ 3.000,00",
            metro: "R$ 400,00",
            taxaTransporte: "R$ 2.200,00",
            segurancaEquipamento: "Sim",
            art: "ART234567",
            observacoes:
              "Necessário agendamento prévio com portaria. Obra em área de tráfego intenso, verificar horários permitidos pela prefeitura. Cliente solicitou relatório diário de progresso.",
            dataInicial: "15/06/2023",
            dataFinal: null,
          },
        ]
        setProjects(mockData)
        setFilteredProjects(mockData)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter projects when search term or selected column changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProjects(projects)
      return
    }

    const filtered = projects.filter((project) => {
      const value = project[selectedColumn]
      if (value === null || value === undefined) return false
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    })

    setFilteredProjects(filtered)
  }, [searchTerm, selectedColumn, projects])

  const handleBack = () => {
    router.push("/home")
  }

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Function to display a dash when data is null or undefined
  const displayValue = (value: any) => {
    return value === null || value === undefined ? "-" : value
  }

  // Function to open the observation modal
  const openObservationModal = (observation: string | undefined) => {
    if (observation) {
      setSelectedObservation(observation)
      setIsModalOpen(true)
    }
  }

  // Function to close the observation modal
  const closeObservationModal = () => {
    setIsModalOpen(false)
    setSelectedObservation(null)
  }

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById("observation-modal")
      if (modal && !modal.contains(event.target as Node) && isModalOpen) {
        closeObservationModal()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen])

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

              <select className={styles.columnSelect} value={selectedColumn} onChange={handleColumnChange}>
                <option value="contratante">Contratante</option>
                <option value="cliente">Cliente</option>
                <option value="contato">Contato</option>
                <option value="endereco">Endereço</option>
                <option value="bairro">Bairro</option>
                <option value="cidade">Cidade</option>
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

          <div className={styles.tableWrapper}>
            {isLoading ? (
              <div className={styles.loadingState}>Carregando dados...</div>
            ) : error ? (
              <div className={styles.errorState}>{error}</div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th>Contratante</th>
                    <th>Cliente</th>
                    <th>Contato</th>
                    <th>Endereço</th>
                    <th>Bairro</th>
                    <th>Cidade</th>
                    <th>CEP</th>
                    <th>Celular</th>
                    <th>Email</th>
                    <th>CNPJ/CPF</th>
                    <th>IE</th>
                    <th>Número da Proposta</th>
                    <th>Vendedora</th>
                    <th>Data</th>
                    <th>Endereço da Obra</th>
                    <th>Diâmetro</th>
                    <th>Diâmetro 2</th>
                    <th>Diâmetro 3</th>
                    <th>Unidades</th>
                    <th>Unidades 2</th>
                    <th>Unidades 3</th>
                    <th>Profundidade</th>
                    <th>Profundidade 2</th>
                    <th>Profundidade 3</th>
                    <th>Total de Metros</th>
                    <th>Previsão de Dias</th>
                    <th>Diária</th>
                    <th>Metro</th>
                    <th>Taxa de Transporte</th>
                    <th>Segurança do Equipamento</th>
                    <th>ART</th>
                    <th className={styles.observacoesColumn}>Observações</th>
                    <th>Data Inicial da Obra</th>
                    <th>Data Final da Obra</th>
                  </tr>
                </thead>

                <tbody className={styles.tableBody}>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td>{displayValue(project.contratante)}</td>
                        <td>{displayValue(project.cliente)}</td>
                        <td>{displayValue(project.contato)}</td>
                        <td>{displayValue(project.endereco)}</td>
                        <td>{displayValue(project.bairro)}</td>
                        <td>{displayValue(project.cidade)}</td>
                        <td>{displayValue(project.cep)}</td>
                        <td>{displayValue(project.celular)}</td>
                        <td>{displayValue(project.email)}</td>
                        <td>{displayValue(project.documento)}</td>
                        <td>{displayValue(project.ie)}</td>
                        <td>{displayValue(project.numeroProposta)}</td>
                        <td>{displayValue(project.vendedora)}</td>
                        <td>{displayValue(project.data)}</td>
                        <td>{displayValue(project.enderecoObra)}</td>
                        <td>{displayValue(project.diametro)}</td>
                        <td>{displayValue(project.diametro2)}</td>
                        <td>{displayValue(project.diametro3)}</td>
                        <td>{displayValue(project.unidades)}</td>
                        <td>{displayValue(project.unidades2)}</td>
                        <td>{displayValue(project.unidades3)}</td>
                        <td>{displayValue(project.profundidade)}</td>
                        <td>{displayValue(project.profundidade2)}</td>
                        <td>{displayValue(project.profundidade3)}</td>
                        <td>{displayValue(project.totalMetros)}</td>
                        <td>{displayValue(project.previsaoDias)}</td>
                        <td>{displayValue(project.diaria)}</td>
                        <td>{displayValue(project.metro)}</td>
                        <td>{displayValue(project.taxaTransporte)}</td>
                        <td>{displayValue(project.segurancaEquipamento)}</td>
                        <td>{displayValue(project.art)}</td>
                        <td
                          className={styles.observacoesCell}
                          onClick={() => openObservationModal(project.observacoes)}
                          title={project.observacoes ? "Clique para ver detalhes" : ""}
                        >
                          {project.observacoes ? "Ver observações" : "-"}
                        </td>
                        <td>{displayValue(project.dataInicial)}</td>
                        <td>{displayValue(project.dataFinal)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={34} className={styles.emptyState}>
                        Nenhum resultado encontrado para sua busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Observation Modal */}
        {isModalOpen && selectedObservation && (
          <div className={styles.modalOverlay}>
            <div id="observation-modal" className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Observações</h3>
                <button className={styles.closeButton} onClick={closeObservationModal} aria-label="Fechar modal">
                  <X size={20} />
                </button>
              </div>
              <div className={styles.modalContent}>
                <p>{selectedObservation}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}