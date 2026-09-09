-- Grant admin role to user 'cpag'
-- This script creates the user if they don't exist, then assigns the ADMINISTRATOR role
-- Password hash is for 'passord123' (same as other test users)

-- Create user if they don't exist
INSERT INTO app."user" (email, password_hash, full_name, is_active) 
VALUES ('cpag', '$2a$10$N9qo8uLOickgx2ZMRZoMye1J0JrJzX5a1Dz1lHAkE0YPJ1jTN7P4K', 'CPAG Admin', true)
ON CONFLICT (email) DO NOTHING;

-- Grant ADMINISTRATOR role
INSERT INTO app.user_role (user_id, role_id)
SELECT u.id, r.id 
FROM app."user" u, app.role r 
WHERE u.email = 'cpag' AND r.code = 'ADMINISTRATOR'
ON CONFLICT DO NOTHING;

-- Also grant ADMIN role if it exists (for compatibility)
INSERT INTO app.user_role (user_id, role_id)
SELECT u.id, r.id 
FROM app."user" u, app.role r 
WHERE u.email = 'cpag' AND r.code = 'ADMIN'
ON CONFLICT DO NOTHING;

