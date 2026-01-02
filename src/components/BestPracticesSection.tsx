import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from "./CodeBlock";

const javaMicroserviceCode = `@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final RabbitTemplate rabbitTemplate;

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request) {
        
        log.info("Creating order for customer: {}", request.getCustomerId());
        
        Order order = orderService.create(request);
        
        // Publish event asynchronously
        rabbitTemplate.convertAndSend(
            "orders.exchange",
            "order.created",
            new OrderCreatedEvent(order)
        );
        
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(OrderMapper.toResponse(order));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable UUID orderId) {
        return orderService.findById(orderId)
            .map(OrderMapper::toResponse)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        orderService.updateStatus(orderId, status);
        return ResponseEntity.noContent().build();
    }
}`;

const javaServiceCode = `@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerService customerService;
    private final MeterRegistry meterRegistry;

    public Order create(OrderRequest request) {
        // Validate customer exists
        Customer customer = customerService
            .findById(request.getCustomerId())
            .orElseThrow(() -> new CustomerNotFoundException(
                request.getCustomerId()));
        
        // Build order entity
        Order order = Order.builder()
            .customerId(customer.getId())
            .items(mapItems(request.getItems()))
            .status(OrderStatus.PENDING)
            .totalAmount(calculateTotal(request.getItems()))
            .build();
        
        Order saved = orderRepository.save(order);
        
        // Increment metrics
        meterRegistry.counter("orders.created", 
            "customer_type", customer.getType().name())
            .increment();
        
        log.info("Order {} created successfully", saved.getId());
        return saved;
    }

    @Transactional(readOnly = true)
    public Optional<Order> findById(UUID orderId) {
        return orderRepository.findById(orderId);
    }

    public void updateStatus(UUID orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        order.setStatus(status);
        order.setUpdatedAt(Instant.now());
        
        orderRepository.save(order);
        
        log.info("Order {} status updated to {}", orderId, status);
    }
    
    private List<OrderItem> mapItems(List<OrderItemRequest> items) {
        return items.stream()
            .map(item -> OrderItem.builder()
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .build())
            .toList();
    }
    
    private BigDecimal calculateTotal(List<OrderItemRequest> items) {
        return items.stream()
            .map(i -> i.getUnitPrice().multiply(
                BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}`;

const javaRepositoryCode = `@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("""
        SELECT o FROM Order o
        JOIN FETCH o.items
        WHERE o.customerId = :customerId
        ORDER BY o.createdAt DESC
        """)
    List<Order> findByCustomerId(@Param("customerId") UUID customerId);

    @Query("""
        SELECT o FROM Order o
        WHERE o.status = :status
        AND o.createdAt >= :since
        ORDER BY o.createdAt ASC
        """)
    Page<Order> findByStatusSince(
        @Param("status") OrderStatus status,
        @Param("since") Instant since,
        Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Order o
        SET o.status = :status, o.updatedAt = CURRENT_TIMESTAMP
        WHERE o.id IN :ids
        """)
    int bulkUpdateStatus(
        @Param("ids") List<UUID> ids,
        @Param("status") OrderStatus status);

    @Query(value = """
        SELECT DATE_TRUNC('day', created_at) as day,
               COUNT(*) as order_count,
               SUM(total_amount) as total_sales
        FROM orders
        WHERE created_at >= :since
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY day DESC
        """, nativeQuery = true)
    List<DailySalesProjection> getDailySalesReport(
        @Param("since") Instant since);
}`;

const nodeMicroserviceCode = `import { Router } from 'express';
import { validateRequest } from './middleware/validation';
import { OrderService } from './services/OrderService';
import { MessageBroker } from './messaging/MessageBroker';
import { logger } from './utils/logger';
import { OrderSchema, OrderStatusSchema } from './schemas/order';

const router = Router();

// Dependency injection pattern
const orderService = new OrderService();
const messageBroker = new MessageBroker();

router.post('/orders', 
  validateRequest(OrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.create(req.body);
      
      // Publish event asynchronously
      await messageBroker.publish('orders.exchange', {
        routingKey: 'order.created',
        payload: { orderId: order.id, ...order }
      });
      
      logger.info({ orderId: order.id }, 'Order created');
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/orders/:orderId',
  async (req, res, next) => {
    try {
      const order = await orderService.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/orders/:orderId/status',
  validateRequest(OrderStatusSchema),
  async (req, res, next) => {
    try {
      await orderService.updateStatus(
        req.params.orderId, 
        req.body.status
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;`;

