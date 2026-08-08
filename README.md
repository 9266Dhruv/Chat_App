# Nexus Access Node / Design System Sync (Chat App)

A full-stack, real-time chat application featuring a custom pixel-perfect dark theme UI, built with a modern React frontend and a robust Spring Boot backend.

## 🚀 Features

- **Real-Time Messaging:** Instant message delivery and syncing using STOMP over WebSockets.
- **Live Typing Indicators:** Bouncing typing animations show up instantly across different client windows when a user is typing.
- **JWT Authentication:** Secure user registration and login endpoints utilizing JSON Web Tokens.
- **Custom Aesthetic UI:**
  - *Nexus Access Node:* A highly stylized login/registration portal.
  - *Design System Sync:* A beautiful edge-to-edge chat interface with dynamic sidebars, message grouping, and custom message bubbles.
- **Command Palette:** Quick-switch between active conversations using `Cmd+K` (or `Ctrl+K`).
- **File Uploads:** Support for uploading and sharing files (e.g., images, PDFs) within chats.
- **Optimistic UI:** Messages appear instantly in the UI while being processed and saved by the backend.

## 🛠️ Tech Stack

### Frontend
- **React 18** (with TypeScript)
- **Vite** (Build tool and dev server)
- **Zustand** (Global state management for auth and sockets)
- **TanStack Query (React Query)** (Server-state caching and fetching)
- **Tailwind CSS** (Utility classes, alongside heavy custom Vanilla CSS)
- **STOMP.js & SockJS** (WebSocket client communication)

### Backend
- **Java 21 & Spring Boot 3.2**
- **Spring Security & JJWT** (Stateless authentication)
- **Spring WebSocket / STOMP** (Message broker for real-time features)
- **Spring Data JPA & Hibernate** (ORM for database interactions)
- **PostgreSQL** (Primary relational database)

---

## 🏃‍♂️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- Java JDK (v21+)
- Maven
- PostgreSQL (running locally on port 5432)

### 1. Database Configuration
1. Ensure PostgreSQL is running.
2. Create a database named `chatdb`.
3. The backend is configured to connect to `jdbc:postgresql://localhost:5432/chatdb` using the username `chatapp` and password `chatapp`. (You can change this in `backend/src/main/resources/application.yml`).

### 2. Backend Setup
Navigate to the `backend` directory and run the Spring Boot application:
```bash
cd backend
mvn spring-boot:run
```
*Note: The application will automatically create the required database tables (`ddl-auto: update`) and seed the database with demo users.*

### 3. Frontend Setup
Navigate to the `frontend` directory, install dependencies, and start the Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`. API and WebSocket requests are automatically proxied to the backend via Vite.

---

## 🔑 Demo User Credentials

The database automatically seeds itself with several dummy conversations and 4 test users. You can log into any of these accounts using the universal password:

**Password for all users:** `password123`

| Name | Email |
|---|---|
| Alice Johnson | `alice@demo.com` |
| Bob Smith | `bob@demo.com` |
| Charlie Chen | `charlie@demo.com` |
| Diana Ross | `diana@demo.com` |

*Tip: Open two different browsers (e.g., Chrome and Edge), log in as Alice in one and Bob in the other, and watch the real-time WebSockets and typing indicators work!*
