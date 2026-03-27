# Multi-Vendor E-Commerce Backend

This project is a scalable, modular monolith backend built with NestJS, adhering to Domain-Driven Design (DDD) and Command Query Responsibility Segregation (CQRS) principles. It handles complex multi-vendor workflows, including split payments, inventory management, and eventually consistent communication between bounded contexts.

## Architecture

The system is designed as a Modular Monolith. Each module represents a distinct bounded context, maintaining its own internal domain logic, application services, and infrastructure adapters.

### Key Patterns
- **DDD (Domain-Driven Design)**: Business logic is encapsulated within Aggregate Roots and Domain Entities.
- **CQRS (Command Query Responsibility Segregation)**: Write operations (Commands) are handled separately from read operations (Queries) via the NestJS CqrsModule.
- **Outbox Pattern**: Ensures reliable event delivery between modules by persisting domain events to a database-backed outbox before publishing them to the message queue.
- **Queue-Based Communication**: BullMQ and Redis are used for asynchronous inter-module communication and background tasks.

## Project Structure

```text
src/
├── modules/
│   ├── account/          # Account management and authentication
│   ├── billing/          # Payments, transfers, and refund logic (Stripe integration)
│   ├── cart/             # Shopping cart management
│   ├── inventory/        # Stock management and reservation workflows
│   ├── order/            # Checkout, order splitting, and fulfillment status
│   ├── product/          # Product catalog, variants, and attributes
│   └── vendor/           # Vendor profiles and management
├── shared/
│   └── ddd/              # Shared kernel and base tactical DDD classes
│       ├── domain/       # AggregateRoot, Entity, ValueObject bases
│       ├── application/  # Integration event bases
│       └── infrastructure/# Shared repositories, database, queue, and outbox configurations
└── main.ts               # Application entry point
```

### Module Anatomy
Each module follows a layered structure:
```text
module-name/
├── domain/               # Aggregates, Entities, Value Objects, Domain Events, Repositories Interfaces
├── application/          # Command/Query Handlers, DTOs, Event Processors (Sagas)
├── infrastructure/       # MikroORM Entities, Repository Implementations, External Adapters
└── presentation/         # Controllers (REST API)
```

## Core Tech Stack

- **Framework**: NestJS 11.0.1
- **Database**: PostgreSQL 16
- **ORM**: MikroORM 6.4.16
- **Queue System**: BullMQ 5.65.0 + Redis
- **Payment Provider**: Stripe 16.11.0
- **Validation**: Class-validator 0.14.2 + Class-transformer 0.5.1
- **Storage**: AWS S3 SDK 3.952.0

## Setup and Installation

### Prerequisites
- Node.js >= 20
- Docker and Docker Compose
- Redis

### Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env` and fill in the required credentials for PostgreSQL, Redis, and Stripe.

3. **Infrastructure**:
   Start the required services using Docker:
   ```bash
   docker compose up -d
   ```

4. **Database Migrations**:
   Run the migrations to set up the database schema:
   ```bash
   npx mikro-orm migration:up
   ```

5. **Running the Application**:
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## Development Guidelines

- **Domain Isolation**: Aggregate Roots must not depend on application services or repositories.
- **Communication**: Cross-module communication should happen via Shared Public Services or asynchronous integration events.
- **Persistence**: Domain events should be published through the Outbox to maintain transactional integrity between the primary database and the message queue.
- **Validation**: All incoming requests must be validated using the global ValidationPipe and DTO classes.
