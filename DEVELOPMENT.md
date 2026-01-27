# Guia de Desenvolvimento - AgendaFácil

## Pré-requisitos

- Node.js 20 ou superior
- npm ou yarn
- PostgreSQL (ou acesso ao Neon)
- Conta Google Cloud (para OAuth e Calendar)

## Configuração do Ambiente

### 1. Clonar o Repositório

```bash
git clone <repository-url>
cd agendafacil
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto ou configure as variáveis no ambiente Replit:

```env
# Banco de Dados (obrigatório)
DATABASE_URL=postgresql://user:password@host:5432/database

# Autenticação (obrigatório)
JWT_SECRET=sua-chave-secreta-muito-segura-minimo-32-caracteres

# Criptografia de CPF (obrigatório)
ENCRYPTION_KEY=chave-de-32-bytes-para-aes-256

# Google OAuth (obrigatório para login com Google)
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_REFRESH_TOKEN=seu-refresh-token

# SMTP para emails (opcional, mas recomendado)
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
```

### 4. Configurar o Banco de Dados

```bash
# Sincronizar schema com o banco
npm run db:push
```

### 5. Executar em Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5000`.

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Compila o projeto para produção |
| `npm run start` | Inicia o servidor em modo produção |
| `npm run db:push` | Sincroniza schema com o banco |
| `npm run db:studio` | Abre o Drizzle Studio |

## Estrutura do Projeto

```
/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (Button, Input, etc.)
│   └── *.tsx           # Componentes de página/feature
├── lib/                # Utilitários frontend
│   ├── api.ts         # Cliente HTTP para a API
│   └── utils.ts       # Funções auxiliares
├── server/             # Código do backend
│   ├── index.ts       # Entry point
│   ├── routes.ts      # Rotas da API
│   ├── storage.ts     # Acesso a dados
│   ├── auth.ts        # Autenticação
│   └── services/      # Serviços externos
├── shared/             # Código compartilhado
│   └── schema.ts      # Schema do banco (Drizzle)
└── App.tsx             # Componente React principal
```

## Padrões de Código

### TypeScript

- Usar tipos explícitos sempre que possível
- Evitar `any` - usar `unknown` quando necessário
- Interfaces para objetos, types para unions/intersections

```typescript
// Bom
interface User {
  id: number;
  name: string;
  email: string;
}

// Evitar
const user: any = { ... };
```

### React

- Componentes funcionais com hooks
- Props tipadas com interface
- Nomes de componentes em PascalCase

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ label, onClick, variant = 'primary' }: ButtonProps) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### API Routes

- Usar verbos HTTP corretos (GET, POST, PUT, DELETE)
- Retornar códigos de status apropriados
- Tratar erros de forma consistente

```typescript
router.post("/resource", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Nome é obrigatório" });
    }
    
    const resource = await storage.createResource({ name });
    return res.status(201).json(resource);
  } catch (error) {
    console.error("Create resource error:", error);
    return res.status(500).json({ message: "Erro interno" });
  }
});
```

### Banco de Dados

- Usar Drizzle ORM para queries
- Transações para operações críticas
- Indexes para queries frequentes

```typescript
// Query simples
const users = await db.select().from(usersTable);

// Com transação
await db.transaction(async (tx) => {
  const reservation = await tx
    .insert(reservations)
    .values(data)
    .returning();
  
  await tx
    .insert(auditLogs)
    .values({ action: 'create', ...logData });
});
```

## Fluxo de Contribuição

### 1. Branches

- `main` - Código em produção
- `develop` - Desenvolvimento ativo
- `feature/*` - Novas funcionalidades
- `bugfix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes em produção

### 2. Commits

Usar mensagens descritivas em português ou inglês:

```
feat: Adiciona filtro de data nas reservas
fix: Corrige validação de conflito de horários
docs: Atualiza documentação da API
refactor: Reorganiza estrutura de componentes
```

### 3. Pull Requests

- Descrever as mudanças realizadas
- Incluir screenshots para mudanças de UI
- Garantir que não há erros de TypeScript
- Testar manualmente as funcionalidades

## Debugging

### Logs do Servidor

```typescript
console.log('[API] Request received:', req.method, req.path);
console.error('[API] Error:', error.message);
```

### Logs do Frontend

```typescript
console.log('[UI] User action:', action);
console.error('[UI] API error:', error);
```

### Drizzle Studio

Para visualizar e editar dados do banco:

```bash
npm run db:studio
```

## Testes

### Testes Manuais Recomendados

1. **Autenticação**
   - Login com email/senha
   - Login com Google
   - Logout
   - Reset de senha

2. **Reservas**
   - Criar reserva individual
   - Criar série recorrente
   - Cancelar reserva
   - Verificar conflitos

3. **Administração**
   - CRUD de usuários
   - CRUD de salas
   - CRUD de recursos
   - Visualizar logs de auditoria

## Troubleshooting

### Erro: "JWT_SECRET não configurado"

Certifique-se de que a variável `JWT_SECRET` está definida no ambiente.

### Erro: "Conexão com banco falhou"

Verifique a `DATABASE_URL` e se o banco está acessível.

### Erro: "Google OAuth falhou"

Verifique as credenciais do Google Cloud e o domínio permitido.

### Erro: "Email não enviado"

Verifique as configurações SMTP e se a senha de app está correta.

## Recursos Úteis

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
