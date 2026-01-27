# Segurança - AgendaFácil

## Visão Geral

Este documento descreve as medidas de segurança implementadas no sistema AgendaFácil, incluindo autenticação, autorização, proteção de dados e conformidade com regulamentações.

## Autenticação

### JWT (JSON Web Tokens)

O sistema utiliza JWT para autenticação stateless.

**Características:**
- Tokens assinados com algoritmo HS256
- Expiração configurável (padrão: 24 horas)
- Payload contém: userId, role, email
- Segredo obrigatório (`JWT_SECRET`)

**Fluxo:**
```
1. Usuário envia credenciais
2. Servidor valida e gera token
3. Cliente armazena token em localStorage
4. Requisições incluem token no header Authorization
5. Servidor valida token em cada requisição
```

### Google OAuth 2.0

Autenticação via Google com restrição de domínio.

**Configuração:**
- Domínio permitido: `@ekan.com.br`
- Scopes: email, profile
- Callback URL configurável por ambiente

**Segurança:**
- Validação de domínio no callback
- Criação automática de usuário se não existir
- Tokens do Google não são expostos ao frontend

### Senhas

**Armazenamento:**
- Hash com bcrypt (custo: 10 rounds)
- Salt único por senha
- Senha original nunca armazenada

**Requisitos:**
- Mínimo 6 caracteres
- Validação no frontend e backend

### Recuperação de Senha

**Fluxo seguro:**
1. Usuário solicita reset via email
2. Token aleatório gerado (32 bytes)
3. Token hashado com SHA-256 antes de armazenar
4. Link enviado por email
5. Token válido por 1 hora
6. Token invalidado após uso

**Rate Limiting:**
- 3 tentativas por hora por IP
- Mensagem genérica para não revelar existência de email

## Autorização

### Controle de Acesso Baseado em Roles (RBAC)

**Roles:**
- `admin` - Acesso total ao sistema
- `colaborador` - Acesso limitado

### Middleware de Autorização

```typescript
// authMiddleware - Verifica autenticação
// adminMiddleware - Verifica role de admin
```

**Proteções por endpoint:**

| Recurso | Leitura | Escrita | Exclusão |
|---------|---------|---------|----------|
| Próprio perfil | Todos | Todos | - |
| Outros usuários | Admin | Admin | Admin |
| Salas | Todos | Admin | Admin |
| Recursos | Todos | Admin | Admin |
| Próprias reservas | Todos | Todos | Todos |
| Todas reservas | Admin | Admin | Admin |
| Logs de auditoria | Admin | - | - |

## Proteção de Dados Sensíveis

### CPF (Cadastro de Pessoa Física)

**Criptografia:**
- Algoritmo: AES-256-GCM
- Chave: 32 bytes (via `ENCRYPTION_KEY`)
- IV único por registro
- Tag de autenticação para integridade

**Mascaramento:**
- Administradores: veem CPF completo
- Colaboradores: veem apenas `***.***.***-XX` (últimos 2 dígitos)

```typescript
// Exemplo de mascaramento
"123.456.789-00" → "***.***.***-00"
```

### Variáveis de Ambiente

**Segredos obrigatórios:**
- `JWT_SECRET` - Assinatura de tokens
- `ENCRYPTION_KEY` - Criptografia de CPF
- `DATABASE_URL` - Conexão com banco

**Segredos opcionais:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `SMTP_USER`
- `SMTP_PASSWORD`

**Boas práticas:**
- Nunca commitar segredos no código
- Usar variáveis de ambiente do Replit
- Rotacionar segredos periodicamente

## Proteção contra Ataques

### Rate Limiting

**Configuração:**
```typescript
// Geral: 100 requisições/minuto
// Login: 5 tentativas/15 minutos
// Reset senha: 3 tentativas/hora
```

**Resposta:** `429 Too Many Requests`

### CORS (Cross-Origin Resource Sharing)

**Configuração:**
- Origens permitidas configuráveis
- Métodos: GET, POST, PUT, DELETE
- Headers: Authorization, Content-Type

### SQL Injection

**Proteção:**
- Drizzle ORM com prepared statements
- Validação de entrada
- Sem concatenação de strings em queries

### XSS (Cross-Site Scripting)

**Proteção:**
- React escapa conteúdo por padrão
- Content-Type headers corretos
- Sanitização de entrada quando necessário

### CSRF (Cross-Site Request Forgery)

**Proteção:**
- Autenticação via header Authorization
- Não uso de cookies para autenticação
- Validação de origem

## Auditoria e Logs

### Sistema de Auditoria

**Eventos registrados:**
- Visualização de dados de usuários
- Criação/edição/exclusão de registros
- Ações administrativas

**Dados capturados:**
- ID do usuário que executou a ação
- Tipo de ação
- ID do recurso afetado
- Timestamp
- Detalhes adicionais

### Logs de Aplicação

**Níveis:**
- `console.log` - Informações gerais
- `console.error` - Erros e exceções

**Boas práticas:**
- Não logar dados sensíveis (senhas, tokens)
- Incluir contexto suficiente para debugging
- Timestamps implícitos pelo ambiente

## Conformidade LGPD

### Direitos do Titular

**Implementado:**

1. **Acesso aos dados**
   - Endpoint: `GET /api/users/:id/export`
   - Retorna todos os dados do usuário em JSON

2. **Correção de dados**
   - Endpoint: `PUT /api/users/:id`
   - Usuário pode atualizar seu próprio perfil

3. **Minimização de dados**
   - Apenas dados necessários são coletados
   - CPF é criptografado

4. **Registro de tratamento**
   - Logs de auditoria para ações em dados pessoais

### Dados Coletados

| Campo | Propósito | Retenção |
|-------|-----------|----------|
| Nome | Identificação | Enquanto ativo |
| Email | Login/Comunicação | Enquanto ativo |
| CPF | Identificação única | Criptografado |
| Avatar | Personalização | Enquanto ativo |
| Histórico reservas | Funcionalidade | Indefinido |

### Consentimento

- Aceite implícito ao usar o sistema
- Política de privacidade recomendada

## Recomendações de Segurança

### Para Administradores

1. **Rotação de segredos**
   - Trocar JWT_SECRET periodicamente
   - Atualizar ENCRYPTION_KEY com cuidado (requer re-criptografia)

2. **Monitoramento**
   - Revisar logs de auditoria regularmente
   - Alertar sobre tentativas de login suspeitas

3. **Backups**
   - Backup regular do banco de dados
   - Testar restauração periodicamente

### Para Desenvolvedores

1. **Código seguro**
   - Validar todas as entradas
   - Usar tipos TypeScript
   - Não expor stack traces em produção

2. **Dependências**
   - Manter dependências atualizadas
   - Verificar vulnerabilidades com `npm audit`

3. **Revisão de código**
   - Revisar mudanças de segurança
   - Testar casos de borda

## Limitações Conhecidas

1. **Tokens JWT não revogáveis**
   - Tokens permanecem válidos até expirar
   - Mitigação: tempo de expiração curto

2. **Sessão em localStorage**
   - Vulnerável a XSS se houver falha
   - Mitigação: CSP headers, sanitização

3. **Logs não centralizados**
   - Logs apenas no console
   - Recomendação: implementar logging centralizado

## Contato de Segurança

Para reportar vulnerabilidades de segurança, entre em contato com a equipe de desenvolvimento através dos canais internos apropriados.

**Não divulgue vulnerabilidades publicamente antes de serem corrigidas.**
