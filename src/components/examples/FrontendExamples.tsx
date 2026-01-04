import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const reactExamples = `// ==================== REACT - EXEMPLOS E PADRÕES ====================

// ==================== HOOKS CUSTOMIZADOS ====================

// useLocalStorage - Persistência em localStorage
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// useFetch - Hook para requisições HTTP
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}

// useDebounce - Debounce para inputs
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// ==================== CONTEXT API ====================

// AuthContext - Gerenciamento de autenticação
import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar token no localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      validateToken(token).then(setUser).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const { user, token } = await response.json();
    localStorage.setItem('authToken', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// ==================== COMPONENTES REUTILIZÁVEIS ====================

// DataTable - Tabela com ordenação e paginação
interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  pageSize = 10 
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? 'cursor-pointer hover:bg-gray-50' : ''}
              >
                {col.header}
                {sortKey === col.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={setCurrentPage} 
      />
    </div>
  );
}

// ==================== REACT QUERY PATTERNS ====================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook para buscar usuários
function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos (antes cacheTime)
  });
}

// Hook para criar usuário com invalidação de cache
function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newUser: CreateUserDto) => 
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

// Optimistic updates
function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: User) => 
      fetch(\`/api/users/\${user.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }).then(res => res.json()),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previousUsers = queryClient.getQueryData(['users']);
      queryClient.setQueryData(['users'], (old: User[]) =>
        old.map(u => u.id === newUser.id ? newUser : u)
      );
      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      queryClient.setQueryData(['users'], context?.previousUsers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// ==================== PROTECTED ROUTES ====================

import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role ?? '')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Uso no Router
const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin" element={
      <ProtectedRoute requiredRoles={['admin']}>
        <AdminPanel />
      </ProtectedRoute>
    } />
  </Routes>
);

// ==================== FORM COM REACT HOOK FORM + ZOD ====================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type UserFormData = z.infer<typeof userSchema>;

function UserForm({ onSubmit }: { onSubmit: (data: UserFormData) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const handleFormSubmit = async (data: UserFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name">Nome</label>
        <input id="name" {...register('name')} />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>
      
      <div>
        <label htmlFor="password">Senha</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>
      
      <div>
        <label htmlFor="confirmPassword">Confirmar Senha</label>
        <input id="confirmPassword" type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
`;

