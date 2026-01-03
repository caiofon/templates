import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const javaVersions = [
  {
    version: "Java 8 (LTS)",
    releaseDate: "Março 2014",
    endOfLife: "2030+ (Oracle Extended)",
    status: "legacy",
    features: [
      "Lambda Expressions & Functional Interfaces",
      "Stream API para processamento de coleções",
      "Optional para evitar NullPointerException",
      "Date/Time API (java.time)",
      "Default Methods em interfaces",
      "Method References (::)",
      "Nashorn JavaScript Engine",
    ],
    useCase: "Sistemas legados, Oracle SOA Suite, WebLogic 12c, aplicações enterprise existentes",
    example: `// Java 8 - Lambda e Stream
List<String> names = Arrays.asList("John", "Jane", "Bob");
List<String> filtered = names.stream()
    .filter(n -> n.startsWith("J"))
    .map(String::toUpperCase)
    .collect(Collectors.toList());

// Optional
Optional<User> user = findUser(id);
String name = user.map(User::getName).orElse("Unknown");

// Date/Time
LocalDateTime now = LocalDateTime.now();
LocalDate date = LocalDate.of(2024, Month.JANUARY, 15);`
  },
  {
    version: "Java 11 (LTS)",
    releaseDate: "Setembro 2018",
    endOfLife: "2026+ (Oracle)",
    status: "active",
    features: [
      "HTTP Client API (java.net.http)",
      "Local Variable Type Inference (var) melhorado",
      "String methods: isBlank(), lines(), strip(), repeat()",
      "Files.readString() e writeString()",
      "Collection.toArray(IntFunction)",
      "Optional.isEmpty()",
      "Remoção de Java EE e CORBA modules",
      "Single-file source-code programs",
    ],
    useCase: "Microserviços modernos, Spring Boot 2.x/3.x, containers Docker, cloud-native",
    example: `// Java 11 - HTTP Client
HttpClient client = HttpClient.newBuilder()
    .version(Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .header("Accept", "application/json")
    .GET()
    .build();

HttpResponse<String> response = client.send(
    request, BodyHandlers.ofString());

// String methods
String text = "  Hello World  ";
text.isBlank();           // false
text.strip();             // "Hello World"
"abc".repeat(3);          // "abcabcabc"
"a\\nb\\nc".lines().count(); // 3

// Files
String content = Files.readString(Path.of("file.txt"));
Files.writeString(Path.of("output.txt"), content);`
  },
  {
    version: "Java 17 (LTS)",
    releaseDate: "Setembro 2021",
    endOfLife: "2029+ (Oracle)",
    status: "recommended",
    features: [
      "Sealed Classes e Interfaces",
      "Pattern Matching para instanceof",
      "Records (classes imutáveis)",
      "Switch Expressions (preview → final)",
      "Text Blocks (multi-line strings)",
      "Helpful NullPointerExceptions",
      "Strong encapsulation of JDK internals",
      "Enhanced Pseudo-Random Number Generators",
    ],
    useCase: "Novos projetos, Spring Boot 3.x (mínimo), Jakarta EE 10, cloud-native, microserviços",
    example: `// Java 17 - Records
public record UserDTO(
    UUID id,
    String name,
    String email,
    LocalDateTime createdAt
) {
    // Compact constructor
    public UserDTO {
        Objects.requireNonNull(id);
        Objects.requireNonNull(name);
        email = email.toLowerCase();
    }
}

// Sealed Classes
public sealed interface Shape 
    permits Circle, Rectangle, Triangle {
    double area();
}

public final class Circle implements Shape {
    private final double radius;
    public double area() { return Math.PI * radius * radius; }
}

// Pattern Matching
public String describe(Object obj) {
    return switch (obj) {
        case Integer i -> "Integer: " + i;
        case String s -> "String: " + s.length();
        case List<?> l -> "List: " + l.size();
        case null -> "null";
        default -> "Unknown";
    };
}

// Text Blocks
String json = """
    {
        "name": "John",
        "age": 30,
        "active": true
    }
    """;`
  },
  {
    version: "Java 21 (LTS)",
    releaseDate: "Setembro 2023",
    endOfLife: "2031+ (Oracle)",
    status: "latest",
    features: [
      "Virtual Threads (Project Loom)",
      "Pattern Matching for switch (final)",
      "Record Patterns",
      "Sequenced Collections",
      "String Templates (preview)",
      "Unnamed Patterns and Variables",
      "Scoped Values",
    ],
    useCase: "Projetos greenfield, alta concorrência, sistemas reativos simplificados",
    example: `// Java 21 - Virtual Threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}

// Record Patterns
record Point(int x, int y) {}
record Rectangle(Point upperLeft, Point lowerRight) {}

static void printArea(Object obj) {
    if (obj instanceof Rectangle(Point(var x1, var y1), Point(var x2, var y2))) {
        System.out.println("Area: " + (x2 - x1) * (y2 - y1));
    }
}

// Sequenced Collections
SequencedCollection<String> list = new ArrayList<>();
list.addFirst("first");
list.addLast("last");
String first = list.getFirst();
String last = list.getLast();
SequencedCollection<String> reversed = list.reversed();`
  },
];

