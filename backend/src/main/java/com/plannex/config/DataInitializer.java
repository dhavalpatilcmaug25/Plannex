package com.plannex.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.plannex.models.ERole;
import com.plannex.models.Role;
import com.plannex.repository.RoleRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    com.plannex.repository.UserRepository userRepository;

    @Autowired
    org.springframework.security.crypto.password.PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(ERole.ROLE_USER));
            roleRepository.save(new Role(ERole.ROLE_VENDOR));
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
            System.out.println("Roles Seeded");
        }

        if (!userRepository.existsByUsername("admin")) {
            com.plannex.models.User admin = new com.plannex.models.User("admin", "admin@plannex.com",
                    encoder.encode("admin123"));
            java.util.Set<Role> roles = new java.util.HashSet<>();
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
            System.out.println("Admin Account Seeded");
        }
    }
}
