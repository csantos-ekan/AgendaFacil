-- Índice para login (busca por email é muito frequente)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índice para busca de reservas por sala e data (usado em disponibilidade)
CREATE INDEX IF NOT EXISTS idx_reservations_room_date 
ON reservations(room_id, date, status);

-- Índice para busca de reservas por usuário (histórico do usuário)
CREATE INDEX IF NOT EXISTS idx_reservations_user_date 
ON reservations(user_id, date);

-- Índice para recursos por status (filtragem de disponíveis)
CREATE INDEX IF NOT EXISTS idx_resources_status 
ON resources(status);

-- Índice composto para verificação de disponibilidade (query mais crítica)
CREATE INDEX IF NOT EXISTS idx_reservations_availability 
ON reservations(room_id, date, start_time, end_time) 
WHERE status != 'cancelled';

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
ON audit_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user 
ON audit_logs(user_id, timestamp DESC);

-- Comentários explicativos
COMMENT ON INDEX idx_users_email IS 'Acelera login e busca de usuários por email';
COMMENT ON INDEX idx_reservations_room_date IS 'Acelera verificação de disponibilidade de salas';
COMMENT ON INDEX idx_reservations_availability IS 'Índice partial para queries de disponibilidade';
