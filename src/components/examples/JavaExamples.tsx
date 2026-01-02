import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

// Java 8 Examples
const java8StreamsExample = `// Java 8 - Stream API & Functional Programming
import java.util.*;
import java.util.stream.*;
import java.util.function.*;

public class Java8StreamPatterns {

    // 1. Collectors com groupingBy e mapping
    public Map<String, List<String>> groupCustomersByCity(List<Customer> customers) {
        return customers.stream()
            .collect(Collectors.groupingBy(
                Customer::getCity,
                Collectors.mapping(Customer::getName, Collectors.toList())
            ));
    }

    // 2. Reduce para cálculos complexos
    public OrderSummary summarizeOrders(List<Order> orders) {
        return orders.stream()
            .reduce(
                new OrderSummary(0, BigDecimal.ZERO, 0),
                (summary, order) -> new OrderSummary(
                    summary.totalOrders() + 1,
                    summary.totalAmount().add(order.getAmount()),
                    summary.totalItems() + order.getItems().size()
                ),
                OrderSummary::merge
            );
    }

    // 3. FlatMap para listas aninhadas
    public List<OrderItem> getAllItems(List<Order> orders) {
        return orders.stream()
            .flatMap(order -> order.getItems().stream())
            .distinct()
            .sorted(Comparator.comparing(OrderItem::getName))
            .collect(Collectors.toList());
    }

    // 4. Parallel Stream para processamento massivo
    public Map<String, DoubleSummaryStatistics> calculateStatsByCategory(List<Product> products) {
        return products.parallelStream()
            .collect(Collectors.groupingByConcurrent(
                Product::getCategory,
                Collectors.summarizingDouble(Product::getPrice)
            ));
    }

    // 5. Custom Collector
    public static <T> Collector<T, ?, List<List<T>>> batchCollector(int batchSize) {
        return Collector.of(
            ArrayList::new,
            (batches, item) -> {
                if (batches.isEmpty() || batches.get(batches.size() - 1).size() >= batchSize) {
                    batches.add(new ArrayList<>());
                }
                batches.get(batches.size() - 1).add(item);
            },
            (left, right) -> { left.addAll(right); return left; }
        );
    }

    // 6. Optional chain com map e flatMap
    public String getCustomerCityName(Order order) {
        return Optional.ofNullable(order)
            .map(Order::getCustomer)
            .map(Customer::getAddress)
            .map(Address::getCity)
            .map(City::getName)
            .orElse("Unknown");
    }

    // 7. Method references avançados
    public List<String> processNames(List<String> names) {
        Function<String, String> normalizer = String::toLowerCase;
        Predicate<String> isValid = ((Predicate<String>) String::isEmpty).negate();
        
        return names.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(isValid)
            .map(normalizer)
            .collect(Collectors.toList());
    }

    // 8. CompletableFuture para async
    public CompletableFuture<OrderResult> processOrderAsync(Order order) {
        return CompletableFuture
            .supplyAsync(() -> validateOrder(order))
            .thenApplyAsync(this::calculatePricing)
            .thenApplyAsync(this::applyDiscounts)
            .thenComposeAsync(this::persistOrder)
            .exceptionally(ex -> OrderResult.failed(ex.getMessage()));
    }
}`;

const java8DateTimeExample = `// Java 8 - Date/Time API Best Practices
import java.time.*;
import java.time.format.*;
import java.time.temporal.*;

public class Java8DateTimePatterns {

    // 1. Formatadores imutáveis e thread-safe
    private static final DateTimeFormatter ISO_FORMATTER = 
        DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    private static final DateTimeFormatter CUSTOM_FORMATTER = 
        DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
            .withZone(ZoneId.of("America/Sao_Paulo"));

    // 2. Cálculos com períodos
    public LocalDate calculateDueDate(LocalDate orderDate, int businessDays) {
        LocalDate dueDate = orderDate;
        int addedDays = 0;
        
        while (addedDays < businessDays) {
            dueDate = dueDate.plusDays(1);
            if (dueDate.getDayOfWeek() != DayOfWeek.SATURDAY && 
                dueDate.getDayOfWeek() != DayOfWeek.SUNDAY) {
                addedDays++;
            }
        }
        return dueDate;
    }

    // 3. Temporal Adjusters customizados
    public static TemporalAdjuster nextBusinessDay() {
        return temporal -> {
            LocalDate date = LocalDate.from(temporal);
            do {
                date = date.plusDays(1);
            } while (date.getDayOfWeek() == DayOfWeek.SATURDAY ||
                     date.getDayOfWeek() == DayOfWeek.SUNDAY);
            return date;
        };
    }

    // 4. Conversão de fusos horários
    public ZonedDateTime convertToTimezone(Instant instant, String targetZone) {
        return instant.atZone(ZoneId.of(targetZone));
    }

    // 5. Período entre datas
    public Duration calculateProcessingTime(Instant start, Instant end) {
        return Duration.between(start, end);
    }

    // 6. Geração de períodos
    public List<LocalDate> getDateRange(LocalDate start, LocalDate end) {
        return start.datesUntil(end.plusDays(1))
            .collect(Collectors.toList());
    }
}`;

