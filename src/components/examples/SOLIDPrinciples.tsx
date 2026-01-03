import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";

const srpExample = `// S - Single Responsibility Principle (Princípio da Responsabilidade Única)
// Uma classe deve ter apenas UM motivo para mudar

// ❌ ERRADO - Classe com múltiplas responsabilidades
class UserManager {
    createUser(user: User) { /* cria usuário */ }
    sendEmail(user: User, message: string) { /* envia email */ }
    generateReport(users: User[]) { /* gera relatório */ }
    validateUser(user: User) { /* valida dados */ }
    saveToDatabase(user: User) { /* salva no banco */ }
}

// ✅ CORRETO - Cada classe com uma única responsabilidade
class UserService {
    constructor(
        private userRepository: UserRepository,
        private userValidator: UserValidator
    ) {}

    async createUser(dto: CreateUserDTO): Promise<User> {
        this.userValidator.validate(dto);
        return this.userRepository.save(User.create(dto));
    }
}

class UserValidator {
    validate(dto: CreateUserDTO): void {
        if (!dto.email || !this.isValidEmail(dto.email)) {
            throw new ValidationError('Invalid email');
        }
        if (!dto.password || dto.password.length < 8) {
            throw new ValidationError('Password too short');
        }
    }

    private isValidEmail(email: string): boolean {
        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
    }
}

class UserRepository {
    async save(user: User): Promise<User> {
        return this.db.users.create({ data: user });
    }
}

class EmailService {
    async sendWelcomeEmail(user: User): Promise<void> {
        await this.mailer.send({
            to: user.email,
            template: 'welcome',
            data: { name: user.name }
        });
    }
}

class UserReportGenerator {
    generate(users: User[]): Report {
        return new Report(users.map(u => ({
            id: u.id,
            name: u.name,
            createdAt: u.createdAt
        })));
    }
}`;

const ocpExample = `// O - Open/Closed Principle (Princípio Aberto/Fechado)
// Aberto para extensão, fechado para modificação

// ❌ ERRADO - Precisa modificar a classe para adicionar novo tipo
class PaymentProcessor {
    processPayment(payment: Payment) {
        if (payment.type === 'credit_card') {
            // processa cartão de crédito
        } else if (payment.type === 'pix') {
            // processa PIX
        } else if (payment.type === 'boleto') {
            // processa boleto
        }
        // Para cada novo método, precisamos modificar esta classe
    }
}

// ✅ CORRETO - Usa abstração e polimorfismo
interface PaymentMethod {
    process(amount: number): Promise<PaymentResult>;
    getType(): string;
    validate(): boolean;
}

class CreditCardPayment implements PaymentMethod {
    constructor(
        private cardNumber: string,
        private cvv: string,
        private expiryDate: string
    ) {}

    async process(amount: number): Promise<PaymentResult> {
        // Lógica específica para cartão de crédito
        const response = await this.gateway.charge({
            card: this.cardNumber,
            amount,
            cvv: this.cvv
        });
        return { success: response.approved, transactionId: response.id };
    }

    getType(): string { return 'credit_card'; }
    
    validate(): boolean {
        return this.cardNumber.length === 16 && this.cvv.length === 3;
    }
}

class PixPayment implements PaymentMethod {
    constructor(private pixKey: string) {}

    async process(amount: number): Promise<PaymentResult> {
        // Lógica específica para PIX
        const qrCode = await this.pixApi.generateQRCode(this.pixKey, amount);
        return { success: true, qrCode };
    }

    getType(): string { return 'pix'; }
    validate(): boolean { return !!this.pixKey; }
}

// Novo método de pagamento sem modificar código existente
class CryptoPayment implements PaymentMethod {
    constructor(private walletAddress: string, private currency: string) {}

    async process(amount: number): Promise<PaymentResult> {
        const converted = await this.converter.toUSD(amount);
        return this.cryptoGateway.transfer(this.walletAddress, converted);
    }

    getType(): string { return 'crypto'; }
    validate(): boolean { return this.walletAddress.startsWith('0x'); }
}

// Processador genérico que aceita qualquer PaymentMethod
class PaymentProcessor {
    async processPayment(method: PaymentMethod, amount: number): Promise<PaymentResult> {
        if (!method.validate()) {
            throw new ValidationError(\`Invalid \${method.getType()} payment\`);
        }
        return method.process(amount);
    }
}`;

