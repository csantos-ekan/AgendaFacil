import { db } from './db';
import { sql } from 'drizzle-orm';

async function addIndexes() {
  console.log('Criando índices no banco de dados...\n');
  
  try {
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    console.log('✓ Índice idx_users_email criado');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reservations_room_date ON reservations(room_id, date, status)`);
    console.log('✓ Índice idx_reservations_room_date criado');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reservations_user_date ON reservations(user_id, date)`);
    console.log('✓ Índice idx_reservations_user_date criado');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status)`);
    console.log('✓ Índice idx_resources_status criado');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_reservations_availability ON reservations(room_id, date, start_time, end_time) WHERE status != 'cancelled'`);
    console.log('✓ Índice idx_reservations_availability criado');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC)`);
    console.log('✓ Índice idx_audit_logs_timestamp criado');
    
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, timestamp DESC)`);
    console.log('✓ Índice idx_audit_logs_user criado');
    
    console.log('\n✓ Todos os índices foram criados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar índices:', error);
    process.exit(1);
  }
}

addIndexes();