// Java 11 Examples
const java11FeaturesExample = `// Java 11 - New Features & Patterns
import java.net.http.*;
import java.net.URI;
import java.util.*;
import java.nio.file.*;

public class Java11Patterns {

    // 1. HTTP Client (novo em Java 11)
    private final HttpClient httpClient = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_2)
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build();

    public CompletableFuture<String> fetchDataAsync(String url) {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Accept", "application/json")
            .header("Authorization", "Bearer " + getToken())
            .timeout(Duration.ofSeconds(30))
            .GET()
            .build();

        return httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
            .thenApply(HttpResponse::body);
    }

    public String postJson(String url, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        HttpResponse<String> response = httpClient.send(
            request, 
            HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() >= 400) {
            throw new ApiException(response.statusCode(), response.body());
        }
        return response.body();
    }

    // 2. Var em lambdas (permite anotações)
    public List<String> processWithAnnotations(List<String> items) {
        return items.stream()
            .map((@NotNull var item) -> item.toUpperCase())
            .filter((@NotNull var item) -> !item.isEmpty())
            .collect(Collectors.toList());
    }

    // 3. String methods novos
    public List<String> processMultilineText(String text) {
        return text.lines()
            .filter(Predicate.not(String::isBlank))
            .map(String::strip)
            .collect(Collectors.toList());
    }

    public String repeatPattern(String pattern, int times) {
        return pattern.repeat(times);
    }

    // 4. Optional.isEmpty()
    public void processOptional(Optional<Order> orderOpt) {
        if (orderOpt.isEmpty()) {
            log.warn("No order found");
            return;
        }
        // Process order
    }

    // 5. Files.readString/writeString
    public String readConfig(Path configPath) throws IOException {
        return Files.readString(configPath, StandardCharsets.UTF_8);
    }

    public void writeConfig(Path configPath, String content) throws IOException {
        Files.writeString(configPath, content, 
            StandardCharsets.UTF_8,
            StandardOpenOption.CREATE,
            StandardOpenOption.TRUNCATE_EXISTING);
    }

    // 6. Collection.toArray com IntFunction
    public String[] toArray(List<String> list) {
        return list.toArray(String[]::new);
    }

    // 7. Pattern Matching preview (preparação para Java 17)
    public String describeObject(Object obj) {
        if (obj instanceof String s) {
            return "String of length " + s.length();
        } else if (obj instanceof Integer i) {
            return "Integer: " + i;
        } else if (obj instanceof List<?> l) {
            return "List with " + l.size() + " elements";
        }
        return "Unknown type";
    }
}`;

