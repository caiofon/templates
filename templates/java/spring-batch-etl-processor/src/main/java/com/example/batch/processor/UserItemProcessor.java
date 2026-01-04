package com.example.batch.processor;

import com.example.batch.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
public class UserItemProcessor implements ItemProcessor<User, User> {

    @Override
    public User process(User user) throws Exception {
        // Transform data
        String firstName = user.getFirstName().trim().toUpperCase();
        String lastName = user.getLastName().trim().toUpperCase();
        String email = user.getEmail().trim().toLowerCase();
        
        // Validation
        if (!isValidEmail(email)) {
            log.warn("Invalid email for user: {} {}", firstName, lastName);
            return null; // Skip this record
        }
        
        // Create transformed user
        User transformedUser = new User();
        transformedUser.setFirstName(firstName);
        transformedUser.setLastName(lastName);
        transformedUser.setEmail(email);
        transformedUser.setPhone(normalizePhone(user.getPhone()));
        transformedUser.setStatus("ACTIVE");
        transformedUser.setCreatedAt(LocalDateTime.now());
        
        log.debug("Processed user: {} {}", firstName, lastName);
        return transformedUser;
    }
    
    private boolean isValidEmail(String email) {
        return email != null && email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        return phone.replaceAll("[^0-9]", "");
    }
}
