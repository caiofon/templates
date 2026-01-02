import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const nestJsController = `// NestJS - Controller com Decorators e Validação
import { 
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, Headers, Req, Res,
  HttpCode, HttpStatus, UseGuards, UseInterceptors,
  ParseUUIDPipe, ValidationPipe, CacheInterceptor
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto, OrderQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('orders')
@Controller('api/v1/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  async create(
    @Body(new ValidationPipe({ transform: true })) createOrderDto: CreateOrderDto,
    @CurrentUser() user: User,
  ) {
    return this.orderService.create(createOrderDto, user.id);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'List orders with pagination and filters' })
  async findAll(
    @Query(new ValidationPipe({ transform: true })) query: OrderQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.orderService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.orderService.findOne(id, user);
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrderDto,
  ) {
    return this.orderService.updateStatus(id, updateDto.status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.orderService.remove(id);
  }
}`;

const nestJsService = `// NestJS - Service com Injeção de Dependências e Eventos
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, OrderQueryDto } from './dto';
import { InventoryService } from '../inventory/inventory.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService,
    @InjectQueue('order-processing')
    private readonly orderQueue: Queue,
  ) {}

  async create(dto: CreateOrderDto, userId: string): Promise<Order> {
    // Usar QueryRunner para transação
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar e reservar estoque
      await this.inventoryService.reserveItems(dto.items, queryRunner);

      // Calcular total
      const totalAmount = dto.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      // Criar ordem
      const order = queryRunner.manager.create(Order, {
        userId,
        items: dto.items,
        totalAmount,
        status: OrderStatus.PENDING,
        shippingAddress: dto.shippingAddress,
      });

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      // Emitir evento (fora da transação)
      this.eventEmitter.emit('order.created', {
        orderId: savedOrder.id,
        userId,
        amount: totalAmount,
      });

      // Agendar processamento assíncrono
      await this.orderQueue.add('process-payment', {
        orderId: savedOrder.id,
        paymentMethod: dto.paymentMethod,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });

      return savedOrder;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: OrderQueryDto, user: User) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.userId = :userId', { userId: user.id });

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('order.createdAt BETWEEN :start AND :end', {
        start: query.startDate,
        end: query.endDate,
      });
    }

    if (query.minAmount) {
      qb.andWhere('order.totalAmount >= :min', { min: query.minAmount });
    }

    return qb
      .orderBy('order.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();
  }

  async findOne(id: string, user: User): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id, userId: user.id },
      relations: ['items', 'items.product', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(\`Order \${id} not found\`);
    }

    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepository.findOneBy({ id });
    
    if (!order) {
      throw new NotFoundException(\`Order \${id} not found\`);
    }

    // Validar transição de status
    if (!this.isValidTransition(order.status, status)) {
      throw new ConflictException(
        \`Cannot transition from \${order.status} to \${status}\`
      );
    }

    order.status = status;
    order.updatedAt = new Date();

    const updated = await this.orderRepository.save(order);

    this.eventEmitter.emit('order.statusChanged', {
      orderId: id,
      oldStatus: order.status,
      newStatus: status,
    });

    return updated;
  }

  private isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };
    return transitions[from]?.includes(to) ?? false;
  }
}`;

const nestJsDto = `// NestJS - DTOs com class-validator e class-transformer
import { 
  IsString, IsNumber, IsUUID, IsEnum, IsOptional,
  IsArray, ValidateNested, IsPositive, Min, Max,
  IsDateString, IsNotEmpty, Length, Matches,
  ArrayMinSize, ArrayMaxSize
} from 'class-validator';
import { Type, Transform, Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class OrderItemDto {
  @ApiProperty({ example: 'prod-123' })
  @IsUUID()
  productId: string;

  @ApiProperty({ minimum: 1, maximum: 100 })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100)
  quantity: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;
}

export class AddressDto {
  @IsString()
  @Length(5, 200)
  street: string;

  @IsString()
  @Length(1, 100)
  city: string;

  @IsString()
  @Length(2, 50)
  state: string;

  @IsString()
  @Matches(/^\\d{5}-?\\d{3}$/, { message: 'Invalid ZIP code format' })
  @Transform(({ value }) => value.replace('-', ''))
  zipCode: string;

  @IsOptional()
  @IsString()
  complement?: string;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({ enum: ['credit_card', 'pix', 'boleto'] })
  @IsEnum(['credit_card', 'pix', 'boleto'])
  paymentMethod: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 500)
  notes?: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}

export class OrderQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  minAmount?: number;
}

// Response DTO com transformação
export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  status: OrderStatus;

  @Expose()
  totalAmount: number;

  @Expose()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @Expose()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  deletedAt: Date;

  @Expose()
  get formattedTotal(): string {
    return \`R$ \${this.totalAmount.toFixed(2)}\`;
  }
}`;

