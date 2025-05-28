import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from 'bcryptjs';
import mysql, { RowDataPacket } from 'mysql2/promise'; // Apenas RowDataPacket é necessário aqui, OkPacket não.

// --- Configuração da Conexão com o MySQL ---
// Certifique-se de que esta função e o pool estejam configurados corretamente
// e que o pool seja criado APENAS UMA VEZ no escopo do módulo.
// Exemplo (coloque isso no escopo do módulo, não dentro da função):
const pool = mysql.createPool({
  host:  'localhost',
  user: 'root',
  password: '', // Use sua senha correta ou variável de ambiente
  database: 'meu_banco_de_dados', // Use seu banco de dados ou variável de ambiente
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getDbConnection() {
  return pool.getConnection();
}
// --- Fim da Configuração da Conexão ---

interface LoginRequest {
  username: string;
  password: string;
}

// Interface para o usuário vindo do banco, incluindo a senha para verificação
interface UserFromDbWithPassword extends RowDataPacket {
  id: number;
  usuario: string;
  senha_hash: string; // Supondo que a coluna da senha no DB seja 'senha' ou 'senha_hash'
  administrador: boolean | number; // MySQL pode retornar 0 ou 1 para boolean
  // nome_completo?: string; // Opcional, se quiser usar no token/resposta
}

export async function POST(request: Request) {
  let connection;
  try {
    const data: LoginRequest = await request.json();

    if (!data.username || !data.password) {
      return NextResponse.json({ error: "Nome de usuário e senha são obrigatórios" }, { status: 400 });
    }

    connection = await getDbConnection();

    // 1. Validar as credenciais contra o banco de dados
    const [rows] = await connection.execute<UserFromDbWithPassword[]>(
      "SELECT id, usuario, senha AS senha_hash, administrador FROM usuarios WHERE usuario = ?",
      [data.username]
    );

    if (rows.length === 0) {
      console.log(`Tentativa de login falhou: Usuário '${data.username}' não encontrado.`);
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const userFromDb = rows[0];

    // 2. Verificar se a senha corresponde (usando bcrypt)
    const passwordMatch = await bcrypt.compare(data.password, userFromDb.senha_hash);

    if (!passwordMatch) {
      console.log(`Tentativa de login falhou: Senha incorreta para o usuário '${data.username}'.`);
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Senha correta, usuário autenticado!
    console.log(`Usuário '${data.username}' autenticado com sucesso.`);
    const isAdminUser = !!userFromDb.administrador; // Converte para booleano (0/1 -> false/true)

    // 3. Gerar um token de sessão (a sua lógica existente é simples e serve para demonstração)
    // Em produção, considere JWT com uma biblioteca robusta e uma chave secreta segura.
    const sessionPayload = {
      userId: userFromDb.id, // Adicionar userId pode ser útil
      username: userFromDb.usuario,
      isAdmin: isAdminUser,
      exp: Date.now() + 24 * 60 * 60 * 1000, // Expira em 24 horas
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

    // Configurar o cookie com o token de sessão
    cookies().set({
      name: "session",
      value: sessionToken,
      httpOnly: true, // Importante para segurança (impede acesso via JS no cliente)
      secure: process.env.NODE_ENV === 'production', // Use 'secure' em produção (HTTPS)
      path: "/",
      maxAge: 60 * 60 * 24, // 1 dia (em segundos)
      sameSite: "strict", // Ajuda a proteger contra ataques CSRF
    });

    return NextResponse.json({
      success: true,
      message: "Login bem-sucedido!",
      user: {
        username: userFromDb.usuario,
        isAdmin: isAdminUser,
        // nomeCompleto: userFromDb.nome_completo, // Se você buscar e quiser retornar
      },
    });

  } catch (error) {
    console.error("Erro de autenticação:", error);
    // Em produção, não envie detalhes do erro ao cliente
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
    return NextResponse.json({ error: "Falha na autenticação", details: process.env.NODE_ENV === 'development' ? errorMessage : undefined }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
      console.log("Conexão com o banco de dados liberada.");
    }
  }
}

// Endpoint de Logout (permanece o mesmo)
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