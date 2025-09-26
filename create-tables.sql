-- Создание таблиц для BuildTalk в Supabase
-- Это SQL скрипт для ручного создания таблиц

-- Включаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица sessions (обязательная для Replit Auth)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Таблица users (профили пользователей)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    password VARCHAR,
    karma INTEGER NOT NULL DEFAULT 0,
    role VARCHAR(50) DEFAULT 'diy',
    bio TEXT,
    is_profile_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Таблица threads (посты/темы)
CREATE TABLE IF NOT EXISTS threads (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    author_id VARCHAR NOT NULL REFERENCES users(id),
    upvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица comments (комментарии)
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    thread_id VARCHAR NOT NULL REFERENCES threads(id),
    author_id VARCHAR NOT NULL REFERENCES users(id),
    upvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица votes (лайки/дизлайки)
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL, -- 'thread' или 'comment'
    target_id VARCHAR NOT NULL, -- ID поста или комментария
    vote_type VARCHAR(10) NOT NULL, -- 'up' или 'down'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Таблица achievements (достижения)
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    requirement INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Таблица user_achievements (достижения пользователей)
CREATE TABLE IF NOT EXISTS user_achievements (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    achievement_id VARCHAR NOT NULL REFERENCES achievements(id),
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Таблица bookmarks (закладки)
CREATE TABLE IF NOT EXISTS bookmarks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    target_type VARCHAR(20) NOT NULL, -- 'thread' или 'comment'
    target_id VARCHAR NOT NULL, -- ID поста или комментария
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Заполнение базовых достижений
INSERT INTO achievements (name, description, icon, category, requirement) VALUES
('Первые шаги', 'Зарегистрироваться на форуме', '🎯', 'karma', 0),
('Что-то понимающий', 'Набрать 10+ кармы', '🪚', 'karma', 10),
('Можно доверять', 'Набрать 30+ кармы', '🔨', 'karma', 30),
('Знающий мастер', 'Набрать 100+ кармы', '⚙️', 'karma', 100),
('Авторитет', 'Набрать 300+ кармы', '🧰', 'karma', 300),
('Профессионал', 'Набрать 500+ кармы', '🛠️', 'karma', 500),
('Эксперт', 'Набрать 700+ кармы', '🏗️', 'karma', 700),
('Гуру ремонта', 'Набрать 1000+ кармы', '🏆', 'karma', 1000)
ON CONFLICT DO NOTHING;

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_threads_author_id ON threads(author_id);
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category);
CREATE INDEX IF NOT EXISTS idx_threads_created_at ON threads(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_thread_id ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_target ON votes(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_target ON bookmarks(user_id, target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);