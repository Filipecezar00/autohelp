import pool from "../config/database.js";
import bcrypt from "bcrypt";

export async function buscarPerfil(req, res) {
  try {
    const usuarioId = req.user.id;

    const [usuarios] = await pool.query(
      `SELECT usuarios.id, usuarios.nome, usuarios.email,
     usuarios.tipo,prestadores.tipo_servico,prestadores.descricao,prestadores.latitude,
     prestadores.longitude,prestadores.ativo FROM usuarios LEFT JOIN prestadores ON prestadores.usuario_id=
     usuarios.id WHERE usuarios.id = ? 
    `,
      [usuarioId],
    );
    if (usuarios.length === 0) {
      res.status(404).json({ message: "Usuário não encontrado" });
    }

    const usuario = usuarios[0];

    return res.status(200).json({ usuario: usuario });
  } catch (error) {
    console.error("DETALHES DO ERRO AO BUSCAR PERFIL DO USUÁRIO:", error);
    res.status(500).json({ message: "Erro ao buscar perfil" });
  }
}

export async function atualizarDados(req, res) {
  try {
    const usuarioId = req.user.id;
    const { nome, telefone, descricao } = req.body;

    const [usuarios] = await pool.query(
      "SELECT nome FROM usuarios WHERE id = ?",
      [usuarioId],
    );
    const usuarioAtual = usuarios[0];

    const nomeFinal = nome && nome.trim() !== "" ? nome : usuarioAtual.nome;
    if (!nome || nome.trim().length < 2) {
      return res.status(400).json({ message: "Nome Inválido" });
    }

    await pool.query(`UPDATE usuarios SET nome = ?,telefone=? WHERE id = ?`, [
      nomeFinal,
      telefone,
      usuarioId,
    ]);

    if (req.user.tipo === "prestador") {
      await pool.query(
        `UPDATE prestadores SET descricao = ? WHERE usuario_id = ?`,
        [descricao, usuarioId],
      );
    }

    const [linhas] = await pool.query(
      `SELECT usuarios.id, usuarios.nome, usuarios.email, usuarios.telefone, usuarios.tipo,
         prestadores.tipo_servico, prestadores.descricao, prestadores.latitude, prestadores.longitude,
         prestadores.ativo FROM usuarios 
         LEFT JOIN prestadores ON prestadores.usuario_id = usuarios.id
         WHERE usuarios.id = ?
        `,
      [usuarioId],
    );

    const dadosAtualizados = linhas[0];

    return res.status(200).json({ message: dadosAtualizados });
  } catch (error) {
    res.status(500).json({ message: "Erro ao realizar atualização dos dados" });
    console.error("ERRO AO REALIZAR ATUALIZAÇÃO DOS DADOS:", error);
  }
}

export async function trocarSenha(req, res) {
  try {
    const usuarioId = req.user.id;
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }
    if (novaSenha.length < 6) {
      return res
        .status(400)
        .json({ message: "A nova senha deve conter pelo menos 6 caracteres" });
    }
    if (senhaAtual === novaSenha) {
      return res
        .status(400)
        .json({ message: "A nova senha deve ser diferente da atual" });
    }
    const [usuarios] = await pool.query(
      `SELECT senha FROM usuarios WHERE id = ?`,
      [usuarioId],
    );

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuario não encontrado." });
    }
    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha atual Incorreta" });
    }

    const novoHash = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      `
    UPDATE usuarios SET senha = ? WHERE ID = ?
    `,
      [novoHash, usuarioId],
    );

    return res.status(200).json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    console.error("ERRO AO REALIZAR TROCA DE SENHA: ", error);
    res.status(500).json({ message: "Erro ao realizar mudança de senha" });
  }
}

export async function deletarConta(req, res) {
  try {
    const usuarioId = req.user.id;
    const { senha } = req.body;

    const [usuarios] = await pool.query(
      `SELECT senha FROM usuarios WHERE id = ?`,
      [usuarioId],
    );

    const usuario = usuarios[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (usuarios.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    if (!senhaCorreta) {
      return res.status(401).json({ message: "Senha Incorreta" });
    }
    await pool.query(
      `
    DELETE FROM mensagens WHERE usuario_id = ?
    `,
      [usuarioId],
    );

    await pool.query(
      `
    DELETE FROM solicitacoes WHERE cliente_id = ? 
    `,
      [usuarioId],
    );

    await pool.query(
      `
    DELETE FROM solicitacoes WHERE prestador_id =
    (SELECT id FROM prestadores WHERE usuario_id = ?)
    `,
      [usuarioId],
    );

    await pool.query(`DELETE FROM prestadores WHERE usuario_id = ?`, [
      usuarioId,
    ]);

    await pool.query(`DELETE FROM usuarios WHERE id = ?`, [usuarioId]);

    return res.status(200).json({ message: "Conta deletada com Sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao realizar exclusão da conta" });
    console.error(`ERRO AO REALIZAR EXCLUSÃO DA CONTA:`, error);
  }
}