const lspExample = `// L - Liskov Substitution Principle (Princípio da Substituição de Liskov)
// Subclasses devem ser substituíveis por suas classes base

// ❌ ERRADO - Viola LSP, pinguim não pode voar
class Bird {
    fly(): void {
        console.log('Flying...');
    }
}

class Penguin extends Bird {
    fly(): void {
        throw new Error("Penguins can't fly!"); // Quebra o contrato
    }
}

function makeBirdFly(bird: Bird) {
    bird.fly(); // Quebra com Penguin!
}

// ✅ CORRETO - Hierarquia que respeita LSP
interface Bird {
    eat(): void;
    sleep(): void;
}

interface FlyingBird extends Bird {
    fly(): void;
}

interface SwimmingBird extends Bird {
    swim(): void;
}

class Eagle implements FlyingBird {
    eat(): void { console.log('Eagle eating'); }
    sleep(): void { console.log('Eagle sleeping'); }
    fly(): void { console.log('Eagle flying high'); }
}

class Penguin implements SwimmingBird {
    eat(): void { console.log('Penguin eating fish'); }
    sleep(): void { console.log('Penguin sleeping'); }
    swim(): void { console.log('Penguin swimming'); }
}

// ❌ ERRADO - Retângulo/Quadrado clássico
class Rectangle {
    constructor(protected width: number, protected height: number) {}
    
    setWidth(width: number): void { this.width = width; }
    setHeight(height: number): void { this.height = height; }
    
    area(): number { return this.width * this.height; }
}

class Square extends Rectangle {
    setWidth(width: number): void {
        this.width = width;
        this.height = width; // Quebra expectativa do Rectangle!
    }
    
    setHeight(height: number): void {
        this.height = height;
        this.width = height; // Quebra expectativa!
    }
}

// ✅ CORRETO - Usar composição ou interfaces separadas
interface Shape {
    area(): number;
    perimeter(): number;
}

class RectangleShape implements Shape {
    constructor(private readonly width: number, private readonly height: number) {}
    
    area(): number { return this.width * this.height; }
    perimeter(): number { return 2 * (this.width + this.height); }
}

class SquareShape implements Shape {
    constructor(private readonly side: number) {}
    
    area(): number { return this.side * this.side; }
    perimeter(): number { return 4 * this.side; }
}`;

const ispExample = `// I - Interface Segregation Principle (Princípio da Segregação de Interface)
// Clientes não devem depender de interfaces que não usam

// ❌ ERRADO - Interface muito grande (fat interface)
interface Worker {
    work(): void;
    eat(): void;
    sleep(): void;
    attendMeeting(): void;
    writeReport(): void;
    codeReview(): void;
    deployCode(): void;
    manageTeam(): void;
    hirePeople(): void;
}

// Robô precisa implementar métodos que não fazem sentido
class Robot implements Worker {
    work(): void { /* ok */ }
    eat(): void { throw new Error('Robots do not eat'); } // ❌
    sleep(): void { throw new Error('Robots do not sleep'); } // ❌
    // ... todos os outros métodos
}

// ✅ CORRETO - Interfaces segregadas e coesas
interface Workable {
    work(): void;
}

interface Feedable {
    eat(): void;
    takeBreak(): void;
}

interface Sleepable {
    sleep(): void;
    rest(): void;
}

interface Attendable {
    attendMeeting(): void;
    presentWork(): void;
}

interface Codeable {
    writeCode(): void;
    codeReview(): void;
    deployCode(): void;
}

interface Manageable {
    manageTeam(): void;
    conductOneOnOne(): void;
    hirePeople(): void;
}

// Humano implementa todas as interfaces relevantes
class HumanDeveloper implements Workable, Feedable, Sleepable, Codeable {
    work(): void { console.log('Working...'); }
    eat(): void { console.log('Eating lunch'); }
    takeBreak(): void { console.log('Coffee break'); }
    sleep(): void { console.log('Sleeping'); }
    rest(): void { console.log('Resting'); }
    writeCode(): void { console.log('Coding'); }
    codeReview(): void { console.log('Reviewing PRs'); }
    deployCode(): void { console.log('Deploying to prod'); }
}

// Robô só implementa o que faz sentido
class RobotWorker implements Workable, Codeable {
    work(): void { console.log('Robot working 24/7'); }
    writeCode(): void { console.log('AI coding'); }
    codeReview(): void { console.log('AI reviewing'); }
    deployCode(): void { console.log('Auto deploying'); }
}

// Manager com responsabilidades de gestão
class TechLead implements Workable, Codeable, Manageable, Attendable {
    work(): void { /* ... */ }
    writeCode(): void { /* ... */ }
    codeReview(): void { /* ... */ }
    deployCode(): void { /* ... */ }
    manageTeam(): void { console.log('Managing team'); }
    conductOneOnOne(): void { console.log('1:1 meeting'); }
    hirePeople(): void { console.log('Interviewing'); }
    attendMeeting(): void { console.log('In meeting'); }
    presentWork(): void { console.log('Presenting'); }
}`;