const nodeVersions = [
  {
    version: "Node.js 18 (LTS)",
    releaseDate: "Abril 2022",
    endOfLife: "Abril 2025",
    status: "maintenance",
    features: [
      "Fetch API nativo (experimental)",
      "Test Runner nativo",
      "V8 engine 10.1",
      "Web Streams API",
      "Build-time user-land snapshot",
      "Prefix-only core modules",
    ],
    useCase: "Projetos existentes, compatibilidade ampla, estabilidade",
    example: `// Node 18 - Fetch nativo
const response = await fetch('https://api.example.com/data');
const data = await response.json();

// Test Runner nativo
import { test, describe, it } from 'node:test';
import assert from 'node:assert';

describe('MyModule', () => {
  it('should work', () => {
    assert.strictEqual(1 + 1, 2);
  });
});

// Web Streams
import { ReadableStream } from 'node:stream/web';

const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('Hello');
    controller.enqueue('World');
    controller.close();
  }
});`
  },
  {
    version: "Node.js 20 (LTS)",
    releaseDate: "Abril 2023",
    endOfLife: "Abril 2026",
    status: "active",
    features: [
      "Stable Fetch API e WebStreams",
      "Test Runner estável",
      "Permission Model experimental",
      "V8 engine 11.3",
      "ESM Loader Hooks estável",
      "Single executable applications",
      "Performance improvements (URL parser)",
    ],
    useCase: "Novos projetos, microserviços, APIs REST, aplicações cloud-native",
    example: `// Node 20 - Test Runner estável
import { test, mock } from 'node:test';
import assert from 'node:assert';

test('async operation', async (t) => {
  await t.test('nested test', async () => {
    const fn = mock.fn(() => 42);
    assert.strictEqual(fn(), 42);
    assert.strictEqual(fn.mock.calls.length, 1);
  });
});

// Permission Model
// node --experimental-permission --allow-fs-read=/tmp index.js

import { isMainThread, Worker } from 'node:worker_threads';
import { setTimeout } from 'node:timers/promises';

// Timers/Promises
await setTimeout(1000);
console.log('After 1 second');

// Watch mode
// node --watch app.js`
  },
  {
    version: "Node.js 22 (Current)",
    releaseDate: "Abril 2024",
    endOfLife: "Abril 2027 (quando virar LTS)",
    status: "current",
    features: [
      "require() para ESM (experimental)",
      "V8 engine 12.4",
      "WebSocket client nativo",
      "Maglev compiler habilitado",
      "Melhor performance geral",
      "Watch mode estável",
      "glob() e globSync() nativos",
    ],
    useCase: "Experimentação, projetos pessoais, early adopters, testes de novas features",
    example: `// Node 22 - require() com ESM
// Agora pode usar require() para importar ES Modules
const esModule = require('./module.mjs');

// glob nativo
import { glob } from 'node:fs';

const files = await glob('**/*.js', { 
  cwd: './src',
  ignore: 'node_modules/**'
});

// WebSocket client nativo
const ws = new WebSocket('wss://example.com/socket');
ws.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});
ws.send('Hello!');

// Watch mode estável
// node --watch --watch-path=./src app.js`
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    recommended: "bg-[hsl(var(--terminal-green))]/10 text-[hsl(var(--terminal-green))] border-[hsl(var(--terminal-green))]/30",
    active: "bg-primary/10 text-primary border-primary/30",
    latest: "bg-[hsl(var(--terminal-yellow))]/10 text-[hsl(var(--terminal-yellow))] border-[hsl(var(--terminal-yellow))]/30",
    current: "bg-[hsl(var(--terminal-yellow))]/10 text-[hsl(var(--terminal-yellow))] border-[hsl(var(--terminal-yellow))]/30",
    legacy: "bg-muted text-muted-foreground border-muted-foreground/30",
    maintenance: "bg-[hsl(var(--terminal-orange))]/10 text-[hsl(var(--terminal-orange))] border-[hsl(var(--terminal-orange))]/30",
  };
  
  const labels: Record<string, string> = {
    recommended: "Recomendado",
    active: "Ativo",
    latest: "Mais Recente",
    current: "Current",
    legacy: "Legado",
    maintenance: "Manutenção",
  };
  
  return (
    <Badge variant="outline" className={styles[status] || styles.active}>
      {labels[status] || status}
    </Badge>
  );
};

const VersionsGuide = () => {
  return (
    <div className="space-y-8">
      {/* Java Versions */}
      <div>
        <h3 className="text-xl font-bold font-mono mb-4 text-primary">
          Versões Java LTS
        </h3>
        <Accordion type="multiple" className="w-full">
          {javaVersions.map((v) => (
            <AccordionItem key={v.version} value={v.version} className="border-border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={v.status} />
                  <span className="font-mono text-sm font-bold">{v.version}</span>
                  <span className="text-xs text-muted-foreground">
                    ({v.releaseDate} → {v.endOfLife})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <Card className="bg-card/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Principais Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {v.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Caso de Uso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{v.useCase}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Exemplo de Código</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono bg-secondary/50 p-4 rounded overflow-x-auto">
                      <code>{v.example}</code>
                    </pre>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Node.js Versions */}
      <div>
        <h3 className="text-xl font-bold font-mono mb-4 text-[hsl(var(--terminal-green))]">
          Versões Node.js
        </h3>
        <Accordion type="multiple" className="w-full">
          {nodeVersions.map((v) => (
            <AccordionItem key={v.version} value={v.version} className="border-border">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={v.status} />
                  <span className="font-mono text-sm font-bold">{v.version}</span>
                  <span className="text-xs text-muted-foreground">
                    ({v.releaseDate} → {v.endOfLife})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <Card className="bg-card/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Principais Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {v.features.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Caso de Uso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{v.useCase}</p>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Exemplo de Código</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs font-mono bg-secondary/50 p-4 rounded overflow-x-auto">
                      <code>{v.example}</code>
                    </pre>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default VersionsGuide;
