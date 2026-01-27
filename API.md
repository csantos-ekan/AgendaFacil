# Documentação da API - AgendaFácil

## Visão Geral

A API do AgendaFácil é uma API RESTful que permite gerenciar reservas de salas de reunião, usuários, salas e recursos. Todas as rotas são prefixadas com `/api`.

## Autenticação

### JWT Token

A maioria dos endpoints requer autenticação via JWT (JSON Web Token). O token deve ser enviado no header `Authorization`:

```
Authorization: Bearer <token>
```

### Obtenção do Token

O token é obtido através do endpoint de login ou após autenticação via Google OAuth.

---

## Endpoints de Autenticação

### POST /api/auth/login

Autentica um usuário com email e senha.

**Request Body:**
```json
{
  "email": "usuario@empresa.com.br",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@empresa.com.br",
    "role": "colaborador",
    "status": "ativo"
  }
}
```

**Erros:**
- `400` - Email e senha são obrigatórios
- `401` - Credenciais inválidas

---

### GET /api/auth/me

Retorna informações do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "usuario@empresa.com.br",
    "role": "colaborador",
    "status": "ativo",
    "cpf": "***.***.***-00"
  }
}
```

---

### POST /api/auth/forgot-password

Inicia o processo de recuperação de senha.

**Request Body:**
```json
{
  "email": "usuario@empresa.com.br"
}
```

**Response (200):**
```json
{
  "message": "Se o e-mail estiver cadastrado, você receberá um link para redefinição."
}
```

---

### GET /api/auth/validate-reset-token/:token

Valida um token de redefinição de senha.

**Response (200):**
```json
{
  "valid": true
}
```

**Erros:**
- `400` - Token inválido ou expirado

---

### POST /api/auth/reset-password

Redefine a senha do usuário.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "novaSenha123"
}
```

**Response (200):**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

---

### GET /api/auth/google

Inicia o fluxo de autenticação OAuth com Google.

**Response:** Redireciona para a página de login do Google.

---

### GET /api/auth/google/callback

Callback do OAuth do Google. Processa a autenticação e redireciona o usuário.

---

## Endpoints de Usuários

### GET /api/users

Lista todos os usuários. **Requer permissão de administrador.**

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "email": "joao@empresa.com.br",
    "role": "admin",
    "status": "ativo",
    "cpf": "123.456.789-00"
  }
]
```

---

### GET /api/users/:id

Retorna um usuário específico. Usuários podem ver apenas seu próprio perfil, exceto administradores.

**Response (200):**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@empresa.com.br",
  "role": "colaborador",
  "status": "ativo"
}
```

---

### POST /api/users

Cria um novo usuário. **Requer permissão de administrador.**

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@empresa.com.br",
  "password": "senha123",
  "role": "colaborador",
  "status": "ativo",
  "cpf": "987.654.321-00"
}
```

**Response (201):**
```json
{
  "id": 2,
  "name": "Maria Santos",
  "email": "maria@empresa.com.br",
  "role": "colaborador",
  "status": "ativo"
}
```

---

### PUT /api/users/:id

Atualiza um usuário existente.

**Request Body:**
```json
{
  "name": "Maria Santos Silva",
  "status": "inativo"
}
```

**Response (200):**
```json
{
  "id": 2,
  "name": "Maria Santos Silva",
  "email": "maria@empresa.com.br",
  "role": "colaborador",
  "status": "inativo"
}
```

---

### DELETE /api/users/:id

Remove um usuário. **Requer permissão de administrador.**

**Response:** `204 No Content`

---

### POST /api/users/:id/avatar

Atualiza a foto de perfil do usuário.

**Request Body:**
```json
{
  "avatar": "data:image/png;base64,..."
}
```

---

### GET /api/users/:id/export

Exporta os dados do usuário (LGPD). Retorna todas as informações do usuário em formato JSON.

---

## Endpoints de Salas

### GET /api/rooms

Lista todas as salas disponíveis.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Sala de Reunião A",
    "capacity": 10,
    "floor": "1º Andar",
    "status": "disponivel",
    "resources": ["Projetor", "Videoconferência"]
  }
]
```

---

### GET /api/rooms/availability

Verifica disponibilidade de salas para um período.

**Query Parameters:**
- `date` - Data no formato YYYY-MM-DD
- `startTime` - Horário de início (HH:MM)
- `endTime` - Horário de término (HH:MM)
- `roomId` (opcional) - ID da sala específica

**Response (200):**
```json
{
  "available": true,
  "conflicts": []
}
```

---

### GET /api/rooms/:id

Retorna detalhes de uma sala específica.

---

### POST /api/rooms

