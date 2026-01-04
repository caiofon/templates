# Angular Admin Panel

Enterprise admin panel with Angular Material, NgRx, and lazy loading.

## Features

- ✅ Lazy-loaded feature modules
- ✅ NgRx store with effects
- ✅ Angular Material components
- ✅ Role-based route guards
- ✅ Reactive forms with validation
- ✅ Internationalization (i18n)

## Quick Start

```bash
npm install
ng serve
```

## Project Structure

```
src/app/
├── core/           # Singleton services, guards, interceptors
├── shared/         # Shared components, pipes, directives
├── features/       # Lazy-loaded feature modules
│   ├── dashboard/
│   ├── users/
│   └── settings/
├── store/          # NgRx store
└── app.routes.ts
```