const angularExamples = `// ==================== ANGULAR - EXEMPLOS E PADRÕES ====================

// ==================== COMPONENTES STANDALONE (Angular 17+) ====================

// user-list.component.ts
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="user-list">
      <input 
        type="text" 
        [value]="searchTerm()" 
        (input)="searchTerm.set($any($event.target).value)"
        placeholder="Buscar usuário..."
      />
      
      @if (loading()) {
        <div class="loading">Carregando...</div>
      } @else {
        @for (user of filteredUsers(); track user.id) {
          <div class="user-card">
            <h3>{{ user.name }}</h3>
            <p>{{ user.email }}</p>
            <span [class]="'badge ' + user.role">{{ user.role }}</span>
          </div>
        } @empty {
          <p>Nenhum usuário encontrado</p>
        }
      }
    </div>
  \`
})
export class UserListComponent {
  private http = inject(HttpClient);
  
  searchTerm = signal('');
  loading = signal(true);
  
  private users = toSignal(
    this.http.get<User[]>('/api/users'),
    { initialValue: [] }
  );
  
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  });

  constructor() {
    // Effect para log de mudanças
    effect(() => {
      console.log('Filtered users:', this.filteredUsers().length);
    });
  }
}

// ==================== SERVICES COM INJEÇÃO DE DEPENDÊNCIA ====================

// auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private state = signal<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    loading: false
  });
  
  // Selectores computados
  user = computed(() => this.state().user);
  isAuthenticated = computed(() => !!this.state().token);
  isLoading = computed(() => this.state().loading);
  
  login(email: string, password: string): Observable<any> {
    this.state.update(s => ({ ...s, loading: true }));
    
    return this.http.post<{ user: User; token: string }>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.state.set({
            user: response.user,
            token: response.token,
            loading: false
          });
          this.router.navigate(['/dashboard']);
        }),
        catchError(error => {
          this.state.update(s => ({ ...s, loading: false }));
          throw error;
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem('token');
    this.state.set({ user: null, token: null, loading: false });
    this.router.navigate(['/login']);
  }
  
  validateToken(): Observable<User | null> {
    const token = this.state().token;
    if (!token) return of(null);
    
    return this.http.get<User>('/api/auth/me').pipe(
      tap(user => this.state.update(s => ({ ...s, user }))),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }
}

// ==================== GUARDS COM FUNCTIONAL APPROACH ====================

// auth.guard.ts
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as string[];
  const userRole = authService.user()?.role;
  
  if (userRole && requiredRoles.includes(userRole)) {
    return true;
  }
  
  return router.createUrlTree(['/unauthorized']);
};

// Uso nas rotas:
// { path: 'admin', component: AdminComponent, canActivate: [authGuard, roleGuard], data: { roles: ['admin'] } }

// ==================== INTERCEPTORS FUNCIONAIS ====================

// auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', \`Bearer \${token}\`) })
    : req;
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

// Logging interceptor
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const elapsed = Date.now() - started;
          console.log(\`\${req.method} \${req.urlWithParams} - \${elapsed}ms\`);
        }
      },
      error: (error) => {
        const elapsed = Date.now() - started;
        console.error(\`\${req.method} \${req.urlWithParams} failed after \${elapsed}ms\`);
      }
    })
  );
};

// ==================== REACTIVE FORMS ====================

// user-form.component.ts
import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: \`
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Nome</label>
        <input id="name" formControlName="name" />
        @if (form.get('name')?.errors?.['required'] && form.get('name')?.touched) {
          <span class="error">Nome é obrigatório</span>
        }
        @if (form.get('name')?.errors?.['minlength']) {
          <span class="error">Nome deve ter pelo menos 2 caracteres</span>
        }
      </div>
      
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" formControlName="email" />
        @if (form.get('email')?.errors?.['email'] && form.get('email')?.touched) {
          <span class="error">Email inválido</span>
        }
      </div>
      
      <div formGroupName="address">
        <div class="form-group">
          <label for="street">Rua</label>
          <input id="street" formControlName="street" />
        </div>
        <div class="form-group">
          <label for="city">Cidade</label>
          <input id="city" formControlName="city" />
        </div>
      </div>
      
      <div formArrayName="phones">
        @for (phone of phonesArray.controls; track $index) {
          <div class="phone-row">
            <input [formControlName]="$index" placeholder="Telefone" />
            <button type="button" (click)="removePhone($index)">Remover</button>
          </div>
        }
        <button type="button" (click)="addPhone()">Adicionar Telefone</button>
      </div>
      
      <button type="submit" [disabled]="form.invalid || isSubmitting()">
        {{ isSubmitting() ? 'Salvando...' : 'Salvar' }}
      </button>
    </form>
  \`
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  
  submitted = output<UserFormData>();
  isSubmitting = signal(false);
  
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: this.fb.group({
      street: [''],
      city: ['', Validators.required],
    }),
    phones: this.fb.array([this.fb.control('')]),
  });
  
  get phonesArray() {
    return this.form.get('phones') as FormArray;
  }
  
  addPhone() {
    this.phonesArray.push(this.fb.control(''));
  }
  
  removePhone(index: number) {
    this.phonesArray.removeAt(index);
  }
  
  // Validador customizado
  static passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }
  
  async onSubmit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      this.submitted.emit(this.form.value as UserFormData);
    }
  }
}

// ==================== PIPES CUSTOMIZADOS ====================

// truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, trail: string = '...'): string {
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}

// relative-time.pipe.ts
@Pipe({ name: 'relativeTime', standalone: true, pure: false })
export class RelativeTimePipe implements PipeTransform {
  transform(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return \`\${diffDays} dia(s) atrás\`;
    if (diffHours > 0) return \`\${diffHours} hora(s) atrás\`;
    if (diffMins > 0) return \`\${diffMins} minuto(s) atrás\`;
    return 'Agora mesmo';
  }
}

// ==================== DIRETIVAS CUSTOMIZADAS ====================

// highlight.directive.ts
import { Directive, ElementRef, HostListener, input, inject } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  private el = inject(ElementRef);
  
  highlightColor = input('yellow', { alias: 'appHighlight' });
  defaultColor = input('transparent');
  
  @HostListener('mouseenter')
  onMouseEnter() {
    this.highlight(this.highlightColor());
  }
  
  @HostListener('mouseleave')
  onMouseLeave() {
    this.highlight(this.defaultColor());
  }
  
  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
`;

