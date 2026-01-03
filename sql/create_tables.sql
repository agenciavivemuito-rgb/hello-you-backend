BEGIN;

-- Create roles table (e.g., admin, customer)
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role_id INT REFERENCES roles(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    customer_must_approve BOOLEAN DEFAULT FALSE,
    comment TEXT,
    comment_date TIMESTAMP WITH TIME ZONE,
    observation TEXT,
    observation_date TIMESTAMP WITH TIME ZONE,
    user_id INT REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project contents table (e.g., images, videos)
CREATE TABLE IF NOT EXISTS projects_content (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_url TEXT NOT NULL,
    project_id INT REFERENCES projects(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create social media projects table
CREATE TABLE IF NOT EXISTS social_media_projects (
    id SERIAL PRIMARY KEY,
    subtitle TEXT NOT NULL,
    post_date TIMESTAMP WITH TIME ZONE,
    project_id INT REFERENCES projects(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create paid media projects table
CREATE TABLE IF NOT EXISTS paid_media_projects (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(100) NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    total_leads INT DEFAULT 0 NOT NULL,
    total_conversion INT DEFAULT 0 NOT NULL,
    cpc DECIMAL(10, 2),
    cpm DECIMAL(10, 2),
    cpa DECIMAL(10, 2),
    project_id INT REFERENCES projects(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create websites and landing pages projects table
CREATE TABLE IF NOT EXISTS websites_landing_pages_projects (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    hosting_provider VARCHAR(100),
    launch_date TIMESTAMP WITH TIME ZONE,
    updated_date TIMESTAMP WITH TIME ZONE,
    performance_metrics INT DEFAULT 0 NOT NULL,
    project_id INT REFERENCES projects(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create influencers projects table
CREATE TABLE IF NOT EXISTS influencers_projects (
    id SERIAL PRIMARY KEY,
    profile_picture_url TEXT,
    instagram_handle VARCHAR(100),
    tiktok_handle VARCHAR(100),
    instagram_post_count INT DEFAULT 0 NOT NULL,
    instagram_story_count INT DEFAULT 0 NOT NULL,
    tiktok_post_count INT DEFAULT 0 NOT NULL,
    phone_number VARCHAR(20),
    project_id INT REFERENCES projects(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_url TEXT NOT NULL,
    user_id INT REFERENCES users(id),
    project_id INT REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMIT;