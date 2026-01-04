# NestJS REST API Template

NestJS REST API with Prisma ORM, JWT authentication, and Swagger documentation.

## Features

- ✅ Modular architecture with dependency injection
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Request validation with class-validator
- ✅ Swagger/OpenAPI documentation
- ✅ E2E testing with Jest and Supertest

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Run development server
npm run start:dev
```

## API Documentation

After starting the server, visit: http://localhost:3000/api

## Project Structure

```
src/
├── auth/
├── users/
├── common/
│   ├── decorators/
│   ├── guards/
│   ├── interceptors/
│   └── filters/
├── prisma/
├── app.module.ts
└── main.ts
```