const reactCommands = `# ==================== REACT CLI - DICIONÁRIO DE COMANDOS ====================

# ==================== CREATE REACT APP (LEGACY) ====================

npx create-react-app my-app                    # Criar app básico
npx create-react-app my-app --template typescript  # Com TypeScript

# ==================== VITE (RECOMENDADO) ====================

npm create vite@latest my-app -- --template react      # React + JavaScript
npm create vite@latest my-app -- --template react-ts   # React + TypeScript
npm create vite@latest my-app -- --template react-swc  # React + SWC (mais rápido)
npm create vite@latest my-app -- --template react-swc-ts  # React + SWC + TS

cd my-app
npm install
npm run dev            # Desenvolvimento (hot reload)
npm run build          # Build para produção
npm run preview        # Preview do build

# ==================== DEPENDÊNCIAS COMUNS ====================

# Roteamento
npm install react-router-dom

# Gerenciamento de Estado
npm install zustand                    # Simples e leve
npm install @reduxjs/toolkit react-redux  # Redux moderno
npm install jotai                      # Atômico
npm install @tanstack/react-query      # Server state

# Formulários
npm install react-hook-form
npm install @hookform/resolvers zod    # Validação com Zod

# UI Components
npm install @radix-ui/react-dialog     # Primitivos acessíveis
npm install class-variance-authority   # Variantes de classe
npm install clsx tailwind-merge        # Merge de classes

# Animações
npm install framer-motion
npm install @react-spring/web

# HTTP
npm install axios
npm install ky                         # Alternativa leve ao Axios

# Utilitários
npm install date-fns                   # Manipulação de datas
npm install lodash-es                  # Utilitários (ES modules)
npm install uuid                       # Geração de UUIDs

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D msw                     # Mock Service Worker

# ==================== SCRIPTS PACKAGE.JSON ====================

{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\""
  }
}

# ==================== ESTRUTURA DE PASTAS RECOMENDADA ====================

src/
├── assets/              # Imagens, fontes, etc.
├── components/          # Componentes reutilizáveis
│   ├── ui/              # Componentes primitivos (Button, Input, etc.)
│   └── features/        # Componentes específicos de features
├── hooks/               # Custom hooks
├── lib/                 # Utilitários e helpers
├── pages/               # Páginas/rotas
├── services/            # API calls
├── stores/              # Estado global (Zustand, Redux)
├── types/               # TypeScript types/interfaces
└── App.tsx

# ==================== TESTING ====================

# Executar todos os testes
npm run test

# Modo watch
npm run test -- --watch

# Cobertura
npm run test -- --coverage

# Teste específico
npm run test -- UserList.test.tsx

# UI mode (vitest)
npm run test -- --ui
`;

