# Changelog - AgendaFácil

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
- Documentação técnica completa (API.md, ARCHITECTURE.md, etc.)

---

## [1.5.0] - 2025-01-27

### Alterado
- Nome do sistema alterado de "RoomBooker Corporate" para "AgendaFácil"
- Atualização de branding em toda a aplicação

---

## [1.4.0] - 2025-01-27

### Adicionado
- Cancelamento individual de reservas em séries recorrentes
- Função `deleteCalendarEventInstance` para remover apenas uma ocorrência do Google Calendar
- Modal de escolha entre cancelar reserva individual ou série completa

### Corrigido
- Bug que removia todo o evento recorrente do Google Calendar ao cancelar uma única reserva

---

## [1.3.0] - 2025-01-26

### Adicionado
- Opção de cancelar série inteira ou reserva individual
- Badge "Série" para identificar reservas recorrentes
- Cards expansíveis em "Minhas Reservas" mostrando datas da série
- Endpoint DELETE /api/reservations/series/:seriesId

### Melhorado
- Interface de gerenciamento de reservas recorrentes

---

## [1.2.0] - 2025-01-25

### Adicionado
- Funcionalidade de recuperação de senha
- Envio de email para reset de senha via SMTP
- Validação e expiração de tokens de reset
- Rate limiting para tentativas de reset

### Segurança
- Tokens de reset com hash SHA-256
- Expiração de tokens após 1 hora
- Limite de 3 tentativas por hora

---

## [1.1.0] - 2025-01-24

### Adicionado
- Paginação na tela de gerenciamento de reservas (10 itens por página)
- Modal de confirmação ao cancelar reservas
- Capacidade de administradores cancelarem reservas
- Filtros avançados para administradores

### Segurança
- Revisão completa de segurança do sistema
- JWT_SECRET obrigatório para inicialização
- Restrição de acesso a dados sensíveis

---

## [1.0.0] - 2025-01-23

### Adicionado
- Sistema de autenticação JWT
- Login com Google OAuth 2.0 (restrição de domínio @ekan.com.br)
- Gerenciamento de usuários (CRUD)
- Gerenciamento de salas (CRUD)
- Gerenciamento de recursos (CRUD)
- Sistema de reservas individuais
- Sistema de reservas recorrentes
- Integração com Google Calendar
- Envio de convites para participantes
- Criptografia de CPF (AES-256-GCM)
- Mascaramento de CPF para não-administradores
- Sistema de auditoria (LGPD)
- Exportação de dados do usuário (LGPD)
- Rate limiting para proteção contra brute force
- Interface responsiva com TailwindCSS

### Segurança
- Autenticação baseada em JWT
- Criptografia de dados sensíveis
- Logs de auditoria para compliance LGPD
- Validação de conflitos de reservas
- Prevenção de race conditions com transações

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades.
- **Alterado** para mudanças em funcionalidades existentes.
- **Descontinuado** para funcionalidades que serão removidas em breve.
- **Removido** para funcionalidades removidas.
- **Corrigido** para correções de bugs.
- **Segurança** para correções de vulnerabilidades.

---

## Contribuidores

- Equipe de Desenvolvimento AgendaFácil
