import { storage } from './storage';
import { encryptCPF } from './encryption';

async function migrateCPFs() {
  console.log('Iniciando migração de CPFs...');
  
  const users = await storage.getAllUsers();
  let migrated = 0;
  
  for (const user of users) {
    if (user.cpf && !user.cpf.includes(':')) {
      const encryptedCPF = encryptCPF(user.cpf);
      await storage.updateUser(user.id, { cpf: encryptedCPF });
      console.log(`✓ CPF do usuário ${user.id} criptografado`);
      migrated++;
    }
  }
  
  console.log(`\n✓ Migração concluída! ${migrated} CPFs criptografados.`);
  process.exit(0);
}

migrateCPFs().catch(console.error);
