import { NextResponse } from "next/server";
import mysql, { OkPacket, RowDataPacket } from 'mysql2/promise';

// --- Configuração da Conexão com o MySQL (MANTENHA A SUA CONFIGURAÇÃO CORRETA) ---
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '579924', // Sua senha correta
  database: process.env.MYSQL_DATABASE || 'pi_concretiza', // Seu banco
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true // Importante para DECIMALS como números
});

async function getDbConnection() {
  return pool.getConnection();
}
// --- Fim da Configuração da Conexão ---

interface BudgetFormData { // Copiada do seu frontend
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
  data: string; // Esperado YYYY-MM-DD
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
  unidade: string; // Quantidade para o item principal
  unidade2: string; // Quantidade para o item adicional 1
  unidade3: string; // Quantidade para o item adicional 2
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

// Função para limpar telefone/CEP para apenas dígitos
function sanitizeNumericString(value: string | null | undefined): string | null {
    if (value === null || value === undefined || typeof value !== 'string') return null;
    return value.replace(/\D/g, "") || null;
}


export async function POST(request: Request) {
  let connection;
  console.log('oi')
  // try {
  //   const formData: BudgetFormData = await request.json();
  //   connection = await getDbConnection();
  //   await connection.beginTransaction();

  //   // 1. Inserir/Obter Cliente
  //   // ATENÇÃO: Seus IDs não são AUTO_INCREMENT, o que exigiria lógica de geração de ID ou que eles venham do frontend.
  //   // O código abaixo assume que AUTO_INCREMENT está habilitado no MySQL para `id_cliente` para `insertId` funcionar.
  //   // Se não for, esta parte precisa ser drasticamente alterada.
  //   let clienteId: number;
  //   const [existingClientes] = await connection.execute<RowDataPacket[]>(
  //     "SELECT id_cliente FROM Clientes WHERE cpf_cnpj = ?",
  //     [formData.documento] // Assumindo que cpf_cnpj é unique e o identificador principal
  //   );

  //   const clienteDataForDb = {
  //       nome: formData.cliente, // Mapeado de formData.cliente
  //       contato: sanitizeNumericString(formData.contato), // Usando a coluna 'contato' da sua DDL para o telefone principal
  //       endereco: formData.endereco,
  //       bairro: formData.bairro,
  //       cidade: formData.cidade,
  //       estado: formData.estado.toUpperCase(), // Adicionado ao seu DDL
  //       cep: sanitizeNumericString(formData.cep),
  //       celular: sanitizeNumericString(formData.celular),
  //       email: formData.email,
  //       cpf_cnpj: formData.documento, // Manter formatação se o banco permitir, ou limpar com .replace(/\D/g, "")
  //       inscricao_estadual: formData.ie || null
  //   };

  //   if (existingClientes.length > 0) {
  //     clienteId = existingClientes[0].id_cliente;
  //     // Opcional: Atualizar dados do cliente existente
  //     // await connection.execute(
  //     //   "UPDATE Clientes SET nome = ?, contato = ?, endereco = ?, bairro = ?, cidade = ?, estado = ?, cep = ?, celular = ?, email = ?, inscricao_estadual = ? WHERE id_cliente = ?",
  //     //   [clienteDataForDb.nome, clienteDataForDb.contato, clienteDataForDb.endereco, clienteDataForDb.bairro, clienteDataForDb.cidade, clienteDataForDb.estado, clienteDataForDb.cep, clienteDataForDb.celular, clienteDataForDb.email, clienteDataForDb.inscricao_estadual, clienteId]
  //     // );
  //     console.log(`Cliente existente utilizado/atualizado: ID ${clienteId}`);
  //   } else {
  //     // ATENÇÃO: Se id_cliente não for AUTO_INCREMENT, esta query falhará ou precisará de um ID.
  //     const [clienteResult] = await connection.execute<OkPacket>(
  //       `INSERT INTO Clientes (nome, contato, endereco, bairro, cidade, estado, cep, celular, email, cpf_cnpj, inscricao_estadual)
  //        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  //       [
  //           clienteDataForDb.nome, clienteDataForDb.contato, clienteDataForDb.endereco, clienteDataForDb.bairro,
  //           clienteDataForDb.cidade, clienteDataForDb.estado, clienteDataForDb.cep, clienteDataForDb.celular,
  //           clienteDataForDb.email, clienteDataForDb.cpf_cnpj, clienteDataForDb.inscricao_estadual
  //       ]
  //     );
  //     clienteId = clienteResult.insertId; // Só funciona com AUTO_INCREMENT
  //     console.log(`Novo cliente inserido: ID ${clienteId}`);
  //   }

  //   // 2. Inserir Orçamento
  //   // ATENÇÃO: Mesma observação sobre AUTO_INCREMENT para id_orcamento.
  //   // ATENÇÃO: Sua coluna `data` em `Orcamentos` é NVARCHAR(8). `formData.data` vem como `YYYY-MM-DD` (10 chars).
  //   // Isso causará truncamento. A coluna deveria ser DATE ou VARCHAR(10).
  //   const [orcamentoResult] = await connection.execute<OkPacket>(
  //     `INSERT INTO Orcamentos (id_cliente, numero_proposta, vendedora, data)
  //      VALUES (?, ?, ?, ?)`,
  //     [clienteId, formData.numeroProposta, formData.vendedora, formData.data]
  //   );
  //   const orcamentoId = orcamentoResult.insertId; // Só funciona com AUTO_INCREMENT
  //   console.log(`Novo orçamento inserido: ID ${orcamentoId}`);

  //   // 3. Inserir Projeto
  //   // ATENÇÃO: Mesma observação sobre AUTO_INCREMENT para id_projeto.
  //   // ATENÇÃO: Suas colunas para valores numéricos (diametro, profundidade, etc.) são NVARCHAR.
  //   // O código abaixo parseia para número, mas o MySQL converterá de volta para string na inserção.
  //   // Idealmente, mude os tipos no banco para DECIMAL ou INT.
  //   // A coluna `unidades` na sua tabela projetos armazenará a quantidade (ex: formData.unidade).
  //   const [projetoResult] = await connection.execute<OkPacket>(
  //     `INSERT INTO projetos (id_orcamento, endereco_obra,
  //       diametro, unidades, profundidade,
  //       diametro1, unidades1, profundidade1,
  //       diametro2, unidades2, profundidade2,
  //       total_metros, total_metros1, total_metros2,
  //       previsao_dias, valor_diaria, valor_metro,
  //       taxa_transporte_maquina, seguranca_equipamento, art)
  //      VALUES (?, ?,
  //              ?, ?, ?,
  //              ?, ?, ?,
  //              ?, ?, ?,
  //              ?, ?, ?,
  //              ?, ?, ?,
  //              ?, ?, ?)`,
  //     [
  //       orcamentoId, formData.enderecoObra,
  //       formData.diametro, formData.unidade, formData.profundidade, // Item principal
  //       formData.diametro2, formData.unidade2, formData.profundidade2, // Item adicional 1 (mapeado do formData ...2)
  //       formData.diametro3, formData.unidade3, formData.profundidade3, // Item adicional 2 (mapeado do formData ...3)
  //       formData.totalMetros, formData.totalMetros2, formData.totalMetros3,
  //       formData.previsaoDias,
  //       // Lógica para valor_diaria e valor_metro baseada na paymentOption
  //       formData.paymentOption === 'diaria' ? formData.valorDiaria : null, // Armazenando formatado como string
  //       formData.paymentOption === 'porMetro' ? formData.valorPorMetro1 : null, // Usando valorPorMetro1 para o campo valor_metro
  //       formData.taxaTransporte, formData.segurancaEquipamento, formData.art
  //     ]
  //   );
  //   const projetoId = projetoResult.insertId; // Só funciona com AUTO_INCREMENT
  //   console.log(`Novo projeto inserido: ID ${projetoId}`);

  //   // (Opcional) Armazenar valorPorMetro2 e valorPorMetro3 se a tabela projetos fosse expandida ou normalizada.
  //   // Atualmente, eles não são armazenados devido à estrutura da tabela projetos.

  //   // 4. Inserir Observações (se houver)
  //   // ATENÇÃO: Mesma observação sobre AUTO_INCREMENT para id_observacao.
  //   if (formData.observacoes && formData.observacoes.trim() !== "") {
  //     await connection.execute<OkPacket>(
  //       `INSERT INTO observacoes (id_projeto, descricao)
  //        VALUES (?, ?)`,
  //       [projetoId, formData.observacoes.trim()]
  //     );
  //     console.log(`Observações inseridas para projeto ID ${projetoId}`);
  //   }

  //   await connection.commit();
  //   console.log("Transação concluída com sucesso.");

  //   return NextResponse.json({
  //     success: true,
  //     message: "Orçamento salvo com sucesso!",
  //     orcamentoId: orcamentoId,
  //     clienteId: clienteId,
  //     projetoId: projetoId
  //   }, { status: 201 });

  // } catch (error: any) {
  //   if (connection) await connection.rollback();
  //   console.error("API /orcamentos: Erro ao salvar orçamento:", error);
  //   return NextResponse.json({
  //     error: "Falha ao salvar orçamento",
  //     details: error.message,
  //     stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  //   }, { status: 500 });
  // } finally {
  //   if (connection) connection.release();
  // }
}