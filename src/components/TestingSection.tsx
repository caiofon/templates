import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Layers, Zap, CheckCircle } from "lucide-react";
import CodeBlock from "./CodeBlock";

const javaUnitTestCode = `// ============================================
// Java Unit Tests with JUnit 5 + Mockito
// Best practices for microservice testing
// ============================================

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    
    @Mock
    private RabbitTemplate rabbitTemplate;
    
    @Mock
    private CustomerClient customerClient;
    
    @InjectMocks
    private OrderService orderService;
    
    @Captor
    private ArgumentCaptor<OrderCreatedEvent> eventCaptor;

    @Nested
    @DisplayName("Create Order")
    class CreateOrderTests {
        
        @Test
        @DisplayName("should create order and publish event")
        void shouldCreateOrderAndPublishEvent() {
            // Given
            OrderRequest request = OrderRequest.builder()
                .customerId(UUID.randomUUID())
                .items(List.of(
                    new OrderItem("SKU-001", 2, BigDecimal.valueOf(99.99))
                ))
                .build();
            
            Customer customer = new Customer("John Doe", "john@example.com");
            when(customerClient.getCustomer(request.getCustomerId()))
                .thenReturn(customer);
            
            when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> {
                    Order order = invocation.getArgument(0);
                    order.setId(UUID.randomUUID());
                    return order;
                });
            
            // When
            Order result = orderService.createOrder(request);
            
            // Then
            assertThat(result)
                .isNotNull()
                .satisfies(order -> {
                    assertThat(order.getId()).isNotNull();
                    assertThat(order.getStatus()).isEqualTo(OrderStatus.PENDING);
                    assertThat(order.getTotalAmount())
                        .isEqualByComparingTo(BigDecimal.valueOf(199.98));
                });
            
            // Verify event published
            verify(rabbitTemplate).convertAndSend(
                eq("orders.exchange"),
                eq("order.created"),
                eventCaptor.capture()
            );
            
            OrderCreatedEvent event = eventCaptor.getValue();
            assertThat(event.getOrderId()).isEqualTo(result.getId());
            assertThat(event.getCustomerEmail()).isEqualTo("john@example.com");
        }
        
        @Test
        @DisplayName("should throw exception when customer not found")
        void shouldThrowExceptionWhenCustomerNotFound() {
            // Given
            OrderRequest request = OrderRequest.builder()
                .customerId(UUID.randomUUID())
                .build();
            
            when(customerClient.getCustomer(request.getCustomerId()))
                .thenThrow(new CustomerNotFoundException(request.getCustomerId()));
            
            // When / Then
            assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(CustomerNotFoundException.class)
                .hasMessageContaining(request.getCustomerId().toString());
            
            verify(orderRepository, never()).save(any());
            verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any());
        }
        
        @ParameterizedTest
        @MethodSource("invalidOrderRequests")
        @DisplayName("should reject invalid order requests")
        void shouldRejectInvalidOrderRequests(OrderRequest request, String expectedError) {
            // When / Then
            assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining(expectedError);
        }
        
        static Stream<Arguments> invalidOrderRequests() {
            return Stream.of(
                Arguments.of(
                    OrderRequest.builder().customerId(null).build(),
                    "Customer ID is required"
                ),
                Arguments.of(
                    OrderRequest.builder().customerId(UUID.randomUUID()).items(List.of()).build(),
                    "At least one item is required"
                )
            );
        }
    }
}

// ============================================
// Repository Test with Testcontainers
// ============================================

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class OrderRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
        .withDatabaseName("orders_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private OrderRepository orderRepository;

    @Test
    @DisplayName("should find orders by customer with pagination")
    void shouldFindOrdersByCustomerWithPagination() {
        // Given
        UUID customerId = UUID.randomUUID();
        List<Order> orders = IntStream.range(0, 25)
            .mapToObj(i -> createOrder(customerId, OrderStatus.COMPLETED))
            .toList();
        orderRepository.saveAll(orders);

        // When
        Page<Order> result = orderRepository.findByCustomerId(
            customerId, 
            PageRequest.of(0, 10, Sort.by("createdAt").descending())
        );

        // Then
        assertThat(result)
            .hasSize(10)
            .first()
            .extracting(Order::getCreatedAt)
            .isNotNull();
        
        assertThat(result.getTotalElements()).isEqualTo(25);
        assertThat(result.getTotalPages()).isEqualTo(3);
    }
}`;

