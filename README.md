# NexusChat — Real-Time Messaging Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?logo=springboot" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql" />
  <img src="https://img.shields.io/badge/WebSocket-STOMP-FF6600" />
</p>

<p align="center">
  <b>Enterprise-grade real-time chat with WebSocket delivery, JWT security, and optimistic UI.</b><br>
  Built with Spring Boot 3.2, React 18, and PostgreSQL 16.
</p>

---

## Overview

NexusChat is a full-stack real-time messaging platform designed for high-velocity teams. It features a bespoke, pixel-perfect dark theme UI (the "Access Node" and "Design System Sync"), instant message delivery via WebSocket (STOMP), optimistic UI updates, live typing indicators, and a Command Palette — all secured with stateless JWT authentication.

This project demonstrates production-ready patterns including connection resilience, real-time state synchronization across multiple clients, edge-to-edge scalable UI architecture, and robust 401/403 lifecycle token management.

---

## Architecture

```
┌─────────────┐      REST/WebSocket      ┌──────────────────┐      JDBC
│   React 18  │ ◄──────────────────────► │  Spring Boot 3.2 │ ◄────────► PostgreSQL
│  (Vite/TS)  │    STOMP over SockJS     │   (Java 21)      │
└─────────────┘                          └──────────────────┘
     │                                            │
     │  Zustand (client auth state)               │  JJWT
     │  TanStack Query (server state)             │  Stateless sessions
     │  Custom Vanilla CSS (Aesthetics)           │  Spring Security
     └────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript + Vite | High-performance UI framework with strict type safety |
| **Styling** | Vanilla CSS + Tailwind | Edge-to-edge custom aesthetics and layout control |
| **State** | Zustand + TanStack Query | Client state + server cache synchronization |
| **Real-Time** | STOMP over WebSocket (SockJS) | Bidirectional messaging with fallback |
| **Backend** | Spring Boot 3.2 + Java 21 | Enterprise-grade REST API and Message Broker |
| **Security** | Spring Security + JJWT | Stateless authentication & authorization lifecycle |
| **Database** | PostgreSQL | Relational data persistence |
| **ORM** | Spring Data JPA (Hibernate) | Type-safe database operations |

---

## Features

### Core Messaging
- **Real-time delivery** — Messages broadcast via WebSocket STOMP with sub-100ms latency.
- **Optimistic UI** — Messages appear instantly on send, syncing seamlessly when processed by the backend.
- **Live Typing Indicators** — Real-time bouncing dot animations broadcast across clients via dedicated WS topics.
- **Reply Threading** — Native UI support for quoting and replying to specific messages.

### UX Polish
- **Command Palette** — `Cmd+K` spotlight search to instantly switch between active conversations.
- **Bespoke Aesthetics** — Edge-to-edge dark mode interface, glassmorphism elements, and glowing 3D-styled login portals.
- **Fluid Layout** — Fully responsive, dynamically adapting chat width that centers gracefully on ultra-wide screens.
- **Sound Feedback** — Subtle Web Audio API tones on message send and receive.

### Security
- **JWT authentication** — Short-lived access tokens (15 min) with stateless sessions.
- **Seamless Re-authentication** — Axios interceptors automatically handle 401/403 Spring Security responses to trigger graceful logouts.
- **Idempotent Sends** — `clientMessageId` UUIDs generated on the frontend prevent duplicate messages on retry.

---

## Quick Start

### Prerequisites
- Node.js (v18+)
- Java JDK (v21+)
- Maven
- PostgreSQL (running locally on port 5432)

### 1. Database Configuration
Ensure PostgreSQL is running and create a database named `chatdb`. The backend expects credentials `chatapp` / `chatapp` (configurable in `application.yml`).

### 2. Start Backend
```bash
cd backend
mvn spring-boot:run
```
*Note: The application uses `ddl-auto: update` to instantly build the schema and seed the database with demo users.*

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev
```
The app will open at `http://localhost:5173`.

---

## Demo Credentials

The database automatically seeds itself. You can log into any of these accounts using the universal password:

**Password for all users:** `password123`

| Name | Email |
|---|---|
| Alice Johnson | `alice@demo.com` |
| Bob Smith | `bob@demo.com` |
| Charlie Chen | `charlie@demo.com` |
| Diana Ross | `diana@demo.com` |

*Tip: Open two different browsers (e.g., Chrome and Edge), log in as Alice in one and Bob in the other, and test the real-time WebSockets and typing indicators!*

---

## Architecture Decisions

### Why Optimistic UI?
Network latency creates a perceptible delay between the send action and server confirmation. Optimistic updates render the message immediately with a pending state, then reconcile when the server ACK arrives. This keeps the application feeling instantly responsive.

### Why STOMP Over Raw WebSocket?
Raw WebSocket requires custom framing, heartbeat, and subscription management. STOMP provides standardized message semantics (`SUBSCRIBE`, `SEND`, `MESSAGE`) with built-in broker routing, drastically reducing custom protocol code.

### Why Stateless JWT Over Session Cookies?
Session cookies require server-side session storage and sticky load balancing. JWT enables horizontal scaling without shared session state — any backend instance can validate a token independently using only the signing secret.

---

## Performance & Scalability

| Metric | Target | Implementation |
|--------|--------|----------------|
| Message delivery latency | < 150ms p99 | WebSocket broadcast via Spring simple broker |
| Database writes | Efficient I/O | JPA batch inserts + Hikari connection pooling |
| Connection Lifecycle | Graceful Degradation | React Query polling fallback + WebSocket auto-reconnects |

**Scaling path:** The current architecture uses a single WebSocket broker instance. For multi-node deployment, replace `enableSimpleBroker` with `enableStompBrokerRelay` pointing to RabbitMQ or ActiveMQ — no client-side changes required.

---

## Security Architecture

| Layer | Protection |
|-------|-----------|
| **Authentication** | JWT access tokens (15 min expiry) |
| **Authorization** | Conversation membership verified on every message fetch |
| **Token Lifecycle** | Strict 403 handling on the frontend prevents ghost sessions |
| **Idempotency** | `clientMessageId` UUID deduplication prevents replay attacks |
| **CORS** | Configured origins proxying securely through Vite in dev |


