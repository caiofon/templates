package com.example.rabbitmq.publisher;

import com.example.rabbitmq.config.RabbitMQConfig;
import com.example.rabbitmq.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.MessagePostProcessor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {
        String messageId = UUID.randomUUID().toString();
        
        MessagePostProcessor postProcessor = message -> {
            message.getMessageProperties().setMessageId(messageId);
            message.getMessageProperties().setContentType("application/json");
            message.getMessageProperties().setCorrelationId(event.orderId());
            return message;
        };
        
        log.info("Publishing order created event: {} with messageId: {}", event.orderId(), messageId);
        
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.ORDER_EXCHANGE,
            RabbitMQConfig.ORDER_ROUTING_KEY,
            event,
            postProcessor
        );
        
        log.info("Order event published successfully");
    }
}