const javaIntegrationTestCode = `// ============================================
// Spring Boot Integration Tests
// End-to-end API testing with real dependencies
// ============================================

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");

    @Container
    static RabbitMQContainer rabbitmq = new RabbitMQContainer("rabbitmq:3-management-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.rabbitmq.host", rabbitmq::getHost);
        registry.add("spring.rabbitmq.port", rabbitmq::getAmqpPort);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @MockBean
    private CustomerClient customerClient;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/orders - should create order successfully")
    void shouldCreateOrderSuccessfully() throws Exception {
        // Given
        UUID customerId = UUID.randomUUID();
        OrderRequest request = OrderRequest.builder()
            .customerId(customerId)
            .items(List.of(new OrderItem("SKU-001", 2, BigDecimal.valueOf(50.00))))
            .build();

        when(customerClient.getCustomer(customerId))
            .thenReturn(new Customer("John Doe", "john@example.com"));

        // When / Then
        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.totalAmount").value(100.00))
            .andExpect(jsonPath("$.items", hasSize(1)));

        // Verify persisted
        assertThat(orderRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("GET /api/orders/{id} - should return 404 for non-existent order")
    void shouldReturn404ForNonExistentOrder() throws Exception {
        mockMvc.perform(get("/api/orders/{id}", UUID.randomUUID()))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.error").value("Order not found"))
            .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("POST /api/orders - should return 400 for invalid request")
    void shouldReturn400ForInvalidRequest() throws Exception {
        OrderRequest invalidRequest = OrderRequest.builder()
            .customerId(null)  // Required field
            .items(List.of())  // Empty items
            .build();

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors", hasSize(2)))
            .andExpect(jsonPath("$.errors[*].field", 
                containsInAnyOrder("customerId", "items")));
    }
}`;

