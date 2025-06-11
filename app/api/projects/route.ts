import { NextResponse } from "next/server";
import mysql, { OkPacket, RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '579924', 
  database: process.env.MYSQL_DATABASE || 'pi_concretiza', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true 
});

async function getDbConnection() {
  return pool.getConnection();
}

interface BudgetFormData {
  contratante: string;
  email: string;
  endereco: string;
  estado: string;
  cliente: string;
  celular: string;
  bairro: string;
  cep: string;
  contato: string;
  documento: string;
  cidade: string;
  ie: string;
  numeroProposta: string;
  vendedora: string;
  data: string; 
  enderecoObra: string;
  profundidade: string;
  profundidade2: string;
  profundidade3: string;
  totalMetros: string;
  totalMetros2: string;
  totalMetros3: string;
  diametro: string;
  diametro2: string;
  diametro3: string;
  previsaoDias: string;
  unidade: string; 
  unidade2: string; 
  unidade3: string;
  paymentOption: "diaria" | "porMetro";
  valorDiaria: string;
  valorPorMetro1: string;
  valorPorMetro2: string;
  valorPorMetro3: string;
  taxaTransporte: string;
  segurancaEquipamento: string;
  art: string;
  observacoes: string;
}

function parseCurrencyToNumber(value: string | null | undefined): number | null {
  if (value === null || value === undefined || typeof value !== 'string' || value.trim() === "") return null;
  try {
    const numericString = value.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();
    const number = parseFloat(numericString);
    return isNaN(number) ? null : number;
  } catch { return null; }
}

function parseStringToNumber(value: string | null | undefined): number | null {
    if (value === null || value === undefined || typeof value !== 'string' || value.trim() === "") return null;
    const number = parseFloat(value);
    return isNaN(number) ? null : number;
}

function sanitizeNumericString(value: string | null | undefined): string | null {
    if (value === null || value === undefined || typeof value !== 'string') return null;
    return value.replace(/\D/g, "") || null;
}


export async function POST(request: Request) {
  let connection;
  console.log('oi')
}