import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from "./CodeBlock";

const javaMicroserviceCode = `@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final RabbitTemplate rabbitTemplate;

    // Constructor Injection - Best Practice
    public OrderController(OrderService orderService, 
                          RabbitTemplate rabbitTemplate) {
        this.orderService = orderService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request) {
        
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
}`;

const nodeMicroserviceCode = `import { Router } from 'express';
import { validateRequest } from './middleware/validation';
import { OrderService } from './services/OrderService';
import { MessageBroker } from './messaging/MessageBroker';
import { logger } from './utils/logger';

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

export default router;`;

const BestPracticesSection = () => {
  return (
    <section id="best-practices" className="py-20 px-4 bg-secondary/30">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Best Practices
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Clean code patterns for microservices architecture with event-driven design.
          </p>
        </div>

        <Tabs defaultValue="java" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6">
            <TabsTrigger 
              value="java" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java / Spring Boot
            </TabsTrigger>
            <TabsTrigger 
              value="nodejs" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js / Express
            </TabsTrigger>
          </TabsList>

          <TabsContent value="java" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  RESTful Controller with RabbitMQ Integration
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Constructor injection for testability</li>
                  <li>Validation with @Valid annotation</li>
                  <li>Async event publishing for loose coupling</li>
                  <li>Proper HTTP status codes</li>
                </ul>
              </div>
              <CodeBlock 
                code={javaMicroserviceCode} 
                language="java" 
                filename="OrderController.java" 
              />
            </div>
          </TabsContent>

          <TabsContent value="nodejs" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-primary font-mono">
                  Express Router with Message Broker
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Middleware-based validation</li>
                  <li>Structured error handling with next()</li>
                  <li>Structured logging with context</li>
                  <li>Async/await for clean async code</li>
                </ul>
              </div>
              <CodeBlock 
                code={nodeMicroserviceCode} 
                language="typescript" 
                filename="orders.router.ts" 
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default BestPracticesSection;
