import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from 'bcryptjs';
import mysql, { RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host:  'localhost',
  user: 'root',
  password: '579924', 
  database: 'pi_concretiza', 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getDbConnection() {
  return pool.getConnection();
}

interface LoginRequest {
  username: string;
  password: string;
}

interface UserFromDbWithPassword extends RowDataPacket {
  id: number;
  usuario: string;
  senha: string;
  administrador: boolean | number; 
}

export async function POST(request: Request) {
  let connection;
  try {
    const data: LoginRequest = await request.json();

    if (!data.username || !data.password) {
      return NextResponse.json({ error: "Nome de usuário e senha são obrigatórios" }, { status: 400 });
    }
    connection = await getDbConnection();
    const [rows] = await connection.execute<UserFromDbWithPassword[]>(
      "SELECT id, usuario, senha AS senha, administrador FROM usuarios WHERE usuario = ?",
      [data.username]
    );

    if (rows.length === 0) {
      console.log(`Tentativa de login falhou: Usuário '${data.username}' não encontrado.`);
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const userFromDb = rows[0];

    const passwordMatch = await bcrypt.compare(data.password, userFromDb.senha);

    if (!passwordMatch) {
      console.log(`Tentativa de login falhou: Senha incorreta para o usuário '${data.username}'.`);
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    console.log(`Usuário '${data.username}' autenticado com sucesso.`);
    const isAdminUser = !!userFromDb.administrador; 

    const sessionPayload = {
      userId: userFromDb.id, 
      username: userFromDb.usuario,
      isAdmin: isAdminUser,
      exp: Date.now() + 24 * 60 * 60 * 1000, 
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    cookies().set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      path: "/",
      maxAge: 60 * 60 * 24, 
      sameSite: "strict", 
    });

    return NextResponse.json({
      success: true,
      message: "Login bem-sucedido!",
      user: {
        username: userFromDb.usuario,
        isAdmin: isAdminUser,
      },
    });

  } catch (error) {
    console.error("Erro de autenticação:", error);
  
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
    return NextResponse.json({ error: "Falha na autenticação", details: process.env.NODE_ENV === 'development' ? errorMessage : undefined }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
      console.log("Conexão com o banco de dados liberada.");
    }
  }
}

export async function DELETE() {
  try {
    console.log("Tentativa de logout: Deletando cookie 'session'.");
    cookies().delete("session");
    return NextResponse.json({ success: true, message: "Logout bem-sucedido." });
  } catch (error) {
    console.error("Erro no logout:", error);
    return NextResponse.json({ error: "Falha ao fazer logout" }, { status: 500 });
  }
}