import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from 'mysql2/promise';

// --- Configuração da Conexão com o MySQL ---
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '', // Sua senha correta
  database: process.env.MYSQL_DATABASE || 'meu_banco_de_dados', // Seu banco de dados
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true
});

async function getDbConnection() {
  return pool.getConnection();
}
// --- Fim da Configuração da Conexão ---

export async function GET(request: Request) {
  let connection;
  console.log("GET /api/data: Recebida requisição para buscar dados.");

  try {
    connection = await getDbConnection();

    const query = `
      SELECT
          o.id_orcamento AS id,
          p.id_projeto AS idProjeto,         -- ID do Projeto, crucial para editar observações
          c.nome AS cliente,
          c.nome AS contratante,             -- Ajuste se 'contratante' tiver uma fonte diferente de Clientes.nome
          c.contato,                         -- Telefone de Clientes.contato
          c.endereco,
          c.bairro,
          c.cidade,
          c.estado,
          c.cep,
          c.celular,
          c.email,
          c.cpf_cnpj AS documento,
          c.inscricao_estadual AS ie,
          o.numero_proposta AS numeroProposta,
          o.vendedora,
          o.data,                            -- Data da proposta (NVARCHAR(10) no DB)
          p.endereco_obra AS enderecoObra,
          p.diametro,
          p.diametro1 AS diametro2,
          p.diametro2 AS diametro3,
          p.unidades,
          p.unidades1 AS unidades2,
          p.unidades2 AS unidades3,
          p.profundidade,
          p.profundidade1 AS profundidade2,
          p.profundidade2 AS profundidade3,
          p.total_metros AS totalMetros,
          p.previsao_dias AS previsaoDias,
          p.valor_diaria AS diaria,
          p.valor_metro AS metro,
          p.taxa_transporte_maquina AS taxaTransporte,
          p.seguranca_equipamento AS segurancaEquipamento,
          p.art,
          GROUP_CONCAT(DISTINCT obs.descricao SEPARATOR '\\n') AS observacoes,
          NULL AS dataInicial, -- Se tiver no DB (ex: p.data_inicio_prevista), substitua NULL
          NULL AS dataFinal    -- Se tiver no DB (ex: p.data_termino_prevista), substitua NULL
      FROM
          Orcamentos o
      JOIN
          Clientes c ON o.id_cliente = c.id_cliente
      JOIN
          Projetos p ON o.id_orcamento = p.id_orcamento
      LEFT JOIN
          Observacoes obs ON p.id_projeto = obs.id_projeto
      GROUP BY
          o.id_orcamento, p.id_projeto, -- Chaves primárias das tabelas principais no JOIN e não agregadas
          c.id_cliente, c.nome, c.contato, c.endereco, c.bairro, c.cidade, c.estado, c.cep, c.celular, c.email, c.cpf_cnpj, c.inscricao_estadual,
          o.numero_proposta, o.vendedora, o.data,
          p.endereco_obra, p.diametro, p.unidades, p.profundidade, p.diametro1, p.unidades1, p.profundidade1,
          p.diametro2, p.unidades2, p.profundidade2, p.total_metros, p.total_metros1, p.total_metros2,
          p.previsao_dias, p.valor_diaria, p.valor_metro, p.taxa_transporte_maquina, p.seguranca_equipamento, p.art
      ORDER BY
          o.id_orcamento DESC;
    `;

    const [results] = await connection.execute<RowDataPacket[]>(query);
    console.log(`GET /api/data: ${results.length} registros encontrados.`);
    
    // A interface Project do frontend espera strings para a maioria dos campos,
    // e seu DDL já usa NVARCHAR para muitos deles, então a conversão direta é geralmente ok.
    // Se Orcamentos.data for DATE no DB, formate se necessário, ou deixe o frontend formatar.
    // Ex: results.map(row => ({...row, data: formatDate(row.data)}))
    return NextResponse.json(results);

  } catch (error: any) {
    console.error("GET /api/data: Erro ao buscar dados:", error);
    const errorDetails = process.env.NODE_ENV === 'development' ? { details: error.message, stack: error.stack } : { details: "Erro interno no servidor." };
    return NextResponse.json(
      { error: "Falha ao buscar dados do servidor", ...errorDetails },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.release();
        console.log("GET /api/data: Conexão com o banco de dados liberada.");
      } catch (releaseError) {
        console.error("GET /api/data: Erro ao liberar conexão com o banco:", releaseError);
      }
    }
  }
}

// Se este endpoint também for responsável por CRIAR orçamentos (via POST),
// adicione a função POST que implementamos para salvar os dados do formulário de orçamento aqui.
// Ex: export async function POST(request: Request) { /* ... sua lógica de salvar ... */ }