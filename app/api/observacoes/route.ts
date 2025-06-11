import { NextResponse } from "next/server";
import mysql, { OkPacket, ResultSetHeader } from 'mysql2/promise';


const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '579924',
  database: process.env.MYSQL_DATABASE || 'pi_concretiza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function getDbConnection() {
  return pool.getConnection();
}

interface UpdateObservationRequest {
  id_projeto: number;
  descricao: string;
}

export async function POST(request: Request) {
  let connection;
  try {
    const { id_projeto, descricao }: UpdateObservationRequest = await request.json();

    if (id_projeto === undefined || id_projeto === null || typeof id_projeto !== 'number') {
      return NextResponse.json({ error: "ID do projeto inválido ou ausente." }, { status: 400 });
    }

    const newDescricao = typeof descricao === 'string' ? descricao.trim() : "";

    connection = await getDbConnection();
    await connection.beginTransaction();

    if (newDescricao === "") {
      const [deleteResult] = await connection.execute<ResultSetHeader>(
        "DELETE FROM observacoes WHERE id_projeto = ?",
        [id_projeto]
      );
      console.log(`Observações para o projeto ID ${id_projeto} deletadas: ${deleteResult.affectedRows} linha(s) afetada(s).`);
    } else {
      const [updateResult] = await connection.execute<ResultSetHeader>(
        "UPDATE observacoes SET descricao = ? WHERE id_projeto = ?",
        [newDescricao, id_projeto]
      );

      console.log(`Tentativa de UPDATE para projeto ID ${id_projeto}: ${updateResult.affectedRows} linha(s) atualizada(s).`);

      if (updateResult.affectedRows === 0) {
        await connection.execute<OkPacket>(
          "INSERT INTO observacoes (id_projeto, descricao) VALUES (?, ?)", 
          [id_projeto, newDescricao]
        );
        console.log(`Nova observação inserida para o projeto ID ${id_projeto}.`);
      }
    }

    await connection.commit();

    return NextResponse.json({ success: true, message: "Observação atualizada com sucesso!" });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("API /api/observacoes: Erro ao atualizar observação:", error);
    const errorDetails = process.env.NODE_ENV === 'development' ? { details: error.message, stack: error.stack } : { details: "Erro interno no servidor." };
    return NextResponse.json(
      { error: "Falha ao atualizar observação", ...errorDetails },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.release();
      } catch (releaseError) {
        console.error("API /api/observacoes: Erro ao liberar conexão:", releaseError);
      }
    }
  }
}