const angularCommands = `# ==================== ANGULAR CLI - DICIONÁRIO DE COMANDOS ====================

# ==================== INSTALAÇÃO ====================

npm install -g @angular/cli@latest    # Instalar CLI globalmente
ng version                            # Verificar versão

# ==================== CRIAÇÃO DE PROJETO ====================

ng new my-app                         # Criar novo projeto
ng new my-app --routing               # Com roteamento
ng new my-app --style=scss            # Com SCSS
ng new my-app --standalone            # Sem NgModules (Angular 17+)
ng new my-app --ssr                   # Com Server-Side Rendering
ng new my-app --prefix=app            # Prefixo customizado

# Opções comuns
ng new my-app --routing --style=scss --standalone --strict

# ==================== DESENVOLVIMENTO ====================

ng serve                              # Iniciar dev server (porta 4200)
ng serve --port 3000                  # Porta customizada
ng serve --open                       # Abrir no browser
ng serve --configuration=production  # Modo produção
ng serve --ssl                        # Com HTTPS

# ==================== GERAÇÃO DE CÓDIGO ====================

# Componentes
ng generate component users                    # ou ng g c users
ng generate component users --standalone       # Standalone component
ng generate component users --inline-style     # Estilos inline
ng generate component users --inline-template  # Template inline
ng generate component users --skip-tests       # Sem arquivo de teste
ng generate component shared/button --export   # Exportar no module

# Services
ng generate service users                      # ou ng g s users
ng generate service users --skip-tests

# Modules (legacy)
ng generate module admin                       # ou ng g m admin
ng generate module admin --routing             # Com roteamento

# Guards
ng generate guard auth                         # ou ng g g auth
ng generate guard auth --functional            # Guard funcional

# Interceptors
ng generate interceptor auth                   # ou ng g interceptor auth
ng generate interceptor auth --functional      # Interceptor funcional

# Pipes
ng generate pipe truncate                      # ou ng g p truncate
ng generate pipe truncate --standalone

# Directives
ng generate directive highlight                # ou ng g d highlight
ng generate directive highlight --standalone

# Interfaces/Types
ng generate interface user                     # ou ng g i user
ng generate interface user --type=model        # user.model.ts
ng generate class user --type=dto              # user.dto.ts
ng generate enum user-role                     # ou ng g e user-role

# Resolver
ng generate resolver user                      # ou ng g r user

# ==================== BUILD ====================

ng build                              # Build de desenvolvimento
ng build --configuration=production  # Build de produção
ng build --output-path=dist/app      # Diretório customizado
ng build --base-href=/my-app/        # Base href para subpaths
ng build --source-map                 # Gerar source maps
ng build --stats-json                 # Gerar stats para análise

# Análise de bundle
npm install -D webpack-bundle-analyzer
ng build --stats-json
npx webpack-bundle-analyzer dist/my-app/stats.json

# ==================== TESTING ====================

ng test                               # Executar testes unitários
ng test --watch=false                 # Executar uma vez
ng test --code-coverage               # Com cobertura
ng test --browsers=ChromeHeadless     # Headless mode

ng e2e                                # Testes end-to-end

# ==================== LINTING E FORMATAÇÃO ====================

ng lint                               # Executar ESLint
ng lint --fix                         # Corrigir automaticamente

# Adicionar ESLint (se não existir)
ng add @angular-eslint/schematics

# ==================== ATUALIZAÇÃO ====================

ng update                             # Ver pacotes desatualizados
ng update @angular/cli @angular/core  # Atualizar Angular
ng update --all                       # Atualizar todos

# ==================== CACHE ====================

ng cache clean                        # Limpar cache
ng cache info                         # Info do cache
ng cache enable                       # Habilitar cache
ng cache disable                      # Desabilitar cache

# ==================== CONFIGURAÇÕES ====================

ng config cli.analytics false         # Desabilitar analytics
ng config projects.my-app.architect.build.options.aot true

# ==================== ADD LIBRARIES ====================

ng add @angular/material              # Angular Material
ng add @angular/pwa                   # PWA support
ng add @angular/ssr                   # Server-Side Rendering
ng add @ngrx/store                    # NgRx Store
ng add @angular/fire                  # Firebase
ng add @angular/localize              # Internacionalização

# ==================== ESTRUTURA DE PASTAS ====================

src/
├── app/
│   ├── core/                # Services singleton, guards, interceptors
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── shared/              # Componentes, pipes, diretivas compartilhados
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/            # Módulos de funcionalidades
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── users.routes.ts
│   │   └── products/
│   ├── app.component.ts
│   ├── app.config.ts        # Configuração standalone
│   └── app.routes.ts        # Rotas principais
├── assets/
├── environments/
└── styles.scss
`;

const categories = [
  {
    id: "react-examples",
    title: "React - Padrões e Exemplos",
    badge: "React 18+",
    language: "tsx",
    examples: [
      { title: "Hooks, Context, Forms e React Query", code: reactExamples, filename: "react-patterns.tsx" },
    ],
  },
  {
    id: "angular-examples",
    title: "Angular - Padrões e Exemplos",
    badge: "Angular 17+",
    language: "typescript",
    examples: [
      { title: "Signals, Services, Guards e Forms", code: angularExamples, filename: "angular-patterns.ts" },
    ],
  },
  {
    id: "react-commands",
    title: "React CLI - Comandos",
    badge: "Vite",
    language: "bash",
    examples: [
      { title: "Setup, Dependências e Testing", code: reactCommands, filename: "react-cli.sh" },
    ],
  },
  {
    id: "angular-commands",
    title: "Angular CLI - Comandos",
    badge: "ng",
    language: "bash",
    examples: [
      { title: "Geração, Build e Testing", code: angularCommands, filename: "angular-cli.sh" },
    ],
  },
];

const FrontendExamples = () => {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-3">
                <span className="font-mono">{category.title}</span>
                <Badge variant="outline" className="font-mono text-xs">
                  {category.badge}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6 pt-4">
                {category.examples.map((example) => (
                  <div key={example.title}>
                    <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                      {example.title}
                    </h4>
                    <CodeBlock code={example.code} language={category.language} filename={example.filename} />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FrontendExamples;
