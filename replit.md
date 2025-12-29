# RoomBooker Corporate

Sistema de reserva de salas de reunião corporativo.

## Visão Geral

Aplicação full-stack para gerenciamento de reservas de salas de reunião em ambiente corporativo. Permite que colaboradores reservem salas e que administradores gerenciem usuários, salas e recursos.

## Arquitetura

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS (via CDN)
- **Componentes**: Componentes customizados com class-variance-authority

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express 5
- **ORM**: Drizzle ORM
- **Banco de Dados**: PostgreSQL (Neon)

## Estrutura de Arquivos

```
├── App.tsx                 # Componente principal da aplicação
├── components/             # Componentes React
│   ├── ui/                 # Componentes base (Button, Badge)
│   ├── LoginView.tsx       # Tela de login
│   ├── UsersManagementView.tsx
│   ├── RoomsManagementView.tsx
│   ├── ResourcesManagementView.tsx
│   └── ...
├── lib/
│   ├── api.ts              # Cliente API para comunicação com backend
│   └── utils.ts            # Funções utilitárias
├── server/
│   ├── index.ts            # Ponto de entrada do servidor Express
│   ├── routes.ts           # Rotas da API REST
│   ├── storage.ts          # Camada de acesso a dados
│   ├── db.ts               # Conexão com banco de dados
│   ├── seed.ts             # Dados iniciais
│   └── middleware.ts       # Middleware de autenticação
├── shared/
│   └── schema.ts           # Schema do banco (Drizzle)
├── types.ts                # Tipos TypeScript compartilhados
└── constants.ts            # Constantes da aplicação
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário

### Usuários
- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Excluir usuário

### Salas
- `GET /api/rooms` - Listar todas as salas
- `GET /api/rooms/:id` - Buscar sala por ID
- `POST /api/rooms` - Criar nova sala
- `PUT /api/rooms/:id` - Atualizar sala
- `DELETE /api/rooms/:id` - Excluir sala

### Recursos
- `GET /api/resources` - Listar todos os recursos
- `GET /api/resources/:id` - Buscar recurso por ID
- `POST /api/resources` - Criar novo recurso
- `PUT /api/resources/:id` - Atualizar recurso
- `DELETE /api/resources/:id` - Excluir recurso

### Reservas
- `GET /api/reservations` - Listar todas as reservas
- `GET /api/reservations/user/:userId` - Reservas de um usuário
- `POST /api/reservations` - Criar nova reserva (com validação de conflitos)
- `PUT /api/reservations/:id` - Atualizar reserva
- `DELETE /api/reservations/:id` - Excluir reserva

## Credenciais de Teste

- **Admin**: admin@empresa.com / admin123
- **Colaborador**: colab@empresa.com / colab123

## Scripts

- `npm run dev` - Iniciar servidor de desenvolvimento (backend + frontend)
- `npm run build` - Build de produção
- `npm run db:push` - Sincronizar schema do banco

## Mudanças Recentes

### 2025-12-29
- Implementação completa do backend com Express e PostgreSQL
- Migração de dados fictícios para banco de dados real
- Adição de validação de conflitos de reservas
- Implementação de headers de autenticação no frontend
