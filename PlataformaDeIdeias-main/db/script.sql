-- Create table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(254) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(254) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table: category
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(254) NOT NULL UNIQUE
);

-- Create table: idea
CREATE TABLE IF NOT EXISTS idea (
    id SERIAL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(254) NOT NULL,
    category_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_idea_user
      FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE,
    CONSTRAINT fk_idea_category
      FOREIGN KEY (category_id)
          REFERENCES category (id)
          ON DELETE RESTRICT
);

-- Create table: vote
CREATE TABLE IF NOT EXISTS vote (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    idea_id INTEGER NOT NULL,
    vote_value SMALLINT NOT NULL CHECK (vote_value IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vote_user
      FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE,
    CONSTRAINT fk_vote_idea
      FOREIGN KEY (idea_id)
          REFERENCES idea (id)
          ON DELETE CASCADE,
    CONSTRAINT uniq_user_idea_vote UNIQUE (user_id, idea_id)
);

-- Inserir dados de exemplo
INSERT INTO users (name, email, password) VALUES 
('João Silva', 'joao@email.com', '$2b$10$example') 
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password) VALUES 
('Maria Santos', 'maria@email.com', '$2b$10$example2') 
ON CONFLICT (email) DO NOTHING;

INSERT INTO category (name) VALUES 
('Tecnologia') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (name) VALUES 
('Educação') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (name) VALUES 
('Meio Ambiente') 
ON CONFLICT (name) DO NOTHING;

INSERT INTO category (name) VALUES 
('Saúde') 
ON CONFLICT (name) DO NOTHING;