// Java 17 Examples
const java17FeaturesExample = `// Java 17 - LTS Features & Modern Patterns
import java.util.*;
import java.util.random.*;

public class Java17Patterns {

    // 1. Sealed Classes - Hierarquia controlada
    public sealed interface PaymentMethod 
        permits CreditCard, DebitCard, Pix, BankTransfer {
        BigDecimal process(BigDecimal amount);
    }

    public final class CreditCard implements PaymentMethod {
        private final String cardNumber;
        private final int installments;

        public CreditCard(String cardNumber, int installments) {
            this.cardNumber = cardNumber;
            this.installments = installments;
        }

        @Override
        public BigDecimal process(BigDecimal amount) {
            // Aplica taxa para parcelamento
            BigDecimal fee = installments > 1 
                ? amount.multiply(BigDecimal.valueOf(0.0299 * installments))
                : BigDecimal.ZERO;
            return amount.add(fee);
        }
    }

    public final class Pix implements PaymentMethod {
        private final String pixKey;

        public Pix(String pixKey) {
            this.pixKey = pixKey;
        }

        @Override
        public BigDecimal process(BigDecimal amount) {
            // Pix sem taxas, desconto de 5%
            return amount.multiply(BigDecimal.valueOf(0.95));
        }
    }

    // 2. Pattern Matching para instanceof
    public String processPayment(PaymentMethod payment) {
        if (payment instanceof CreditCard cc) {
            return "Processing credit card ending in " + 
                   cc.cardNumber.substring(cc.cardNumber.length() - 4);
        } else if (payment instanceof Pix pix) {
            return "Processing Pix to key: " + pix.pixKey;
        }
        return "Unknown payment method";
    }

    // 3. Records - Imutáveis e concisos
    public record OrderDTO(
        UUID id,
        String customerName,
        List<ItemDTO> items,
        BigDecimal total,
        LocalDateTime createdAt
    ) {
        // Construtor compacto com validação
        public OrderDTO {
            Objects.requireNonNull(id, "ID is required");
            Objects.requireNonNull(customerName, "Customer name is required");
            items = List.copyOf(items); // Garante imutabilidade
        }

        // Método derivado
        public int itemCount() {
            return items.size();
        }
    }

    public record ItemDTO(
        String sku,
        String name,
        int quantity,
        BigDecimal unitPrice
    ) {
        public BigDecimal subtotal() {
            return unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }

    // 4. Switch Expressions com Pattern Matching
    public String describeOrder(Object obj) {
        return switch (obj) {
            case OrderDTO order when order.total().compareTo(BigDecimal.valueOf(1000)) > 0 
                -> "Premium order: " + order.id();
            case OrderDTO order 
                -> "Standard order: " + order.id();
            case String s 
                -> "Order ID string: " + s;
            case UUID uuid 
                -> "Order UUID: " + uuid;
            case null 
                -> "No order provided";
            default 
                -> "Unknown order type";
        };
    }

    // 5. Text Blocks para templates
    public String generateEmailTemplate(OrderDTO order) {
        return """
            <!DOCTYPE html>
            <html>
            <head><title>Order Confirmation</title></head>
            <body>
                <h1>Thank you for your order!</h1>
                <p>Order ID: %s</p>
                <p>Customer: %s</p>
                <p>Total: R$ %,.2f</p>
                <p>Items: %d</p>
                <p>Date: %s</p>
            </body>
            </html>
            """.formatted(
                order.id(),
                order.customerName(),
                order.total(),
                order.itemCount(),
                order.createdAt().format(DateTimeFormatter.ISO_LOCAL_DATE)
            );
    }

    // 6. Melhorias em Stream.toList()
    public List<String> getActiveCustomerNames(List<Customer> customers) {
        return customers.stream()
            .filter(Customer::isActive)
            .map(Customer::getName)
            .toList(); // Imutável, mais eficiente que Collectors.toList()
    }

    // 7. RandomGenerator (novo API)
    public List<String> generateCodes(int count) {
        RandomGenerator random = RandomGenerator.getDefault();
        return random.ints(count, 100000, 999999)
            .mapToObj(i -> "CODE-" + i)
            .toList();
    }
}`;

