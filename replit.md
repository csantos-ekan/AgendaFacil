# AgendaFácil

## Overview

AgendaFácil é uma aplicação full-stack projetada para gerenciar reservas de salas de reunião em ambiente corporativo. It enables employees to book meeting rooms and allows administrators to manage users, rooms, and resources. The project aims to streamline the booking process, optimize resource allocation, and enhance corporate efficiency. Key capabilities include robust reservation conflict validation, user and admin management dashboards, and integration with external communication and calendaring services.

## User Preferences

My preferences are:
- I want a clean, simple, and intuitive user interface.
- Focus on delivering core functionalities reliably and efficiently.
- Ensure the application is secure and compliant with data protection regulations.
- Prioritize clear feedback mechanisms for user actions.

## System Architecture

The application follows a client-server architecture with a clear separation of concerns.

### Frontend
- **Framework**: React 19 with TypeScript for robust type checking.
- **Build Tool**: Vite for fast development and optimized builds.
- **Styling**: TailwindCSS, delivered via CDN, for utility-first styling.
- **Component Library**: Custom components built with `class-variance-authority` for flexible and reusable UI elements.
- **UI/UX Decisions**: The application features a consistent design language with a focus on usability. Key UI components include views for login, user management, room management, resource management, and admin reservation oversight.

### Backend
- **Runtime**: Node.js 20.
- **Framework**: Express 5 for building RESTful APIs.
- **ORM**: Drizzle ORM for type-safe database interactions.
- **Authentication**: JWT-based authentication with secure token handling, session persistence via localStorage, and role-based access control (adminMiddleware). OAuth 2.0 with Google for simplified login, restricted to specific corporate domains.
- **Data Security**: CPF data is encrypted using AES-256-GCM and stored securely, with masking applied for non-admin users. JWT_SECRET is mandatory for server startup.
- **API Design**: RESTful API endpoints are provided for managing authentication, users, rooms, resources, and reservations.
- **Performance**: PostgreSQL indexing for improved query performance and optimization of availability checks. Race condition prevention in reservation creation using PostgreSQL transactions with `SELECT FOR UPDATE`.
- **Security**: Rate limiting is implemented for general API requests and login attempts to prevent brute-force attacks. CORS is restricted to allowed origins.
- **Core Features**:
    - **Reservation Management**: Supports individual and recurring reservations with conflict validation. Users can view and manage their own reservations. Administrators have comprehensive control over all reservations, including cancellation and viewing detailed logs.
    - **User Management**: Creation, retrieval, update, and deletion of users. Admins can manage all user accounts.
    - **Room & Resource Management**: CRUD operations for rooms and associated resources. Updates to resources are propagated across all relevant rooms.
    - **Data Privacy (LGPD/GDPR Compliance)**: Implementation of an audit logging system for actions on personal data and an endpoint for exporting user data.
    - **Password Management**: "Forgot Password" functionality with secure token generation, email-based reset, and rate limiting.

### Database
- **Type**: PostgreSQL (Neon).
- **Schema Management**: Drizzle ORM defines and synchronizes the database schema.
- **Indexes**: Strategic PostgreSQL indexes are used to accelerate common queries, such as user lookups, room availability, and reservation history.

## External Dependencies

- **PostgreSQL (Neon)**: Primary database for storing application data.
- **Google OAuth 2.0**: Used for user authentication and single sign-on.
- **Google Calendar API**: Integrated for creating, updating, and canceling calendar events for reservations, sending invitations to participants, and managing recurrence rules.
- **SMTP (Google Workspace)**: Used for sending password reset emails and, previously, for reservation notifications (now primarily handled by Google Calendar).
- **Vite**: Frontend build tool.
- **TailwindCSS (via CDN)**: Utility-first CSS framework.
- **Node.js**: Backend runtime environment.
- **Express**: Web application framework for the backend.
- **Drizzle ORM**: Object-Relational Mapper for database interactions.
- **`class-variance-authority`**: Frontend utility for managing component variants.