-- Database Schema: Role-Based Approval & Workflow Management System

-- Drop tables if they exist (for easy teardown/rebuild)
DROP TABLE IF EXISTS request_history CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('User', 'Manager', 'Admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requests Table
CREATE TABLE requests (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Rejected', 'Needs Clarification', 'Closed', 'Reopened')),
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Request History (Audit Log) Table
CREATE TABLE request_history (
    id UUID PRIMARY KEY,
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    comments TEXT,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_history_request_id ON request_history(request_id);
