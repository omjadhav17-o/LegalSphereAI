package com.contract.Backend.Controller;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserRepository userRepository;

    /**
     * Get all users
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    /**
     * Get user by username
     */
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    /**
     * Create user with role normalization and department persistence
     */
    @PostMapping
    public ResponseEntity<User> addUser(@RequestBody AddUserRequest request) {
        log.info("Creating new user: {}", request.getUsername());

        if (request.getUsername() == null || request.getEmail() == null || request.getPassword() == null) {
            throw new RuntimeException("username, email and password are required");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("email already exists");
        }

        // Normalize role strings from frontend ("legal", "legalteam", "department")
        String roleInput = request.getRole();
        if (roleInput == null) {
            throw new RuntimeException("role is required");
        }
        String roleNormalized = roleInput.trim().toUpperCase();
        if (roleNormalized.equals("LEGAL")) {
            roleNormalized = "LEGALTEAM";
        }
        if (roleNormalized.equals("LEGALTEAM") || roleNormalized.equals("DEPARTMENT")) {
            // ok
        } else {
            throw new RuntimeException("role must be LEGALTEAM or DEPARTMENT (or 'legal'/'department')");
        }

        User.UserRole roleEnum = User.UserRole.valueOf(roleNormalized);

        // Ensure department name is stored
        String department = request.getDepartment();
        if (department == null || department.isBlank()) {
            department = roleEnum == User.UserRole.LEGALTEAM ? "Legal" : "Administration";
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .role(roleEnum)
                .fullName(request.getFullName())
                .department(department)
                .build();

        User savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    /**
     * DTO for user creation
     */
    public static class AddUserRequest {
        private String username;
        private String email;
        private String password;
        private String fullName;
        private String role; // accepts 'LEGALTEAM'/'DEPARTMENT' or 'legal'/'department'
        private String department;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
}