const nodeUnitTestCode = `// ============================================
// Node.js Unit Tests with Jest + Testing Library
// Comprehensive testing patterns
// ============================================

import { OrderService } from '../services/OrderService';
import { OrderRepository } from '../repositories/OrderRepository';
import { MessageBroker } from '../messaging/MessageBroker';
import { CustomerClient } from '../clients/CustomerClient';
import { OrderStatus } from '../types';

// Mock dependencies
jest.mock('../repositories/OrderRepository');
jest.mock('../messaging/MessageBroker');
jest.mock('../clients/CustomerClient');

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepository: jest.Mocked<OrderRepository>;
  let mockMessageBroker: jest.Mocked<MessageBroker>;
  let mockCustomerClient: jest.Mocked<CustomerClient>;

  beforeEach(() => {
    mockOrderRepository = new OrderRepository() as jest.Mocked<OrderRepository>;
    mockMessageBroker = new MessageBroker() as jest.Mocked<MessageBroker>;
    mockCustomerClient = new CustomerClient() as jest.Mocked<CustomerClient>;
    
    orderService = new OrderService(
      mockOrderRepository,
      mockMessageBroker,
      mockCustomerClient
    );
    
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const validRequest = {
      customerId: 'cust-123',
      items: [
        { sku: 'SKU-001', quantity: 2, price: 99.99 }
      ]
    };

    it('should create order and publish event', async () => {
      // Arrange
      const customer = { id: 'cust-123', name: 'John', email: 'john@test.com' };
      mockCustomerClient.getCustomer.mockResolvedValue(customer);
      
      const savedOrder = {
        id: 'order-456',
        ...validRequest,
        status: OrderStatus.PENDING,
        totalAmount: 199.98,
        createdAt: new Date()
      };
      mockOrderRepository.create.mockResolvedValue(savedOrder);
      mockMessageBroker.publish.mockResolvedValue(undefined);

      // Act
      const result = await orderService.createOrder(validRequest);

      // Assert
      expect(result).toEqual(savedOrder);
      expect(mockCustomerClient.getCustomer).toHaveBeenCalledWith('cust-123');
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'cust-123',
          status: OrderStatus.PENDING,
          totalAmount: 199.98
        })
      );
      expect(mockMessageBroker.publish).toHaveBeenCalledWith(
        'orders.exchange',
        expect.objectContaining({
          routingKey: 'order.created',
          payload: expect.objectContaining({ orderId: 'order-456' })
        })
      );
    });

    it('should throw error when customer not found', async () => {
      // Arrange
      mockCustomerClient.getCustomer.mockRejectedValue(
        new Error('Customer not found')
      );

      // Act & Assert
      await expect(orderService.createOrder(validRequest))
        .rejects.toThrow('Customer not found');
      
      expect(mockOrderRepository.create).not.toHaveBeenCalled();
      expect(mockMessageBroker.publish).not.toHaveBeenCalled();
    });

    it.each([
      [{ customerId: '', items: [] }, 'Customer ID is required'],
      [{ customerId: 'cust-1', items: [] }, 'At least one item required'],
      [{ customerId: 'cust-1', items: [{ sku: '', quantity: 0, price: -1 }] }, 'Invalid item']
    ])('should validate request: %j', async (invalidRequest, expectedError) => {
      await expect(orderService.createOrder(invalidRequest as any))
        .rejects.toThrow(expectedError);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const order = { id: 'order-123', status: OrderStatus.COMPLETED };
      mockOrderRepository.findById.mockResolvedValue(order);

      const result = await orderService.getOrderById('order-123');

      expect(result).toEqual(order);
      expect(mockOrderRepository.findById).toHaveBeenCalledWith('order-123');
    });

    it('should return null when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      const result = await orderService.getOrderById('non-existent');

      expect(result).toBeNull();
    });
  });
});`;

const nodeIntegrationTestCode = `// ============================================
// Node.js Integration Tests with Supertest
// API testing with real database
// ============================================

import request from 'supertest';
import { app } from '../app';
import { prisma } from '../lib/prisma';
import { createTestContainer } from '../test/testcontainers';

describe('Orders API Integration', () => {
  let postgresContainer: StartedPostgreSqlContainer;
  let rabbitmqContainer: StartedRabbitMQContainer;

  beforeAll(async () => {
    // Start test containers
    const containers = await createTestContainer();
    postgresContainer = containers.postgres;
    rabbitmqContainer = containers.rabbitmq;

    // Run migrations
    await prisma.$executeRaw\`SELECT 1\`;
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await postgresContainer.stop();
    await rabbitmqContainer.stop();
  });

  beforeEach(async () => {
    // Clean database
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
  });

  describe('POST /api/orders', () => {
    it('should create order successfully', async () => {
      // Create test customer
      const customer = await prisma.customer.create({
        data: { name: 'John Doe', email: 'john@test.com' }
      });

      const orderData = {
        customerId: customer.id,
        items: [
          { sku: 'SKU-001', quantity: 2, price: 50.00 }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        customerId: customer.id,
        status: 'PENDING',
        totalAmount: 100.00,
        items: expect.arrayContaining([
          expect.objectContaining({ sku: 'SKU-001', quantity: 2 })
        ])
      });

      // Verify in database
      const savedOrder = await prisma.order.findUnique({
        where: { id: response.body.id },
        include: { items: true }
      });
      expect(savedOrder).not.toBeNull();
      expect(savedOrder?.items).toHaveLength(1);
    });

    it('should return 400 for invalid request', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({ customerId: '', items: [] })
        .expect(400);

      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'customerId' })
      );
    });

    it('should return 404 when customer not found', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customerId: 'non-existent-id',
          items: [{ sku: 'SKU-001', quantity: 1, price: 10 }]
        })
        .expect(404);

      expect(response.body.error).toBe('Customer not found');
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should return order by id', async () => {
      const customer = await prisma.customer.create({
        data: { name: 'Jane Doe', email: 'jane@test.com' }
      });

      const order = await prisma.order.create({
        data: {
          customerId: customer.id,
          status: 'COMPLETED',
          totalAmount: 150.00,
          items: {
            create: [{ sku: 'SKU-002', quantity: 3, price: 50.00 }]
          }
        },
        include: { items: true }
      });

      const response = await request(app)
        .get(\`/api/orders/\${order.id}\`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: order.id,
        status: 'COMPLETED',
        totalAmount: 150.00
      });
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get('/api/orders/non-existent-id')
        .expect(404);
    });
  });

  describe('Rate Limiting', () => {
    it('should limit requests to 100 per minute', async () => {
      const requests = Array(101).fill(null).map(() =>
        request(app).get('/api/orders').set('X-Forwarded-For', '192.168.1.1')
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });
});`;

