import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from 'bcryptjs';
import mysql, { RowDataPacket, OkPacket } from 'mysql2/promise';


const pool = mysql.createPool({
    host:  'localhost',
    user:  'root',
    password:  '579924', 
    database: 'pi_concretiza', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
async function getDbConnection() {
  
  return pool.getConnection();
}


interface UserData {
  nomeCompleto: string; 
  usuario: string;
  senha: string;
  administrador: boolean;
}

interface UserFromDb extends RowDataPacket {
  id: number;
  nome_completo: string; 
  usuario: string;
  administrador: boolean;

}


function isAdmin() {
  const sessionCookie = cookies().get("session");
  if (!sessionCookie) {
    console.log("isAdmin: Nenhum cookie de sessão encontrado.");
    return false;
  }
  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString());
    console.log("isAdmin: Dados da sessão:", sessionData);
    return sessionData.isAdmin === true;
  } catch (error) {
    console.error("isAdmin: Erro ao parsear cookie de sessão:", error);
    return false;
  }
}

export async function GET() {
  console.log("GET /api/users: Verificando permissão de admin...");
  if (!isAdmin()) {
    console.log("GET /api/users: Acesso negado.");
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }
  console.log("GET /api/users: Acesso de admin concedido.");

  let connection;
  try {
    connection = await getDbConnection();
    const [rows] = await connection.execute<UserFromDb[]>(
      "SELECT id, nome_completo, usuario, administrador FROM usuarios"
    );

    const usersForFrontend = rows.map(user => ({
        id: user.id,
        nome_completo: user.nome_completo,
        usuario: user.usuario,
        administrador: !!user.administrador 
    }));

    console.log("GET /api/users: Usuários buscados:", usersForFrontend.length);
    return NextResponse.json(usersForFrontend);
  } catch (error) {
    console.error("GET /api/users: Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Falha ao buscar usuários" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}

export async function POST(request: Request) {
  console.log("POST /api/users: Verificando permissão de admin...");
  if (!isAdmin()) {
    console.log("POST /api/users: Acesso negado.");
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }
  console.log("POST /api/users: Acesso de admin concedido.");

  let connection;
  try {
    const userData: UserData = await request.json();
    console.log("POST /api/users: Dados recebidos:", userData);

    if (!userData.usuario || !userData.senha || !userData.nomeCompleto) {
      console.log("POST /api/users: Validação falhou - campos obrigatórios.");
      return NextResponse.json({ error: "Campos 'usuario', 'senha' e 'nomeCompleto' são obrigatórios" }, { status: 400 });
    }
    if (userData.senha.length < 6) {
      console.log("POST /api/users: Validação falhou - senha curta.");
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres" }, { status: 400 });
    }

    connection = await getDbConnection();
    await connection.beginTransaction();

    const [existingUsers] = await connection.execute<RowDataPacket[]>(
      "SELECT usuario FROM usuarios WHERE usuario = ?",
      [userData.usuario]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      console.log("POST /api/users: Usuário já existe:", userData.usuario);
      return NextResponse.json({ error: "Nome de usuário já existe" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(userData.senha, 10);

    // Ajuste: Nome da tabela 'usuarios', coluna 'nome_completo' na query SQL
    const sql = `
      INSERT INTO usuarios (nome_completo, usuario, senha, administrador)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await connection.execute<OkPacket>(sql, [
      userData.nomeCompleto, // O valor JS ainda é userData.nomeCompleto
      userData.usuario,
      hashedPassword,
      userData.administrador || false,
    ]);

    const insertedUserId = result.insertId;
    console.log("POST /api/users: Novo usuário inserido, ID:", insertedUserId);

    // Ajuste: Nome da tabela 'usuarios' e coluna 'nome_completo' na query SQL
    const [newUserDetailsRows] = await connection.execute<UserFromDb[]>(
        "SELECT id, nome_completo, usuario, administrador FROM usuarios WHERE id = ?",
        [insertedUserId]
    );

    await connection.commit();

    if (newUserDetailsRows.length === 0) {
        console.error("POST /api/users: Falha ao buscar usuário recém-criado, ID:", insertedUserId);
        return NextResponse.json({ error: "Falha ao buscar usuário recém-criado" }, { status: 500 });
    }
    const newUserDetails = newUserDetailsRows[0];

    // Mapear para camelCase para o frontend, se necessário
    const userForFrontend = {
        id: newUserDetails.id,
        nomeCompleto: newUserDetails.nome_completo, // Mapeia de nome_completo (DB) para nomeCompleto (JS)
        usuario: newUserDetails.usuario,
        administrador: !!newUserDetails.administrador // Garante que seja booleano
    };
    console.log("POST /api/users: Usuário cadastrado com sucesso:", userForFrontend);

    return NextResponse.json({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      user: userForFrontend
    }, { status: 201 });

  } catch (error: any) {
    if (connection) await connection.rollback();
    console.error("POST /api/users: Erro ao cadastrar usuário:", error);
    // Adiciona o stack trace ao log do servidor para melhor depuração
    if (error.stack) {
        console.error(error.stack);
    }
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
    return NextResponse.json({ error: "Falha ao cadastrar usuário", details: errorMessage }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}