Cria uma nova sala. **Requer permissão de administrador.**

**Request Body:**
```json
{
  "name": "Sala de Reunião B",
  "capacity": 6,
  "floor": "2º Andar",
  "resources": [1, 2, 3]
}
```

---

### PUT /api/rooms/:id

Atualiza uma sala existente. **Requer permissão de administrador.**

---

### DELETE /api/rooms/:id

Remove uma sala. **Requer permissão de administrador.**

---

## Endpoints de Recursos

### GET /api/resources

Lista todos os recursos disponíveis.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Projetor",
    "description": "Projetor HD"
  },
  {
    "id": 2,
    "name": "Videoconferência",
    "description": "Sistema de videoconferência"
  }
]
```

---

### POST /api/resources

Cria um novo recurso. **Requer permissão de administrador.**

---

### PUT /api/resources/:id

Atualiza um recurso. **Requer permissão de administrador.**

---

### DELETE /api/resources/:id

Remove um recurso. **Requer permissão de administrador.**

---

## Endpoints de Reservas

### GET /api/reservations

Lista todas as reservas.

**Response (200):**
```json
[
  {
    "id": 1,
    "roomId": 1,
    "userId": 1,
    "date": "2025-01-28",
    "startTime": "09:00",
    "endTime": "10:00",
    "title": "Reunião de Planejamento",
    "status": "confirmada",
    "participants": ["maria@empresa.com.br"]
  }
]
```

---

### GET /api/reservations/user/:userId

Lista reservas de um usuário específico.

---

### GET /api/reservations/:id

Retorna detalhes de uma reserva específica.

---

### POST /api/reservations

Cria uma nova reserva.

**Request Body:**
```json
{
  "roomId": 1,
  "date": "2025-01-28",
  "startTime": "09:00",
  "endTime": "10:00",
  "title": "Reunião de Planejamento",
  "description": "Discussão sobre o projeto X",
  "participants": ["maria@empresa.com.br", "jose@empresa.com.br"]
}
```

**Response (201):**
```json
{
  "id": 1,
  "roomId": 1,
  "userId": 1,
  "date": "2025-01-28",
  "startTime": "09:00",
  "endTime": "10:00",
  "title": "Reunião de Planejamento",
  "status": "confirmada",
  "calendarEventId": "abc123..."
}
```

---

### POST /api/reservations/series

Cria uma série de reservas recorrentes.

**Request Body:**
```json
{
  "roomId": 1,
  "startDate": "2025-01-28",
  "endDate": "2025-02-28",
  "startTime": "09:00",
  "endTime": "10:00",
  "title": "Reunião Semanal",
  "recurrencePattern": "weekly",
  "recurrenceDays": [1, 3, 5],
  "participants": ["equipe@empresa.com.br"]
}
```

---

### PUT /api/reservations/:id

Atualiza uma reserva existente.

**Request Body:**
```json
{
  "status": "cancelled"
}
```

---

### DELETE /api/reservations/:id

Cancela/remove uma reserva individual.

**Response:** `204 No Content`

---

### DELETE /api/reservations/series/:seriesId

Cancela todas as reservas de uma série.

**Response:** `204 No Content`

---

## Endpoints Administrativos

### GET /api/admin/reservations

Lista todas as reservas com filtros avançados. **Requer permissão de administrador.**

**Query Parameters:**
- `status` - Filtrar por status (confirmada, cancelada, etc.)
- `roomId` - Filtrar por sala
- `userId` - Filtrar por usuário
- `startDate` - Data inicial
- `endDate` - Data final
- `page` - Página (paginação)
- `limit` - Itens por página

---

### PUT /api/admin/reservations/:id/cancel

Cancela uma reserva como administrador.

**Response (200):**
```json
{
  "id": 1,
  "status": "cancelled",
  "cancelledAt": "2025-01-27T10:30:00Z",
  "cancelledBy": 1
}
```

---

### GET /api/audit/logs

Retorna logs de auditoria. **Requer permissão de administrador.**

**Response (200):**
```json
[
  {
    "id": 1,
    "action": "user.view",
    "userId": 1,
    "targetId": 2,
    "timestamp": "2025-01-27T10:30:00Z",
    "details": {}
  }
]
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (sucesso) |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 409 | Conflito (ex: sala já reservada) |
| 429 | Muitas requisições (rate limit) |
| 500 | Erro interno do servidor |

## Rate Limiting

A API implementa rate limiting para proteção:

- **Geral:** 100 requisições por minuto
- **Login:** 5 tentativas por 15 minutos
- **Recuperação de senha:** 3 tentativas por hora

Quando o limite é atingido, a resposta será `429 Too Many Requests`.