const TestingSection = () => {
  return (
    <section id="testing" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> Testing Strategies
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive testing patterns for Java and Node.js microservices with Testcontainers.
          </p>
        </div>

        {/* Testing pyramid */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Unit Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Isolated testing with mocks, fast feedback, high coverage
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-terminal-yellow" />
                Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Real database with Testcontainers, API endpoint testing
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-terminal-orange" />
                Contract
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Pact/Spring Cloud Contract for API contracts
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                E2E
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Full system tests with Docker Compose
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="java-unit" className="w-full">
          <TabsList className="bg-secondary border border-border mb-6 flex-wrap h-auto">
            <TabsTrigger 
              value="java-unit" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java Unit
            </TabsTrigger>
            <TabsTrigger 
              value="java-integration" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Java Integration
            </TabsTrigger>
            <TabsTrigger 
              value="node-unit" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js Unit
            </TabsTrigger>
            <TabsTrigger 
              value="node-integration" 
              className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Node.js Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="java-unit" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                JUnit 5 + Mockito Unit Tests
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>@Nested classes for organized test structure</li>
                <li>ArgumentCaptor for verifying published events</li>
                <li>@ParameterizedTest for data-driven tests</li>
                <li>Testcontainers for repository tests</li>
              </ul>
            </div>
            <CodeBlock 
              code={javaUnitTestCode} 
              language="java" 
              filename="OrderServiceTest.java" 
            />
          </TabsContent>

          <TabsContent value="java-integration" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Spring Boot Integration Tests
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>MockMvc for API endpoint testing</li>
                <li>Testcontainers for PostgreSQL and RabbitMQ</li>
                <li>@DynamicPropertySource for container configuration</li>
                <li>JSON path assertions for response validation</li>
              </ul>
            </div>
            <CodeBlock 
              code={javaIntegrationTestCode} 
              language="java" 
              filename="OrderControllerIntegrationTest.java" 
            />
          </TabsContent>

          <TabsContent value="node-unit" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Jest Unit Tests with Mocks
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>jest.mock() for dependency isolation</li>
                <li>describe/it blocks for clear test structure</li>
                <li>it.each() for parameterized tests</li>
                <li>expect assertions with matchers</li>
              </ul>
            </div>
            <CodeBlock 
              code={nodeUnitTestCode} 
              language="typescript" 
              filename="OrderService.test.ts" 
            />
          </TabsContent>

          <TabsContent value="node-integration" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-primary font-mono">
                Supertest API Integration Tests
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Supertest for HTTP request testing</li>
                <li>Testcontainers for real PostgreSQL/RabbitMQ</li>
                <li>Prisma for database operations</li>
                <li>Rate limiting verification</li>
              </ul>
            </div>
            <CodeBlock 
              code={nodeIntegrationTestCode} 
              language="typescript" 
              filename="orders.integration.test.ts" 
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default TestingSection;
