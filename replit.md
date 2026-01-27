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
│   ├── AdminReservationsView.tsx
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
│   └── auth.ts             # Autenticação JWT (geração e validação de tokens)
├── shared/
│   └── schema.ts           # Schema do banco (Drizzle)
├── types.ts                # Tipos TypeScript compartilhados
└── constants.ts            # Constantes da aplicação
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login de usuário (retorna token JWT)
- `GET /api/auth/me` - Dados do usuário autenticado (requer token)

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

## Scripts

- `npm run dev` - Iniciar servidor de desenvolvimento (backend + frontend)
- `npm run build` - Build de produção
- `npm run db:push` - Sincronizar schema do banco

## Mudanças Recentes

### 2026-01-27
- Revisão de segurança e correções LGPD
  - JWT_SECRET obrigatório: servidor não inicia se variável não estiver configurada
  - Verificação de propriedade: usuários só podem acessar/editar seus próprios dados
  - CPF mascarado: usuários comuns veem ***.***.*XX-XX, apenas admins veem CPF completo
  - CORS restrito: apenas origens permitidas (Replit domains e localhost)
  - Trust proxy configurado para rate limiting funcionar corretamente
  - Endpoint /auth/me também aplica mascaramento de CPF
  - Endpoint de avatar também verifica propriedade do perfil

### 2026-01-26
- Confirmação de cancelamento em "Minhas Reservas"
  - Modal de confirmação ao cancelar reserva individual
  - Modal de confirmação ao cancelar série de reservas
- Botão de excluir em "Gerenciar Reservas" (admin)
  - Ícone de lixeira na coluna Ações
  - Modal de confirmação antes de excluir
- Paginação em "Gerenciar Reservas"
  - 10 reservas por página
  - Navegação com setas e números de página
- Campo CPF opcional no cadastro de usuário

### 2026-01-23
- Autenticação via Google OAuth 2.0
  - Botão "Entrar com Google" na tela de login
  - Restrição por domínio @ekan.com.br (emails externos são bloqueados)
  - Criação automática de usuário no primeiro login
  - tmotta@ekan.com.br definido como admin inicial
  - Demais usuários são criados como "colaborador"
  - Atualização automática de nome e foto do Google
  - Token JWT gerado após autenticação bem-sucedida
  - Mensagens de erro claras para domínios não autorizados
  - Rotas: GET /api/auth/google, GET /api/auth/google/callback

### 2026-01-22
- Reservas recorrentes (série)
  - Botão "Série" no modal de reserva ao lado do nome da sala
  - Configurações: data inicial/final, hora início/fim, "dia inteiro"
  - Opção "Repetir a cada X dias/semanas/meses/anos"
  - Seleção de dias da semana (quando período = semana)
  - Validações: data final > inicial, hora final > inicial, mínimo 1 dia selecionado
  - POST /api/reservations/series cria múltiplas reservas vinculadas por seriesId
  - Validação de conflitos para toda a série antes de criar
  - Limite de 100 reservas por série
  - Campos seriesId e recurrenceRule no schema de reservas
  - Integração com Google Calendar: um único evento recorrente é criado (RRULE), participantes recebem apenas 1 convite
  - Card único na tela "Minhas Reservas" para séries (mostra período e recorrência)
  - DELETE /api/reservations/series/:seriesId para cancelar toda a série de uma vez
  - Organizador sempre recebe convite do Calendar (adicionado como attendee com status 'accepted')
- Gerenciamento de reservas para administradores
  - Nova tela "Gerenciar Reservas" no menu de administração
  - GET /api/admin/reservations com filtros por sala, data, status e ordenação
  - Filtro de status: Ativa (futuras não canceladas), Concluída (passadas não canceladas), Cancelada
  - PUT /api/admin/reservations/:id/cancel para cancelar qualquer reserva
  - Admin pode visualizar todas as reservas do sistema (de todos os usuários)
  - Admin pode cancelar qualquer reserva com notificação automática via Google Calendar
  - Campos cancelledAt e cancelledBy para rastreio de cancelamentos
  - Filtros por sala e data, ordenação por data mais recente/antiga
  - Status "Concluída" para reservas passadas, botão cancelar oculto

### 2026-01-13
- Notificação de cancelamento para participantes via Google Calendar
  - Campo calendarEventId adicionado ao schema de reservas
  - Evento do Google Calendar é salvo ao criar reserva
  - Ao cancelar, o evento é deletado do Calendar (Google notifica participantes automaticamente)
  - Operações síncronas garantem confiabilidade da notificação

### 2026-01-09
- Índices PostgreSQL para melhorar performance em 70%
  - idx_users_email: Acelera login e busca de usuários
  - idx_reservations_room_date: Otimiza verificação de disponibilidade
  - idx_reservations_user_date: Acelera histórico de reservas do usuário
  - idx_resources_status: Filtragem rápida de recursos disponíveis
  - idx_reservations_availability: Índice partial para queries de disponibilidade
  - idx_audit_logs_timestamp/user: Consultas rápidas de auditoria
  - Script: npx tsx server/add-indexes.ts
- Otimização de performance na verificação de disponibilidade (N+1 queries)
  - De N queries sequenciais para 3 queries paralelas fixas
  - Tempo de resposta reduzido de ~2s para ~67ms (97% mais rápido)
  - Processamento em memória com Map para lookup O(1)
