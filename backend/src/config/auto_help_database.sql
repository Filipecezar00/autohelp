CREATE DATABASE IF NOT EXISTS autohelp; 
USE autohelp; 

CREATE TABLE usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL, 
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('cliente','prestador') NOT NULL DEFAULT 'cliente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE prestadores(
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_servico ENUM('mecanico','borracheiro','guincho') NOT NULL,
    descricao VARCHAR(255),
    telefone VARCHAR(20),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
); 

CREATE TABLE solicitacoes(
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    prestador_id INT NOT NULL,
    status ENUM('pendente','aceita','concluida','cancelada') DEFAULT 'pendente',
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    FOREIGN KEY (prestador_id) REFERENCES prestadores(id)
);

USE autohelp;

INSERT INTO usuarios (nome,email,senha,tipo) VALUES 
('Carlos Mecânico','carlos@email.com','123456','prestador'),
('João Borracheiro','joao@email.com','123456','prestador'),
('Pedro Guincho','pedro@email.com','123456','prestador');

INSERT INTO prestadores (usuario_id,tipo_servico,descricao,telefone,latitude,longitude) VALUES
(1,'mecanico','Especialista em carros populares','(31) 9999-0001',-19.9167,-43.9345),
(2,'Borracheiro','Troca e conserto de pneus','(31) 9999-0002',-19.9245,-43.9412),
(3,'guincho','Guincho 24h para toda BH','(31) 9999-0003',-19.9102,-43.9278);
