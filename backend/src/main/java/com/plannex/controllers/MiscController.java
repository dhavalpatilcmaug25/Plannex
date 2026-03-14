package com.plannex.controllers;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.plannex.services.AdminService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class MiscController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/misc/services")
    public List<String> getServices() {
        return Arrays.asList("Catering", "Decor", "Photography", "Music/DJ", "Venue", "Planning", "Makeup", "Mehendi");
    }

    @GetMapping("/misc/locations")
    public List<String> getLocations() {
        return Arrays.asList("Mumbai", "Pune", "Delhi", "Bangalore", "Hyderabad");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        // Shared endpoint for platform stats
        // We can reuse AdminService logic here or create a dedicated StatsService
        // For now, mapping it to getSystemStats from AdminService as it is public-ish
        // on frontend
        return ResponseEntity.ok(adminService.getSystemStats());
    }

    @GetMapping("/stats/vendor-stats")
    public ResponseEntity<?> getVendorStats() {
        // Placeholder for vendor specific stats
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", 0);
        stats.put("revenue", 0);
        stats.put("rating", 4.5);
        return ResponseEntity.ok(stats);
    }
}
