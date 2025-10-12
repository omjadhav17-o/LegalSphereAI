package com.contract.Backend.Config;
import com.contract.Backend.Repository.UserRepository;
import com.contract.Backend.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Create employee user
            User employee = User.builder()
                    .username("employee")
                    .email("employee@company.com")
                    .password("password")
                    .fullName("John Employee")
                    .department("Sales")
                    .role(User.UserRole.EMPLOYEE)
                    .build();

            // Create legal team user
            User legalTeam = User.builder()
                    .username("legal")
                    .email("legal@company.com")
                    .password("password")
                    .fullName("Sarah Wilson")
                    .department("Legal")
                    .role(User.UserRole.LEGAL_TEAM)
                    .build();

            userRepository.save(employee);
            userRepository.save(legalTeam);

            log.info("Initialized default users");
        }
    }
}
