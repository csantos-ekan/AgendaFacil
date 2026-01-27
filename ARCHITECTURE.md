# Arquitetura do Sistema - AgendaFácil

## Visão Geral

O AgendaFácil é uma aplicação full-stack para gerenciamento de reservas de salas de reunião em ambiente corporativo. A arquitetura segue o padrão cliente-servidor com clara separação de responsabilidades.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React + TypeScript                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │    │
│  │  │  Views   │  │Components│  │   Hooks  │  │   API    │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVIDOR                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  Express.js + TypeScript                  │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │    │
│  │  │  Routes  │  │Middleware│  │ Services │  │ Storage  │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL (Drizzle ORM)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BANCO DE DADOS                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   PostgreSQL (Neon)                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │    │
│  │  │  Users   │  │  Rooms   │  │Reservations│ │Resources │ │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Integrações Externas
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Google OAuth │  │Google Calendar│  │   SMTP (Email)       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

### Frontend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 19 | Framework de UI |
| TypeScript | 5.x | Tipagem estática |
| Vite | 6.x | Build tool e dev server |
| TailwindCSS | CDN | Estilização |
| class-variance-authority | 0.7.x | Variantes de componentes |
| Lucide React | 0.561.x | Ícones |

### Backend

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 20 | Runtime |
| Express | 5 | Framework web |
| TypeScript | 5.x | Tipagem estática |
| Drizzle ORM | - | ORM para banco de dados |
| bcrypt | - | Hash de senhas |
| jsonwebtoken | - | Autenticação JWT |
| googleapis | - | Integração Google |
| nodemailer | - | Envio de emails |

### Banco de Dados

| Tecnologia | Propósito |
|------------|-----------|
| PostgreSQL (Neon) | Banco de dados principal |
| Drizzle Kit | Gerenciamento de schema |

## Estrutura de Diretórios

```
/
├── components/           # Componentes React reutilizáveis
│   ├── ui/              # Componentes de UI base (Button, Input, etc.)
│   ├── LoginView.tsx    # Tela de login
│   ├── Sidebar.tsx      # Menu lateral
│   ├── Header.tsx       # Cabeçalho
│   └── ...
├── lib/                 # Utilitários do frontend
│   ├── api.ts          # Cliente da API
│   └── utils.ts        # Funções auxiliares
├── server/              # Código do backend
│   ├── index.ts        # Entry point do servidor
│   ├── routes.ts       # Definição de rotas da API
│   ├── storage.ts      # Camada de acesso a dados
│   ├── auth.ts         # Lógica de autenticação
│   ├── middleware/     # Middlewares Express
│   └── services/       # Serviços externos
│       ├── calendar.ts # Integração Google Calendar
│       ├── email.ts    # Serviço de email
│       └── google.ts   # OAuth Google
├── shared/              # Código compartilhado
│   └── schema.ts       # Definição do schema do banco
├── App.tsx              # Componente principal React
├── index.html           # HTML base
└── vite.config.ts       # Configuração do Vite
```

## Fluxos Principais

### 1. Autenticação

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Cliente│     │  API   │     │  Auth  │     │   DB   │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
    │              │              │              │
    │  POST /login │              │              │
    │─────────────>│              │              │
    │              │ validateUser │              │
    │              │─────────────>│              │
    │              │              │ getUserByEmail│
    │              │              │─────────────>│
    │              │              │    user      │
    │              │              │<─────────────│
    │              │  comparePassword            │
    │              │<─────────────│              │
    │              │ generateToken│              │
    │              │─────────────>│              │
    │              │    token     │              │
    │              │<─────────────│              │
    │  { token }   │              │              │
    │<─────────────│              │              │