// Spring Data JPA Examples
const springDataPatterns = `// Spring Data JPA - Advanced Repository Patterns
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import jakarta.persistence.*;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, 
                                         JpaSpecificationExecutor<Order>,
                                         OrderRepositoryCustom {

    // 1. Query Methods Derivados
    List<Order> findByStatusAndCreatedAtAfter(OrderStatus status, Instant after);
    
    Optional<Order> findFirstByCustomerIdOrderByCreatedAtDesc(UUID customerId);
    
    Page<Order> findByCustomerIdAndStatusIn(
        UUID customerId, 
        List<OrderStatus> statuses, 
        Pageable pageable
    );

    // 2. JPQL com projections
    @Query("""
        SELECT new com.example.dto.OrderSummaryDTO(
            o.id, 
            o.status, 
            o.totalAmount,
            c.name,
            COUNT(i)
        )
        FROM Order o
        JOIN o.customer c
        JOIN o.items i
        WHERE o.createdAt >= :since
        GROUP BY o.id, o.status, o.totalAmount, c.name
        ORDER BY o.createdAt DESC
        """)
    Page<OrderSummaryDTO> findOrderSummaries(
        @Param("since") Instant since, 
        Pageable pageable
    );

    // 3. Native Query para relatórios
    @Query(value = """
        WITH daily_stats AS (
            SELECT 
                DATE_TRUNC('day', created_at) as order_date,
                COUNT(*) as order_count,
                SUM(total_amount) as total_revenue,
                AVG(total_amount) as avg_order_value
            FROM orders
            WHERE created_at >= :startDate 
              AND created_at < :endDate
            GROUP BY DATE_TRUNC('day', created_at)
        )
        SELECT 
            order_date,
            order_count,
            total_revenue,
            avg_order_value,
            SUM(order_count) OVER (ORDER BY order_date) as cumulative_orders
        FROM daily_stats
        ORDER BY order_date
        """, 
        nativeQuery = true)
    List<DailyStatsProjection> getDailyStatistics(
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    // 4. Modifying queries com clear
    @Modifying(clearAutomatically = true)
    @Query("""
        UPDATE Order o 
        SET o.status = :newStatus, o.updatedAt = CURRENT_TIMESTAMP 
        WHERE o.status = :oldStatus 
          AND o.createdAt < :before
        """)
    int bulkUpdateStatus(
        @Param("oldStatus") OrderStatus oldStatus,
        @Param("newStatus") OrderStatus newStatus,
        @Param("before") Instant before
    );

    // 5. Entity Graph para evitar N+1
    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);

    // 6. Locking para concorrência
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);

    // 7. Stream para grandes volumes
    @QueryHints(@QueryHint(name = "org.hibernate.fetchSize", value = "50"))
    @Query("SELECT o FROM Order o WHERE o.status = :status")
    Stream<Order> streamByStatus(@Param("status") OrderStatus status);
}

// Custom Repository Implementation
public interface OrderRepositoryCustom {
    List<Order> findWithDynamicFilters(OrderSearchCriteria criteria);
}

@Repository
public class OrderRepositoryCustomImpl implements OrderRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<Order> findWithDynamicFilters(OrderSearchCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Order> query = cb.createQuery(Order.class);
        Root<Order> order = query.from(Order.class);

        List<Predicate> predicates = new ArrayList<>();

        if (criteria.getCustomerId() != null) {
            predicates.add(cb.equal(order.get("customerId"), criteria.getCustomerId()));
        }

        if (criteria.getStatus() != null) {
            predicates.add(cb.equal(order.get("status"), criteria.getStatus()));
        }

        if (criteria.getMinAmount() != null) {
            predicates.add(cb.greaterThanOrEqualTo(
                order.get("totalAmount"), 
                criteria.getMinAmount()
            ));
        }

        if (criteria.getStartDate() != null && criteria.getEndDate() != null) {
            predicates.add(cb.between(
                order.get("createdAt"), 
                criteria.getStartDate(), 
                criteria.getEndDate()
            ));
        }

        query.where(predicates.toArray(new Predicate[0]));
        query.orderBy(cb.desc(order.get("createdAt")));

        return entityManager.createQuery(query)
            .setMaxResults(criteria.getLimit())
            .getResultList();
    }
}`;

