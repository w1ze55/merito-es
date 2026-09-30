CREATE TABLE tipo_combustivel (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    preco_por_litro DECIMAL(10, 3) NOT NULL,
    CONSTRAINT pk_tipo_combustivel PRIMARY KEY (id),
    CONSTRAINT uk_tipo_combustivel_nome UNIQUE (nome)
);

CREATE TABLE bomba_combustivel (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo_combustivel_id BIGINT NOT NULL,
    CONSTRAINT pk_bomba_combustivel PRIMARY KEY (id),
    CONSTRAINT uk_bomba_combustivel_nome UNIQUE (nome),
    CONSTRAINT fk_bomba_combustivel_tipo FOREIGN KEY (tipo_combustivel_id) REFERENCES tipo_combustivel (id)
);

CREATE TABLE abastecimento (
    id BIGINT NOT NULL AUTO_INCREMENT,
    bomba_id BIGINT NOT NULL,
    data_abastecimento DATETIME(6) NOT NULL,
    litros DECIMAL(10, 3) NOT NULL,
    valor_total DECIMAL(12, 2) NOT NULL,
    CONSTRAINT pk_abastecimento PRIMARY KEY (id),
    CONSTRAINT fk_abastecimento_bomba FOREIGN KEY (bomba_id) REFERENCES bomba_combustivel (id)
);