const nodeServiceCode = `import { db } from '../database/connection';
import { Order, OrderStatus, CreateOrderDTO } from '../types/order';
import { CustomerService } from './CustomerService';
import { logger } from '../utils/logger';
import { metrics } from '../monitoring/metrics';
import { NotFoundError, ValidationError } from '../errors';

export class OrderService {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async create(data: CreateOrderDTO): Promise<Order> {
    // Validate customer exists
    const customer = await this.customerService.findById(data.customerId);
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Calculate total
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity, 
      0
    );

    // Start transaction
    const order = await db.transaction(async (trx) => {
      const [order] = await trx('orders')
        .insert({
          customer_id: data.customerId,
          total_amount: totalAmount,
          status: OrderStatus.PENDING,
          created_at: new Date(),
        })
        .returning('*');

      // Insert order items
      await trx('order_items').insert(
        data.items.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
        }))
      );

      return order;
    });

    // Track metrics
    metrics.ordersCreated.inc({ customer_type: customer.type });

    logger.info({ orderId: order.id }, 'Order created successfully');
    return this.mapToOrder(order);
  }

  async findById(orderId: string): Promise<Order | null> {
    const order = await db('orders')
      .where('id', orderId)
      .first();
    
    return order ? this.mapToOrder(order) : null;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const updated = await db('orders')
      .where('id', orderId)
      .update({ 
        status, 
        updated_at: new Date() 
      });

    if (!updated) {
      throw new NotFoundError('Order not found');
    }

    logger.info({ orderId, status }, 'Order status updated');
  }

  private mapToOrder(row: any): Order {
    return {
      id: row.id,
      customerId: row.customer_id,
      totalAmount: parseFloat(row.total_amount),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}`;

const nodeMiddlewareCode = `import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';
import { AppError, NotFoundError, ValidationError } from '../errors';

// Request validation middleware
export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };
}

// Error handling middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error with request context
  logger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    requestId: req.headers['x-request-id'],
  }, 'Request error');

  // Handle known errors
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({ 
      error: error.message,
      details: error.details,
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ 
      error: error.message 
    });
  }

  // Unknown error - don't leak details
  res.status(500).json({ 
    error: 'Internal server error' 
  });
}

// Request logging middleware
export function requestLogger(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      requestId: req.headers['x-request-id'],
    }, 'Request completed');
  });
  
  next();
}`;

const BestPracticesSection = () => {
  return (
    <section id="best-practices" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Best Practices
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Clean code patterns for microservices architecture with event-driven design, layered architecture, and SOLID principles.
          </p>
        </div>

        <Tabs defaultValue="java-controller" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto">
            <TabsTrigger 
              value="java-controller" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java Controller
            </TabsTrigger>
            <TabsTrigger 
              value="java-service" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java Service
            </TabsTrigger>
            <TabsTrigger 
              value="java-repository" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java Repository
            </TabsTrigger>
            <TabsTrigger 
              value="node-router" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js Router
            </TabsTrigger>
            <TabsTrigger 
              value="node-service" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js Service
            </TabsTrigger>
            <TabsTrigger 
              value="node-middleware" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js Middleware
            </TabsTrigger>
          </TabsList>

          <TabsContent value="java-controller" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  RESTful Controller with RabbitMQ Integration
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>@RequiredArgsConstructor for constructor injection (Lombok)</li>
                  <li>@Slf4j for structured logging</li>
                  <li>Async event publishing with RabbitTemplate</li>
                  <li>Proper HTTP status codes (201, 204, 404)</li>
                </ul>
              </div>
              <CodeBlock 
                code={javaMicroserviceCode} 
                language="java" 
                filename="OrderController.java" 
              />
            </div>
          </TabsContent>

          <TabsContent value="java-service" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  Service Layer with Transaction Management
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>@Transactional for database consistency</li>
                  <li>Builder pattern for entity creation</li>
                  <li>Micrometer metrics integration</li>
                  <li>Clean separation of concerns</li>
                </ul>
              </div>
              <CodeBlock 
                code={javaServiceCode} 
                language="java" 
                filename="OrderService.java" 
              />
            </div>
          </TabsContent>

          <TabsContent value="java-repository" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  Spring Data JPA Repository
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>JPQL with JOIN FETCH for N+1 prevention</li>
                  <li>Pagination support with Pageable</li>
                  <li>Bulk updates with @Modifying</li>
                  <li>Native queries for complex aggregations</li>
                </ul>
              </div>
              <CodeBlock 
                code={javaRepositoryCode} 
                language="java" 
                filename="OrderRepository.java" 
              />
            </div>
          </TabsContent>

          <TabsContent value="node-router" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  Express Router with Message Broker
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Middleware-based validation with Zod</li>
                  <li>Structured error handling with next()</li>
                  <li>Async/await for clean async code</li>
                  <li>RESTful resource patterns</li>
                </ul>
              </div>
              <CodeBlock 
                code={nodeMicroserviceCode} 
                language="typescript" 
                filename="orders.router.ts" 
              />
            </div>
          </TabsContent>

          <TabsContent value="node-service" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  Service Layer with Transactions
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Database transactions with Knex.js</li>
                  <li>Custom error classes for domain errors</li>
                  <li>Prometheus metrics integration</li>
                  <li>Data mapping for clean API responses</li>
                </ul>
              </div>
              <CodeBlock 
                code={nodeServiceCode} 
                language="typescript" 
                filename="OrderService.ts" 
              />
            </div>
          </TabsContent>

          <TabsContent value="node-middleware" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  Express Middleware Patterns
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Zod schema validation middleware</li>
                  <li>Centralized error handling</li>
                  <li>Request logging with duration tracking</li>
                  <li>Request ID correlation for tracing</li>
                </ul>
              </div>
              <CodeBlock 
                code={nodeMiddlewareCode} 
                language="typescript" 
                filename="middleware.ts" 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default BestPracticesSection;
