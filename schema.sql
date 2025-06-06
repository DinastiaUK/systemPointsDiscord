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