const dipExample = `// D - Dependency Inversion Principle (Princípio da Inversão de Dependência)
// Dependa de abstrações, não de implementações concretas

// ❌ ERRADO - Alta acoplamento, depende de implementações concretas
class MySQLDatabase {
    query(sql: string): any[] { /* ... */ }
}

class EmailService {
    send(to: string, message: string): void { /* ... */ }
}

class OrderService {
    private database = new MySQLDatabase(); // Dependência concreta!
    private emailService = new EmailService(); // Dependência concreta!

    createOrder(order: Order): void {
        // Não pode trocar o banco sem modificar esta classe
        this.database.query(\`INSERT INTO orders ...\`);
        this.emailService.send(order.email, 'Order created');
    }
}

// ✅ CORRETO - Depende de abstrações (interfaces)
interface Database {
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    insert<T>(table: string, data: T): Promise<T>;
    update<T>(table: string, id: string, data: Partial<T>): Promise<T>;
    delete(table: string, id: string): Promise<void>;
}

interface NotificationService {
    send(recipient: string, message: string, options?: NotificationOptions): Promise<void>;
}

interface Logger {
    info(message: string, meta?: object): void;
    error(message: string, error?: Error): void;
    warn(message: string, meta?: object): void;
}

// Implementações concretas
class PostgresDatabase implements Database {
    async query<T>(sql: string, params?: any[]): Promise<T[]> {
        return this.pool.query(sql, params);
    }
    async insert<T>(table: string, data: T): Promise<T> { /* ... */ }
    async update<T>(table: string, id: string, data: Partial<T>): Promise<T> { /* ... */ }
    async delete(table: string, id: string): Promise<void> { /* ... */ }
}

class EmailNotificationService implements NotificationService {
    async send(recipient: string, message: string): Promise<void> {
        await this.mailer.send({ to: recipient, body: message });
    }
}

class SlackNotificationService implements NotificationService {
    async send(recipient: string, message: string): Promise<void> {
        await this.slackClient.postMessage(recipient, message);
    }
}

// Service com injeção de dependências
class OrderService {
    constructor(
        private readonly database: Database,  // Abstração
        private readonly notifier: NotificationService,  // Abstração
        private readonly logger: Logger  // Abstração
    ) {}

    async createOrder(dto: CreateOrderDTO): Promise<Order> {
        this.logger.info('Creating order', { customerId: dto.customerId });

        const order = await this.database.insert('orders', {
            ...dto,
            status: 'PENDING',
            createdAt: new Date()
        });

        await this.notifier.send(
            dto.customerEmail,
            \`Order \${order.id} created successfully!\`
        );

        return order;
    }
}

// Composição no container de DI (exemplo com tsyringe)
import { container } from 'tsyringe';

container.register<Database>('Database', { useClass: PostgresDatabase });
container.register<NotificationService>('NotificationService', { useClass: EmailNotificationService });
container.register<Logger>('Logger', { useClass: WinstonLogger });

// Uso
const orderService = container.resolve(OrderService);

// Em testes, facilmente substituímos por mocks
const mockDatabase: Database = {
    query: jest.fn(),
    insert: jest.fn().mockResolvedValue({ id: '123' }),
    update: jest.fn(),
    delete: jest.fn()
};

const testOrderService = new OrderService(
    mockDatabase,
    new MockNotificationService(),
    new ConsoleLogger()
);`;

const principles = [
  {
    id: "srp",
    letter: "S",
    title: "Single Responsibility Principle",
    subtitle: "Princípio da Responsabilidade Única",
    description: "Uma classe deve ter apenas um motivo para mudar. Cada classe/módulo deve ter uma única responsabilidade bem definida.",
    code: srpExample,
  },
  {
    id: "ocp",
    letter: "O",
    title: "Open/Closed Principle",
    subtitle: "Princípio Aberto/Fechado",
    description: "Entidades de software devem estar abertas para extensão, mas fechadas para modificação. Use abstrações e polimorfismo.",
    code: ocpExample,
  },
  {
    id: "lsp",
    letter: "L",
    title: "Liskov Substitution Principle",
    subtitle: "Princípio da Substituição de Liskov",
    description: "Objetos de uma superclasse devem ser substituíveis por objetos de suas subclasses sem quebrar a aplicação.",
    code: lspExample,
  },
  {
    id: "isp",
    letter: "I",
    title: "Interface Segregation Principle",
    subtitle: "Princípio da Segregação de Interface",
    description: "Muitas interfaces específicas são melhores do que uma interface única e geral. Clientes não devem depender de métodos que não usam.",
    code: ispExample,
  },
  {
    id: "dip",
    letter: "D",
    title: "Dependency Inversion Principle",
    subtitle: "Princípio da Inversão de Dependência",
    description: "Módulos de alto nível não devem depender de módulos de baixo nível. Ambos devem depender de abstrações.",
    code: dipExample,
  },
];

const SOLIDPrinciples = () => {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="w-full">
        {principles.map((p) => (
          <AccordionItem key={p.id} value={p.id} className="border-border">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground font-bold text-lg w-8 h-8 flex items-center justify-center p-0">
                  {p.letter}
                </Badge>
                <div className="text-left">
                  <span className="font-mono text-sm font-bold block">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.subtitle}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <CodeBlock 
                code={p.code} 
                language="typescript" 
                filename={`${p.id}-principle.ts`}
                collapsible
                defaultExpanded={true}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default SOLIDPrinciples;
