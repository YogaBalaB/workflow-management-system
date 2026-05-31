CREATE TABLE requests (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Approved', 'Rejected', 'Needs Clarification', 'Closed', 'Reopened')),
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);