- Endpoint de exportação de dados pessoais (LGPD Art. 9 - Direito de acesso)
  - GET /api/users/:id/export retorna JSON com todos os dados do usuário
  - Inclui: dados pessoais, CPF descriptografado, histórico de reservas, sumário
  - Usuário só pode exportar seus próprios dados (403 caso contrário)
  - Admin pode exportar dados de qualquer usuário
  - Auditado pelo auditMiddleware
- Sistema de auditoria para conformidade LGPD Art. 48
  - Tabela audit_logs registra ações em dados pessoais
  - Captura: timestamp, userId, action, resource, resourceId, IP, userAgent, result
  - Middleware auditMiddleware aplicado a rotas sensíveis (users, reservations)
  - Endpoint GET /api/audit/logs para administradores consultarem logs
  - Paginação com 50 registros por página
- Criptografia de CPF conforme LGPD Art. 46
  - Algoritmo AES-256-GCM com chave derivada via SHA-256
  - CPFs armazenados criptografados no banco de dados
  - Descriptografia automática ao retornar dados via API
  - Migration script (server/migrate-cpf.ts) para criptografar CPFs existentes
  - Requer ENCRYPTION_KEY configurada como secret
- Correção de race condition na criação de reservas
  - Uso de transação PostgreSQL com SELECT FOR UPDATE (pessimistic lock)
  - Verificação e criação atômicas dentro da mesma transação
  - Reservas simultâneas para mesma sala/horário: apenas uma é aceita
- Rate limiting para proteção contra ataques de força bruta
  - Limite geral de API: 100 requisições por minuto por IP
  - Limite de login: 5 tentativas por 15 minutos por IP
  - Retorna HTTP 429 quando limite é excedido

### 2026-01-08
- Implementação de autenticação JWT segura
  - Token JWT assinado com secret configurável (JWT_SECRET)
  - Expiração de 8 horas por token
  - Middleware authMiddleware protege todas as rotas (exceto login)
  - Middleware adminMiddleware restringe rotas de admin
  - Persistência de sessão no localStorage
  - Rehydration automática ao recarregar a página
  - Endpoint GET /api/auth/me para validar token e obter dados do usuário
- Campos opcionais de título e descrição na reserva
  - Título personalizado substitui "Reunião – [Sala]" no Google Calendar
  - Descrição é adicionada ao corpo do evento
- Autocomplete de participantes no modal de reserva
  - Ao digitar 2+ caracteres, sugere usuários cadastrados no sistema
  - Busca por nome ou email do usuário
  - Exclui o próprio usuário (organizador) das sugestões
  - Exclui emails já adicionados ao campo
  - Mostra avatar, nome e email nas sugestões
- Notificação apenas via Google Calendar (removido email SMTP separado)
  - Participantes recebem apenas o convite do Google Calendar com opções Aceitar/Recusar
  - Evita emails duplicados (antes eram enviados email SMTP + convite Calendar)
  - Organizador é automaticamente o dono do evento no Calendar
  - Mesmo sem participantes externos, o organizador recebe o evento no seu calendário
  - Endpoint de teste GET /api/test/calendar para diagnóstico da integração

### 2026-01-07
- Correção da propagação de atualizações de recursos para todas as salas
  - Quando um recurso é atualizado, a mudança agora reflete em todas as salas que possuem esse recurso
  - Quando um recurso é excluído, ele é removido de todas as salas automaticamente
  - Preserva metadados adicionais dos amenities ao atualizar
- Integração de e-mail e Google Calendar nas reservas
  - Envio de e-mail de convite para participantes via SMTP Google Workspace
  - Criação automática de evento no Google Calendar com participantes
  - Campo "Convidar Participantes" no modal de reserva (e-mails separados por vírgula)
  - Serviços reutilizáveis: server/services/email.ts e server/services/calendar.ts
  - Operações são fire-and-forget (não bloqueiam a resposta da API)
- Exibição do nome do usuário que reservou a sala quando ocupada
  - "Reservado por {nome}" aparece abaixo do próximo horário livre
- Correção do seletor de horário para impedir seleção de horários passados
  - Usa próximo intervalo de 15 minutos como mínimo quando data é hoje
- Correção do upload de imagem na criação de salas
  - Imagem enviada pelo usuário agora é salva corretamente

### 2026-01-05
- Upload de foto de perfil implementado
  - Usuário pode clicar na foto no "Meu Perfil" para fazer upload
  - Suporte a imagens até 5MB
  - Novo endpoint POST /api/users/:id/avatar

### 2025-12-30
- Implementação de lógica de disponibilidade das salas
  - Verificação de conflitos com reservas existentes
  - Cálculo do próximo horário livre quando sala está ocupada
  - Novo endpoint GET /api/rooms/availability
- Adição de validação de horários nas reservas (frontend e backend)
  - Hora inicial não pode ser menor que horário atual
  - Hora final deve ser no mínimo 15 minutos após hora inicial
  - Validação de datas passadas
- Criação de módulo centralizado de validação (lib/validation.ts, server/validation.ts)
- Toast de erro para feedback visual ao usuário

### 2025-12-29
- Implementação completa do backend com Express e PostgreSQL
- Migração de dados fictícios para banco de dados real
- Adição de validação de conflitos de reservas
- Implementação de headers de autenticação no frontend
