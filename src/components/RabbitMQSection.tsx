import CodeBlock from "./CodeBlock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

const rabbitConfigCode = `# RabbitMQ Configuration
spring:
  rabbitmq:
    host: \${RABBITMQ_HOST:localhost}
    port: \${RABBITMQ_PORT:5672}
    username: \${RABBITMQ_USER:guest}
    password: \${RABBITMQ_PASS:guest}
    
    # Connection resilience
    connection-timeout: 30000
    
    listener:
      simple:
        acknowledge-mode: manual
        prefetch: 10
        retry:
          enabled: true
          max-attempts: 3
          initial-interval: 1000`;

const rabbitConsumerCode = `@Component
public class OrderEventConsumer {

    private final OrderProcessor processor;
    private final Logger log = LoggerFactory.getLogger(this.getClass());

    @RabbitListener(queues = "orders.queue")
    public void handleOrderCreated(
            OrderCreatedEvent event,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        
        try {
            log.info("Processing order: {}", event.getOrderId());
            processor.process(event);
            
            // Manual acknowledgment - best practice
            channel.basicAck(tag, false);
            
        } catch (RetryableException e) {
            // Reject and requeue for retry
            channel.basicNack(tag, false, true);
            
        } catch (Exception e) {
            // Reject without requeue - goes to DLQ
            channel.basicNack(tag, false, false);
            log.error("Failed to process order", e);
        }
    }
}`;

const RabbitMQSection = () => {
  return (
    <section id="rabbitmq" className="py-20 px-4">
      <div className="container max-w-6xl">
        <div className="space-y-4 mb-12">
          <h2 className="text-3xl font-bold font-mono">
            <span className="text-primary">#</span> RabbitMQ Patterns
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Reliable messaging patterns for enterprise-grade event-driven architectures.
          </p>
        </div>

        {/* Architecture diagram */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" />
                Publisher
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Services publish events to exchanges with routing keys
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-terminal-yellow" />
                Exchange & Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Topic exchanges route messages to bound queues
            </CardContent>
          </Card>

          <Card className="bg-card border-border card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-accent" />
                Consumer + DLQ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Consumers with manual ACK and dead letter handling
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary font-mono">
              Configuration
            </h3>
            <CodeBlock 
              code={rabbitConfigCode} 
              language="yaml" 
              filename="application.yml" 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary font-mono">
              Consumer with Manual ACK
            </h3>
            <CodeBlock 
              code={rabbitConsumerCode} 
              language="java" 
              filename="OrderEventConsumer.java" 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default RabbitMQSection;
