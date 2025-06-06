-- Tabela de membros
CREATE TABLE membros (
    id SERIAL PRIMARY KEY,
    discord_id VARCHAR(64) UNIQUE NOT NULL,
    nome VARCHAR(100),
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_pontos INT DEFAULT 0
);
-- Tabela de regras de pontuacao para cada tipo de atividade
CREATE TABLE regras_pontos (
    id SERIAL PRIMARY KEY,
    atividade VARCHAR(100) NOT NULL,
    pontos INT NOT NULL,
    descricao TEXT
);

-- Tabela de atividades realizadas pelos membros
CREATE TABLE atividades (
    id SERIAL PRIMARY KEY,
    membro_id INT NOT NULL REFERENCES membros(id),
    regra_id INT NOT NULL REFERENCES regras_pontos(id),
    data_atividade TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pontos_ganhos INT NOT NULL
);

-- Valores predefinidos para cada tipo de atividade
INSERT INTO regras_pontos (atividade, pontos) VALUES
    ('INDICACAO', 50),
    ('REDE_SOCIAL', 10),
    ('PESQUISA', 20),
    ('MEMBRO_MES', 150),
    ('Starter10k', 50),
    ('DinastIA Black', 3000),
    ('Reinado Ofir', 150),
    ('Reinado Netsar', 150),
    ('Reinado Ofir Plus', 1650),
    ('Reinado Netsar Plus', 1650),
    ('Imersão Dinasty: Construa Agentes que Vendem Sozinhos', 50);
