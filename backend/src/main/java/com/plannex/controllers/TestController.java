package com.plannex.controllers;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.plannex.repository.UserRepository userRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.plannex.repository.RoleRepository roleRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Autowired
    private com.plannex.repository.BookingRepository bookingRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private com.plannex.repository.EventApplicationRepository eventApplicationRepository;

    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('VENDOR') or hasRole('ADMIN')")
    public String userAccess() {
        return "User Content.";
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public String vendorAccess() {
        return "Vendor Board.";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Board.";
    }

    @GetMapping("/seed")
    public String seedVendors() {
        try {
            // Seed Roles
            if (roleRepository.count() == 0) {
                roleRepository.save(new com.plannex.models.Role(com.plannex.models.ERole.ROLE_USER));
                roleRepository.save(new com.plannex.models.Role(com.plannex.models.ERole.ROLE_VENDOR));
                roleRepository.save(new com.plannex.models.Role(com.plannex.models.ERole.ROLE_ADMIN));
            }

            String[] cities = { "Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad" };
            String[] services = { "PHOTOGRAPHY", "CATERING", "DECORATION", "MUSIC_DJ", "VENUE", "MAKEUP_ARTIST" };

            int addedCount = 0;

            for (String city : cities) {
                for (String service : services) {
                    for (int j = 1; j <= 2; j++) { // 2 vendors per service per city = 60 total
                        String suffix = city.toLowerCase() + "_" + service.toLowerCase() + "_" + j;
                        String username = "vendor_v3_" + suffix.substring(0, Math.min(suffix.length(), 20)) + "_" + j; // Safety
                                                                                                                       // truncate
                                                                                                                       // if
                                                                                                                       // needed
                                                                                                                       // or
                                                                                                                       // just
                                                                                                                       // keep
                                                                                                                       // simple.
                        // Actually let's use a simpler username pattern
                        username = "v3_" + city.substring(0, 3) + "_" + service.substring(0, 3) + "_" + j;

                        String email = username + "@test.com";

                        String businessName = city + " " + service.replace("_", " ") + " " + j;

                        // Create vendor
                        if (!userRepository.existsByUsername(username)) {
                            createVendor(username, email, businessName, service, 10000.0 * j, city);
                            addedCount++;
                        }
                    }
                }
            }

            return "Seeding successful! Added " + addedCount + " new vendors (v3).";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    @GetMapping("/clear")
    public String clearVendors() {
        try {
            java.util.List<com.plannex.models.User> vendors = userRepository.findAll().stream()
                    .filter(u -> u.getUsername().startsWith("v3_") || u.getUsername().startsWith("vendor_"))
                    .collect(java.util.stream.Collectors.toList());

            userRepository.deleteAll(vendors);
            return "Cleared " + vendors.size() + " seeded vendors.";
        } catch (Exception e) {
            return "Error clearing vendors: " + e.getMessage();
        }
    }

    @GetMapping("/approve-all")
    public String approveAllVendors() {
        try {
            java.util.List<com.plannex.models.User> vendors = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream()
                            .anyMatch(r -> r.getName() == com.plannex.models.ERole.ROLE_VENDOR))
                    .peek(u -> {
                        u.setApproved(true);
                        u.setActive(true);
                        u.setSuspended(false);
                    })
                    .collect(java.util.stream.Collectors.toList());

            userRepository.saveAll(vendors);
            return "Approved and activated " + vendors.size() + " vendors.";
        } catch (Exception e) {
            return "Error approving vendors: " + e.getMessage();
        }
    }

    @GetMapping("/debug-interaction")
    public java.util.Map<String, Object> debugInteraction(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.plannex.security.services.UserDetailsImpl userDetails) {
        java.util.Map<String, Object> debug = new java.util.HashMap<>();
        if (userDetails == null) {
            debug.put("error", "Not authenticated");
            return debug;
        }
        com.plannex.models.User user = userRepository.findById(userDetails.getId()).orElse(null);
        debug.put("userId", userDetails.getId());
        debug.put("bookings", bookingRepository.findByUser(user));
        debug.put("applications", eventApplicationRepository.findByEvent_Client(user));
        return debug;
    }

    private void createVendor(String username, String email, String businessName, String category, Double price,
            String location) {
        if (userRepository.existsByUsername(username))
            return;

        com.plannex.models.User user = new com.plannex.models.User(username, email, passwordEncoder.encode("123456"));

        com.plannex.models.Role vendorRole = roleRepository.findByName(com.plannex.models.ERole.ROLE_VENDOR)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        java.util.Set<com.plannex.models.Role> roles = new java.util.HashSet<>();
        roles.add(vendorRole);
        user.setRoles(roles);

        // Vendor details
        user.setBusinessName(businessName);
        user.setCategory(category);
        user.setPrice(price);
        user.setLocation(location);
        user.setApproved(true);
        user.setSuspended(false);
        user.setActive(true);

        userRepository.save(user);
    }
}