const prismaPatterns = `// Prisma ORM - Advanced Patterns
import { PrismaClient, Prisma, OrderStatus } from '@prisma/client';

// Singleton pattern com logging
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Event logging para debugging
prisma.$on('query', (e) => {
  console.log(\`Query: \${e.query}\`);
  console.log(\`Duration: \${e.duration}ms\`);
});

// Repository Pattern com Prisma
export class OrderRepository {
  // 1. Transação com múltiplas operações
  async createOrderWithItems(data: CreateOrderData): Promise<Order> {
    return prisma.$transaction(async (tx) => {
      // Verificar estoque
      for (const item of data.items) {
        const product = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
        });

        if (product.stock < item.quantity) {
          throw new Error(\`Insufficient stock for \${product.name}\`);
        }

        // Atualizar estoque
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Criar ordem com items
      return tx.order.create({
        data: {
          userId: data.userId,
          status: OrderStatus.PENDING,
          totalAmount: data.totalAmount,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.price,
            })),
          },
          shippingAddress: {
            create: data.shippingAddress,
          },
        },
        include: {
          items: { include: { product: true } },
          shippingAddress: true,
        },
      });
    }, {
      maxWait: 5000,
      timeout: 10000,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  // 2. Query Builder com filtros dinâmicos
  async findWithFilters(filters: OrderFilters): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = {
      userId: filters.userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.startDate && filters.endDate && {
        createdAt: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      }),
      ...(filters.minAmount && {
        totalAmount: { gte: filters.minAmount },
      }),
      ...(filters.search && {
        OR: [
          { id: { contains: filters.search, mode: 'insensitive' } },
          { items: { some: { product: { name: { contains: filters.search, mode: 'insensitive' } } } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  // 3. Aggregations e Analytics
  async getOrderStats(userId: string, period: 'day' | 'week' | 'month') {
    const startDate = this.getStartDate(period);

    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: { id: true },
      _sum: { totalAmount: true },
      _avg: { totalAmount: true },
    });

    const dailyStats = await prisma.$queryRaw<DailyStat[]>\`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*)::int as order_count,
        SUM(total_amount)::decimal as total_revenue
      FROM orders
      WHERE user_id = \${userId}
        AND created_at >= \${startDate}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    \`;

    return { stats, dailyStats };
  }

  // 4. Upsert pattern
  async upsertCustomer(data: CustomerData) {
    return prisma.customer.upsert({
      where: { email: data.email },
      update: {
        name: data.name,
        phone: data.phone,
        updatedAt: new Date(),
      },
      create: {
        email: data.email,
        name: data.name,
        phone: data.phone,
      },
    });
  }

  // 5. Soft delete pattern
  async softDelete(id: string) {
    return prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // 6. Cursor-based pagination
  async findWithCursor(userId: string, cursor?: string, limit = 20) {
    return prisma.order.findMany({
      where: { userId, deletedAt: null },
      take: limit + 1, // Fetch extra to check hasMore
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }
}`;

const expressMiddleware = `// Express - Middleware Patterns Avançados
import { Request, Response, NextFunction } from 'express';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import { verify } from 'jsonwebtoken';
import { z, ZodSchema } from 'zod';
import { logger } from './logger';

// 1. Rate Limiter com Redis
const redisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl',
  points: 100, // Requests
  duration: 60, // Per 60 seconds
});

export const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const key = req.ip || req.headers['x-forwarded-for'] as string;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: Math.ceil((error as any).msBeforeNext / 1000),
    });
  }
};

// 2. JWT Authentication com refresh
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = verify(token, process.env.JWT_SECRET!) as TokenPayload;

    // Verificar se token foi revogado
    const isRevoked = await redisClient.get(\`revoked:\${decoded.jti}\`);
    if (isRevoked) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 3. Request Validation com Zod
export const validate = <T>(schema: ZodSchema<T>, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync(req[source]);
      req[source] = result;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            code: e.code,
          })),
        });
      }
      next(error);
    }
  };
};

// 4. Request/Response Logging
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId as string;
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info({
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: req.user?.id,
    });

    // Alertar para requests lentos
    if (duration > 5000) {
      logger.warn({
        requestId,
        message: 'Slow request detected',
        duration,
        path: req.path,
      });
    }
  });

  next();
};

// 5. Error Handler Global
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.requestId;

  // Log do erro
  logger.error({
    requestId,
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    userId: req.user?.id,
  });

  // Erros conhecidos
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      requestId,
    });
  }

  if (error.name === 'PrismaClientKnownRequestError') {
    if ((error as any).code === 'P2002') {
      return res.status(409).json({
        error: 'Resource already exists',
        requestId,
      });
    }
  }

  // Erro desconhecido - não expor detalhes
  res.status(500).json({
    error: 'Internal server error',
    requestId,
  });
};

// 6. CORS Dinâmico
export const corsMiddleware = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Request-Id');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  };
};

// 7. Cache Middleware
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = \`cache:\${req.originalUrl}\`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // Interceptar resposta
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      redisClient.setex(cacheKey, ttl, JSON.stringify(body));
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};`;