// Spring Service with Transactions
const springServicePatterns = `// Spring Service - Transaction & Exception Patterns
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.retry.annotation.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderProcessingService {

    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    private final MeterRegistry meterRegistry;

    // 1. Transação com propagation e isolation
    @Transactional(
        propagation = Propagation.REQUIRED,
        isolation = Isolation.READ_COMMITTED,
        timeout = 30,
        rollbackFor = Exception.class,
        noRollbackFor = {NotificationException.class}
    )
    public Order processOrder(OrderRequest request) {
        Timer.Sample timer = Timer.start(meterRegistry);

        try {
            // Validar e reservar estoque
            inventoryService.reserveItems(request.getItems());

            // Criar ordem
            Order order = createOrder(request);

            // Processar pagamento
            PaymentResult payment = paymentGateway.charge(
                request.getPaymentMethod(),
                order.getTotalAmount()
            );

            if (!payment.isSuccessful()) {
                throw new PaymentFailedException(payment.getErrorMessage());
            }

            order.setPaymentId(payment.getTransactionId());
            order.setStatus(OrderStatus.PAID);
            order = orderRepository.save(order);

            // Notificação fora da transação principal
            notifyOrderCreated(order);

            return order;

        } catch (Exception e) {
            meterRegistry.counter("orders.failed", "reason", e.getClass().getSimpleName())
                .increment();
            throw e;
        } finally {
            timer.stop(meterRegistry.timer("orders.processing.time"));
        }
    }

    // 2. Nova transação para operações independentes
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logOrderEvent(UUID orderId, String event, String details) {
        orderRepository.insertAuditLog(orderId, event, details, Instant.now());
    }

    // 3. Retry com backoff exponencial
    @Retryable(
        value = {TransientException.class, TimeoutException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public PaymentResult processPayment(PaymentRequest request) {
        return paymentGateway.process(request);
    }

    @Recover
    public PaymentResult recoverPayment(Exception e, PaymentRequest request) {
        log.error("Payment failed after retries: {}", e.getMessage());
        return PaymentResult.failed("Payment processing unavailable");
    }

    // 4. Read-only transaction para consultas
    @Transactional(readOnly = true)
    public Page<OrderDTO> searchOrders(OrderSearchCriteria criteria, Pageable pageable) {
        return orderRepository
            .findAll(OrderSpecifications.fromCriteria(criteria), pageable)
            .map(this::toDTO);
    }

    // 5. Batch processing com chunks
    @Transactional
    public int processExpiredOrders() {
        int processed = 0;
        int batchSize = 100;

        try (Stream<Order> orders = orderRepository.streamExpiredOrders()) {
            List<Order> batch = new ArrayList<>();

            for (Order order : (Iterable<Order>) orders::iterator) {
                order.setStatus(OrderStatus.EXPIRED);
                batch.add(order);

                if (batch.size() >= batchSize) {
                    orderRepository.saveAll(batch);
                    entityManager.flush();
                    entityManager.clear();
                    processed += batch.size();
                    batch.clear();
                }
            }

            if (!batch.isEmpty()) {
                orderRepository.saveAll(batch);
                processed += batch.size();
            }
        }

        return processed;
    }

    // 6. Event-driven com ApplicationEventPublisher
    @Transactional
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderCreated(OrderCreatedEvent event) {
        notificationService.sendOrderConfirmation(event.getOrderId());
    }
}`;

