import { NextResponse } from "next/server"

// This is a placeholder API route that would be replaced with actual database queries
export async function GET() {
  try {
    // In a real application, you would fetch data from your database here
    // Example with a database client:
    // const db = await connectToDatabase()
    // const projects = await db.collection('projects').find({}).toArray()

    // For demonstration purposes, we're returning mock data
    const projects = [
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
        observacoes: null,
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
        observacoes: "Necessário agendamento prévio",
        dataInicial: "15/06/2023",
        dataFinal: null,
      },
    ]

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