const asyncPatterns = `// Node.js - Async Patterns & Error Handling
import { EventEmitter } from 'events';

// 1. Async Queue com concurrency control
class AsyncQueue<T> {
  private queue: (() => Promise<T>)[] = [];
  private running = 0;
  private results: T[] = [];

  constructor(private concurrency: number = 5) {}

  async add(task: () => Promise<T>): Promise<void> {
    this.queue.push(task);
    await this.process();
  }

  async addAll(tasks: (() => Promise<T>)[]): Promise<T[]> {
    this.queue.push(...tasks);
    await this.drain();
    return this.results;
  }

  private async process(): Promise<void> {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.running++;
      
      try {
        const result = await task();
        this.results.push(result);
      } finally {
        this.running--;
        await this.process();
      }
    }
  }

  private async drain(): Promise<void> {
    await Promise.all(
      Array(Math.min(this.concurrency, this.queue.length))
        .fill(null)
        .map(() => this.process())
    );
  }
}

// 2. Retry com exponential backoff
async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoffFactor?: number;
    maxDelay?: number;
    retryOn?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffFactor = 2,
    maxDelay = 30000,
    retryOn = () => true,
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !retryOn(lastError)) {
        throw lastError;
      }

      console.log(\`Attempt \${attempt} failed, retrying in \${currentDelay}ms...\`);
      await sleep(currentDelay);
      
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

// 3. Circuit Breaker Pattern
enum CircuitState { CLOSED, OPEN, HALF_OPEN }

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailure?: Date;
  private successCount = 0;

  constructor(
    private threshold: number = 5,
    private timeout: number = 30000,
    private halfOpenSuccesses: number = 3
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailure!.getTime() > this.timeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccesses) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
      }
    } else {
      this.failures = 0;
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
    
    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
  }
}

// 4. Debounce e Throttle
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return (...args: Parameters<T>) => {
    if (pendingPromise) {
      clearTimeout(timeoutId);
    }

    pendingPromise = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn(...args));
        pendingPromise = null;
      }, delay);
    });

    return pendingPromise;
  };
}

function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let inThrottle = false;
  let lastResult: ReturnType<T>;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      lastResult = fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      return lastResult;
    }
  };
}

// 5. Event-driven com typed EventEmitter
interface OrderEvents {
  'order:created': (order: Order) => void;
  'order:updated': (order: Order, changes: Partial<Order>) => void;
  'order:cancelled': (orderId: string, reason: string) => void;
}

class TypedEventEmitter<T extends Record<string, (...args: any[]) => void>> {
  private emitter = new EventEmitter();

  on<K extends keyof T>(event: K, listener: T[K]): void {
    this.emitter.on(event as string, listener);
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    this.emitter.emit(event as string, ...args);
  }

  off<K extends keyof T>(event: K, listener: T[K]): void {
    this.emitter.off(event as string, listener);
  }
}

const orderEmitter = new TypedEventEmitter<OrderEvents>();

// Uso tipado
orderEmitter.on('order:created', (order) => {
  console.log(\`Order \${order.id} created\`);
});

orderEmitter.emit('order:created', { id: '123', status: 'pending' });

// 6. Batch processor
async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));`;

const categories = [
  {
    id: "nestjs",
    title: "NestJS Framework",
    badge: "Framework",
    examples: [
      { title: "Controller com Decorators", code: nestJsController, filename: "order.controller.ts" },
      { title: "Service com Transactions", code: nestJsService, filename: "order.service.ts" },
      { title: "DTOs e Validação", code: nestJsDto, filename: "order.dto.ts" },
    ]
  },
  {
    id: "prisma",
    title: "Prisma ORM",
    badge: "ORM",
    examples: [
      { title: "Repository Patterns", code: prismaPatterns, filename: "order.repository.ts" },
    ]
  },
  {
    id: "express",
    title: "Express Middleware",
    badge: "Core",
    examples: [
      { title: "Advanced Middleware", code: expressMiddleware, filename: "middleware.ts" },
    ]
  },
  {
    id: "async",
    title: "Async Patterns",
    badge: "Patterns",
    examples: [
      { title: "Queue, Retry, Circuit Breaker", code: asyncPatterns, filename: "async-patterns.ts" },
    ]
  },
];

const NodeExamples = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-[hsl(var(--terminal-green))]/10 text-[hsl(var(--terminal-green))] border-[hsl(var(--terminal-green))]/30">
                  {category.badge}
                </Badge>
                <span className="font-mono text-sm">{category.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {category.examples.map((example, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{example.title}</h4>
                  <CodeBlock 
                    code={example.code} 
                    language="typescript" 
                    filename={example.filename}
                    collapsible
                    defaultExpanded={idx === 0}
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default NodeExamples;
