-- Seed Data: Role-Based Approval & Workflow Management System

-- Pre-hashed passwords for 'password123' using bcryptjs (rounds=10)
-- Hash: $2a$10$fkelEELp/9fhqcNwewuFpeSZ95RWAyVz03yajbyC76rJMeJdzv7Ha

-- Clean existing data first
DELETE FROM request_history;
DELETE FROM requests;
DELETE FROM users;

-- 1. Insert Users
INSERT INTO users (id, name, email, password, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice', 'user@test.com', '$2a$10$fkelEELp/9fhqcNwewuFpeSZ95RWAyVz03yajbyC76rJMeJdzv7Ha', 'User', CURRENT_TIMESTAMP - INTERVAL '10 day'),
('22222222-2222-2222-2222-222222222222', 'Bob', 'manager@test.com', '$2a$10$fkelEELp/9fhqcNwewuFpeSZ95RWAyVz03yajbyC76rJMeJdzv7Ha', 'Manager', CURRENT_TIMESTAMP - INTERVAL '10 day'),
('33333333-3333-3333-3333-333333333333', 'Charlie', 'admin@test.com', '$2a$10$fkelEELp/9fhqcNwewuFpeSZ95RWAyVz03yajbyC76rJMeJdzv7Ha', 'Admin', CURRENT_TIMESTAMP - INTERVAL '10 day'),
('44444444-4444-4444-4444-444444444444', 'Diana', 'diana@test.com', '$2a$10$fkelEELp/9fhqcNwewuFpeSZ95RWAyVz03yajbyC76rJMeJdzv7Ha', 'User', CURRENT_TIMESTAMP - INTERVAL '5 day');

-- 2. Insert Requests
INSERT INTO requests (id, title, description, category, priority, status, created_by, created_at) VALUES
-- Request 1: Approved & Closed (MacBook Pro Upgrade)
('a1111111-1111-1111-1111-111111111111', 'MacBook Pro 16" Upgrade', 'Need standard 16" MacBook Pro upgrade with 32GB RAM for local development and running containerized environments.', 'Hardware', 'High', 'Closed', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP - INTERVAL '8 day'),

-- Request 2: Needs Clarification (AWS Budget Increase)
('a2222222-2222-2222-2222-222222222222', 'AWS Staging Budget Increase', 'Requesting a $200/month budget increase for AWS staging environment to support automated load testing operations.', 'Cloud Services', 'Medium', 'Needs Clarification', '11111111-1111-1111-1111-111111111111', CURRENT_TIMESTAMP - INTERVAL '4 day'),

-- Request 3: Submitted / Pending Manager (JetBrains License)
('a3333333-3333-3333-3333-333333333333', 'JetBrains All Products Pack License', 'Requesting annual subscription renewal for JetBrains developer toolbox to enable advanced productivity features.', 'Software', 'Low', 'Submitted', '44444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP - INTERVAL '2 day'),

-- Request 4: Rejected (Gaming Chair Request)
('a4444444-4444-4444-4444-444444444444', 'Secretlab Ergonomic Gaming Chair', 'Need a high-end ergonomic chair to prevent lower back pain during long screen hours.', 'Furniture', 'Low', 'Rejected', '44444444-4444-4444-4444-444444444444', CURRENT_TIMESTAMP - INTERVAL '5 day');

-- 3. Insert Request History (Audit logs for each workflow transition)
INSERT INTO request_history (id, request_id, old_status, new_status, comments, updated_by, created_at) VALUES
-- Request 1 workflow: Submitted -> Approved -> Closed
('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Submitted', 'Approved', 'Approved. Development hardware budget is available.', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '7 day'),
('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Approved', 'Closed', 'MacBook delivered to developer. Closing request.', '33333333-3333-3333-3333-333333333333', CURRENT_TIMESTAMP - INTERVAL '6 day'),

-- Request 2 workflow: Submitted -> Needs Clarification
('b3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Submitted', 'Needs Clarification', 'Please attach a breakdown of the estimated service costs that warrant this budget increase.', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '3 day'),

-- Request 4 workflow: Submitted -> Rejected
('b4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'Submitted', 'Rejected', 'Request denied. Standard ergonomic office chairs are provided by HR. Specialized chairs require HR/Medical clearance.', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP - INTERVAL '4 day');