// Collections and Data Structures
const javaCollectionsAdvanced = `// Java Collections - Advanced Patterns
import java.util.*;
import java.util.concurrent.*;

public class CollectionPatterns {

    // 1. Concurrent Collections para multi-threading
    private final ConcurrentMap<String, Order> orderCache = new ConcurrentHashMap<>();
    private final BlockingQueue<Task> taskQueue = new LinkedBlockingQueue<>(1000);
    private final CopyOnWriteArrayList<EventListener> listeners = new CopyOnWriteArrayList<>();

    public void cacheOrder(Order order) {
        orderCache.compute(order.getId().toString(), (key, existing) -> {
            if (existing == null || order.getUpdatedAt().isAfter(existing.getUpdatedAt())) {
                return order;
            }
            return existing;
        });
    }

    public Optional<Order> getCachedOrder(String orderId) {
        return Optional.ofNullable(orderCache.get(orderId));
    }

    // 2. NavigableMap para range queries
    private final NavigableMap<LocalDate, List<Order>> ordersByDate = new TreeMap<>();

    public List<Order> getOrdersInRange(LocalDate start, LocalDate end) {
        return ordersByDate.subMap(start, true, end, true)
            .values()
            .stream()
            .flatMap(List::stream)
            .collect(Collectors.toList());
    }

    // 3. PriorityQueue para processamento ordenado
    public List<Order> processOrdersByPriority(List<Order> orders) {
        PriorityQueue<Order> queue = new PriorityQueue<>(
            Comparator.comparing(Order::getPriority).reversed()
                .thenComparing(Order::getCreatedAt)
        );
        queue.addAll(orders);

        List<Order> processed = new ArrayList<>();
        while (!queue.isEmpty()) {
            Order order = queue.poll();
            process(order);
            processed.add(order);
        }
        return processed;
    }

    // 4. EnumMap para eficiência
    private final EnumMap<OrderStatus, List<Order>> ordersByStatus = new EnumMap<>(OrderStatus.class);

    public void categorizeOrders(List<Order> orders) {
        for (OrderStatus status : OrderStatus.values()) {
            ordersByStatus.put(status, new ArrayList<>());
        }
        orders.forEach(order -> 
            ordersByStatus.get(order.getStatus()).add(order)
        );
    }

    // 5. LinkedHashMap como LRU Cache
    public class LRUCache<K, V> extends LinkedHashMap<K, V> {
        private final int maxSize;

        public LRUCache(int maxSize) {
            super(maxSize, 0.75f, true);
            this.maxSize = maxSize;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > maxSize;
        }
    }

    // 6. BitSet para flags eficientes
    public class FeatureFlags {
        private final BitSet flags = new BitSet();

        public void enable(Feature feature) {
            flags.set(feature.ordinal());
        }

        public void disable(Feature feature) {
            flags.clear(feature.ordinal());
        }

        public boolean isEnabled(Feature feature) {
            return flags.get(feature.ordinal());
        }

        public Set<Feature> getEnabledFeatures() {
            return flags.stream()
                .mapToObj(i -> Feature.values()[i])
                .collect(Collectors.toSet());
        }
    }

    // 7. Deque para undo/redo
    public class CommandHistory {
        private final Deque<Command> undoStack = new ArrayDeque<>();
        private final Deque<Command> redoStack = new ArrayDeque<>();

        public void execute(Command command) {
            command.execute();
            undoStack.push(command);
            redoStack.clear();
        }

        public void undo() {
            if (!undoStack.isEmpty()) {
                Command command = undoStack.pop();
                command.undo();
                redoStack.push(command);
            }
        }

        public void redo() {
            if (!redoStack.isEmpty()) {
                Command command = redoStack.pop();
                command.execute();
                undoStack.push(command);
            }
        }
    }

    // 8. Imutável Collections (Java 9+)
    public Order createWithDefaults() {
        List<String> tags = List.of("new", "priority");
        Map<String, Object> metadata = Map.of(
            "source", "api",
            "version", 1,
            "flags", Set.of("express", "gift")
        );
        return Order.builder()
            .tags(tags)
            .metadata(metadata)
            .build();
    }
}`;

const categories = [
  {
    id: "java8",
    title: "Java 8 - Streams & Functional",
    badge: "LTS",
    examples: [
      { title: "Stream API & Collectors", code: java8StreamsExample, filename: "Java8StreamPatterns.java" },
      { title: "Date/Time API", code: java8DateTimeExample, filename: "Java8DateTimePatterns.java" },
    ]
  },
  {
    id: "java11",
    title: "Java 11 - HTTP Client & Features",
    badge: "LTS",
    examples: [
      { title: "HTTP Client & New APIs", code: java11FeaturesExample, filename: "Java11Patterns.java" },
    ]
  },
  {
    id: "java17",
    title: "Java 17 - Records & Pattern Matching",
    badge: "LTS",
    examples: [
      { title: "Sealed Classes, Records & Switch", code: java17FeaturesExample, filename: "Java17Patterns.java" },
    ]
  },
  {
    id: "spring-data",
    title: "Spring Data JPA",
    badge: "Spring",
    examples: [
      { title: "Repository Patterns", code: springDataPatterns, filename: "OrderRepository.java" },
      { title: "Service & Transactions", code: springServicePatterns, filename: "OrderProcessingService.java" },
    ]
  },
  {
    id: "collections",
    title: "Collections & Data Structures",
    badge: "Core",
    examples: [
      { title: "Advanced Collections", code: javaCollectionsAdvanced, filename: "CollectionPatterns.java" },
    ]
  },
];

const JavaExamples = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
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
                    language="java" 
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

export default JavaExamples;