```

### 2. Criação de Reserva

```
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ Cliente│   │  API   │   │ Storage│   │   DB   │   │Calendar│
└───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘
    │            │            │            │            │
    │POST /reservations       │            │            │
    │───────────>│            │            │            │
    │            │ checkAvailability       │            │
    │            │───────────>│            │            │
    │            │            │  SELECT    │            │
    │            │            │───────────>│            │
    │            │            │  result    │            │
    │            │            │<───────────│            │
    │            │ available  │            │            │
    │            │<───────────│            │            │
    │            │ createReservation       │            │
    │            │───────────>│            │            │
    │            │            │  INSERT    │            │
    │            │            │───────────>│            │
    │            │            │  created   │            │
    │            │            │<───────────│            │
    │            │ createCalendarEvent     │            │
    │            │─────────────────────────────────────>│
    │            │            │            │  eventId   │
    │            │<─────────────────────────────────────│
    │ reservation│            │            │            │
    │<───────────│            │            │            │
```

### 3. Cancelamento de Reserva

```
┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ Cliente│   │  API   │   │   DB   │   │Calendar│
└───┬────┘   └───┬────┘   └───┬────┘   └───┬────┘
    │            │            │            │
    │DELETE /reservations/:id │            │
    │───────────>│            │            │
    │            │ getReservation          │
    │            │───────────>│            │
    │            │ reservation│            │
    │            │<───────────│            │
    │            │ deleteCalendarEvent     │
    │            │────────────────────────>│
    │            │           ok            │
    │            │<────────────────────────│
    │            │ deleteReservation       │
    │            │───────────>│            │
    │            │    ok      │            │
    │            │<───────────│            │
    │   204      │            │            │
    │<───────────│            │            │
```

## Decisões Arquiteturais

### 1. Monolito Modular

**Decisão:** Manter frontend e backend no mesmo repositório.

**Justificativa:**
- Simplifica o desenvolvimento e deploy
- Compartilhamento de tipos entre front e back
- Adequado para o tamanho atual do projeto

### 2. JWT para Autenticação

**Decisão:** Usar tokens JWT stateless.

**Justificativa:**
- Não requer armazenamento de sessão no servidor
- Facilita escalabilidade horizontal
- Padrão bem estabelecido

### 3. Drizzle ORM

**Decisão:** Usar Drizzle em vez de Prisma ou TypeORM.

**Justificativa:**
- Type-safety completo
- Melhor performance
- Controle fino sobre queries SQL

### 4. Integração com Google Calendar

**Decisão:** Criar eventos no calendário para cada reserva.

**Justificativa:**
- Notificações automáticas para participantes
- Visibilidade em ferramentas que os usuários já usam
- Sincronização bidirecional futura

### 5. Criptografia de CPF

**Decisão:** Criptografar CPF com AES-256-GCM.

**Justificativa:**
- Conformidade com LGPD
- Proteção contra vazamento de dados
- Mascaramento para usuários não-admin

### 6. Transações para Reservas

**Decisão:** Usar `SELECT FOR UPDATE` em reservas.

**Justificativa:**
- Previne condições de corrida
- Garante integridade de dados
- Evita reservas duplicadas

## Segurança

### Camadas de Proteção

1. **Autenticação:** JWT com expiração
2. **Autorização:** Middleware de verificação de role
3. **Rate Limiting:** Proteção contra brute force
4. **Criptografia:** Dados sensíveis criptografados
5. **CORS:** Origens restritas
6. **Auditoria:** Logs de ações sensíveis

### Fluxo de Autorização

```
Request → CORS → Rate Limit → Auth Middleware → Admin Middleware → Route Handler
```

## Escalabilidade

### Atual

- Servidor único
- Banco PostgreSQL gerenciado (Neon)
- Cache em memória (quando aplicável)

### Futuro (se necessário)

- Múltiplas instâncias do servidor
- Load balancer
- Cache distribuído (Redis)
- CDN para assets estáticos

## Monitoramento

### Logs

- Logs estruturados no console
- Logs de auditoria no banco de dados
- Erros detalhados em desenvolvimento

### Métricas Recomendadas

- Tempo de resposta das APIs
- Taxa de erros
- Uso de recursos (CPU, memória)
- Número de reservas por dia
