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
├── infrastructure/       # MikroORM Entities, Repository Implementations, External Adapters, Mappers
└── presentation/         # Controllers (REST API)
```

## Detailed Development Guidelines (DDD)

To maintain architectural integrity, all development must follow these strict Domain-Driven Design guidelines.

### 1. Tactical DDD Patterns

- **Aggregate Roots (`AggregateRootBase`)**: Aggregates are the basic element of transfer of data storage. They are the only objects that can be loaded from and saved to a repository. All business logic and state transitions must happen within the Aggregate Root.
- **Value Objects (`ValueObjectBase`)**: Used for properties that have no identity (e.g., Email, Price, SKU). They are immutable and must validate themselves upon creation.
- **Domain Entities (`DomainEntityBase`)**: Objects with a distinct identity that live within an aggregate (e.g., an OrderLineItem inside an Order).
- **Domain Events**: Aggregates emit domain events to notify other parts of the system about state changes. These events represent things that have already happened in the past.

### 2. Architectural Layer Responsibilities

- **Domain Layer**: Contains the business logic. It must be "pure" and have no dependencies on external frameworks, databases, or API clients. It uses interfaces (not implementations) for repositories.
- **Application Layer**: Orchestrates the domain objects. It receives Commands/Queries, loads Aggregates from Repositories, invokes domain logic, and saves the results. It also handles integration events and Sagas.
- **Infrastructure Layer**: Implements technical details. This includes MikroORM entities (which are different from Domain Aggregates), repository implementations, and adapters for external services like Stripe or S3.
- **Presentation Layer**: The entry point for external requests. It maps incoming data to Commands/Queries and returns DTOs.

### 3. Strict Rules and Constraints

- **Repository Rule**: Repositories must only return Aggregate Roots. They should never return Persistence Entities or DTOs directly to the application layer.
- **Persistence Decoupling**: We maintain separate classes for Domain Aggregates and Persistence Entities. Mappers are required to convert between these two representations in the Infrastructure layer.
- **No Cross-Module Repository Access**: Module A must never inject a Repository from Module B. Communication between modules must happen through:
  - **Integration Events** (via Outbox/Queue) for eventual consistency.
  - **Public Services** (Facades) for synchronous reads.
- **Eventual Consistency**: State changes that cross aggregate boundaries should be handled asynchronously via events. Use the Outbox pattern to ensure that the database update and event publication are atomic.
- **Command Handlers**: Should be thin. They should not contain business logic; their role is purely orchestration (fetch, call domain, save).

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
