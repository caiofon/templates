package com.example.rabbitmq.consumer;

import com.example.rabbitmq.config.RabbitMQConfig;
import com.example.rabbitmq.event.OrderCreatedEvent;
import com.example.rabbitmq.service.IdempotencyService;
import com.example.rabbitmq.service.OrderProcessingService;
import com.rabbitmq.client.Channel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private static final int MAX_RETRIES = 3;
    private static final String RETRY_COUNT_HEADER = "x-retry-count";

    private final OrderProcessingService orderProcessingService;
    private final IdempotencyService idempotencyService;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE)
    public void handleOrderCreated(
            OrderCreatedEvent event, 
            Message message, 
            Channel channel) throws IOException {
        
        long deliveryTag = message.getMessageProperties().getDeliveryTag();
        String messageId = message.getMessageProperties().getMessageId();
        
        log.info("Received order event: {} with messageId: {}", event.orderId(), messageId);
        
        try {
            // Idempotency check
            if (idempotencyService.isDuplicate(messageId)) {
                log.warn("Duplicate message detected: {}", messageId);
                channel.basicAck(deliveryTag, false);
                return;
            }
            
            // Process the order
            orderProcessingService.processOrder(event);
            
            // Mark as processed
            idempotencyService.markAsProcessed(messageId);
            
            // Acknowledge the message
            channel.basicAck(deliveryTag, false);
            log.info("Order {} processed successfully", event.orderId());
            
        } catch (Exception e) {
            log.error("Error processing order {}: {}", event.orderId(), e.getMessage());
            handleFailure(event, message, channel, deliveryTag, e);
        }
    }

    private void handleFailure(
            OrderCreatedEvent event, 
            Message message, 
            Channel channel, 
            long deliveryTag,
            Exception e) throws IOException {
        
        int retryCount = getRetryCount(message);
        
        if (retryCount < MAX_RETRIES) {
            // Send to retry queue with incremented count
            log.info("Retrying order {} (attempt {}/{})", event.orderId(), retryCount + 1, MAX_RETRIES);
            
            message.getMessageProperties().setHeader(RETRY_COUNT_HEADER, retryCount + 1);
            rabbitTemplate.send(
                RabbitMQConfig.ORDER_EXCHANGE, 
                "order.retry", 
                message
            );
            channel.basicAck(deliveryTag, false);
            
        } else {
            // Max retries exceeded, send to DLQ
            log.error("Max retries exceeded for order {}. Sending to DLQ", event.orderId());
            channel.basicNack(deliveryTag, false, false);
        }
    }

    private int getRetryCount(Message message) {
        Map<String, Object> headers = message.getMessageProperties().getHeaders();
        
        // Check x-death header (set by RabbitMQ on rejection)
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> xDeath = (List<Map<String, Object>>) headers.get("x-death");
        if (xDeath != null && !xDeath.isEmpty()) {
            Long count = (Long) xDeath.get(0).get("count");
            if (count != null) {
                return count.intValue();
            }
        }
        
        // Check custom retry header
        Integer retryCount = (Integer) headers.get(RETRY_COUNT_HEADER);
        return retryCount != null ? retryCount : 0;
    }

    // DLQ Consumer for monitoring/alerting
    @RabbitListener(queues = RabbitMQConfig.ORDER_DLQ)
    public void handleDeadLetter(OrderCreatedEvent event, Message message) {
        log.error("Dead letter received for order: {}", event.orderId());
        // Here you could:
        // - Send alert to monitoring system
        // - Store in database for manual review
        // - Notify operations team
    }
}
