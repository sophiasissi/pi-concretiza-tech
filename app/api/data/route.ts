import { NextResponse } from "next/server";
import mysql, { RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '579924',
  database: process.env.MYSQL_DATABASE || 'pi_concretiza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

async function getDbConnection() {
  return pool.getConnection();
}

export async function GET(request: Request) {
  let connection;
  console.log("GET /api/data: Recebida requisição para buscar dados.");

  try {
    connection = await getDbConnection();

    const query = `
      SELECT
          o.id_orcamento AS id,
          p.id_projeto AS idProjeto,
          c.nome AS cliente,
          c.nome AS contratante,
          c.contato,
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
          o.data,
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
          p.total_metros1 AS totalMetros2,
          p.total_metros2 AS totalMetros3,
          p.previsao_dias AS previsaoDias,
          p.valor_diaria AS diaria,
          p.valor_metro AS metro,
          p.valor_metro1 AS metro2,
          p.valor_metro2 AS metro3,
          p.taxa_transporte_maquina AS taxaTransporte,
          p.seguranca_equipamento AS segurancaEquipamento,
          p.art,
          p.dataInicio AS dataInicial,
          p.dataFinal AS dataFinal,
          GROUP_CONCAT(DISTINCT obs.descricao SEPARATOR '\n') AS observacoes
      FROM
          orcamentos o
      JOIN clientes c ON o.id_cliente = c.id_cliente
      JOIN projetos p ON o.id_orcamento = p.id_orcamento
      LEFT JOIN observacoes obs ON p.id_projeto = obs.id_projeto
      GROUP BY
          o.id_orcamento,
          p.id_projeto,
          c.id_cliente, c.nome, c.contato, c.endereco, c.bairro, c.cidade, c.estado, c.cep, c.celular, c.email, c.cpf_cnpj, c.inscricao_estadual,
          o.numero_proposta, o.vendedora, o.data,
          p.endereco_obra, p.diametro, p.diametro1, p.diametro2, p.unidades, p.unidades1, p.unidades2, p.profundidade, p.profundidade1, p.profundidade2,
          p.total_metros, p.total_metros1, p.total_metros2,
          p.previsao_dias, p.valor_diaria, p.valor_metro, p.valor_metro1, p.valor_metro2, p.taxa_transporte_maquina, p.seguranca_equipamento, p.art,
          p.dataInicio, p.dataFinal
      ORDER BY
          o.id_orcamento DESC;
    `;

    const [results] = await connection.execute<RowDataPacket[]>(query);
    console.log(`GET /api/data: ${results.length} registros encontrados.`);

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("GET /api/data: Erro ao buscar dados:", error);
    const errorDetails = process.env.NODE_ENV === 'development'
      ? { details: error.message, stack: error.stack }
      : { details: "Erro interno no servidor." };

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