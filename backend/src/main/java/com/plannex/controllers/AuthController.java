package com.plannex.controllers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.plannex.models.ERole;
import com.plannex.models.Role;
import com.plannex.models.User;
import com.plannex.payload.request.LoginRequest;
import com.plannex.payload.request.SignupRequest;
import com.plannex.payload.response.JwtResponse;
import com.plannex.payload.response.MessageResponse;
import com.plannex.repository.RoleRepository;
import com.plannex.repository.UserRepository;
import com.plannex.security.jwt.JwtUtils;
import com.plannex.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    com.plannex.services.EmailService emailService;

    @Autowired
    com.plannex.security.otp.OtpManager otpManager;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Fetch user location from database
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                userDetails.isApproved(),
                userDetails.isSuspended(),
                user.getLocation() != null ? user.getLocation() : ""));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        try {
            // Create new user's account
            User user = new User(signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    encoder.encode(signUpRequest.getPassword()));

            Set<String> strRoles = signUpRequest.getRole();
            Set<Role> roles = new HashSet<>();

            if (strRoles == null) {
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                        .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                roles.add(userRole);
            } else {
                strRoles.forEach(role -> {
                    switch (role) {
                        case "admin":
                            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(adminRole);

                            break;
                        case "vendor":
                            Role modRole = roleRepository.findByName(ERole.ROLE_VENDOR)
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(modRole);

                            break;
                        default:
                            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                            roles.add(userRole);
                    }
                });
            }

            user.setRoles(roles);

            // Set location if provided
            if (signUpRequest.getLocation() != null && !signUpRequest.getLocation().trim().isEmpty()) {
                user.setLocation(signUpRequest.getLocation());
            }

            userRepository.save(user);

            // Start OTP process
            String otp = otpManager.generateOtp(user.getEmail());
            emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp);

            return ResponseEntity.ok(new MessageResponse(
                    "User registered successfully! Please check your email to verify your account."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyUser(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");

        try {
            if (otpManager.validateOtp(email, otp)) {
                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Error: User not found."));

                user.setActive(true);
                userRepository.save(user);

                // Send Welcome Email after successful verification
                emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());

                return ResponseEntity.ok(new MessageResponse("Account verified successfully!"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid or expired OTP!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");

        if (!userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email not found!"));
        }

        try {
            User user = userRepository.findByEmail(email).get();
            if (user.isActive()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Account is already active!"));
            }

            String otp = otpManager.generateOtp(email);
            emailService.sendOtpEmail(email, user.getUsername(), otp);

            return ResponseEntity.ok(new MessageResponse("OTP resent successfully!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

}
