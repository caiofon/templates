package com.example.microservice.service;

import com.example.microservice.dto.UserRequest;
import com.example.microservice.dto.UserResponse;
import com.example.microservice.exception.ResourceNotFoundException;
import com.example.microservice.mapper.UserMapper;
import com.example.microservice.model.User;
import com.example.microservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        log.debug("Finding all users with pagination: {}", pageable);
        return userRepository.findAll(pageable)
                .map(userMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        log.debug("Finding user by id: {}", id);
        return userRepository.findById(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        log.info("Creating new user with email: {}", request.email());
        User user = userMapper.toEntity(request);
        User savedUser = userRepository.save(user);
        log.info("User created with id: {}", savedUser.getId());
        return userMapper.toResponse(savedUser);
    }

    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        log.info("Updating user with id: {}", id);
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        userMapper.updateEntity(request, existingUser);
        User updatedUser = userRepository.save(existingUser);
        log.info("User updated with id: {}", updatedUser.getId());
        return userMapper.toResponse(updatedUser);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting user with id: {}", id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
        log.info("User deleted with id: {}", id);
    }
}
