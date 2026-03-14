package com.plannex.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.plannex.dto.SystemStatsDto;
import com.plannex.models.User;
import com.plannex.services.AdminService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<com.plannex.models.Booking>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PutMapping("/vendors/{id}/approve")
    public ResponseEntity<?> approveVendor(@PathVariable Long id) {
        try {
            User vendor = adminService.verifyVendor(id, true);
            return ResponseEntity.ok(vendor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/vendors/{id}/reject")
    public ResponseEntity<?> rejectVendor(@PathVariable Long id) {
        try {
            User vendor = adminService.verifyVendor(id, false);
            return ResponseEntity.ok(vendor);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        try {
            User user = adminService.suspendUser(id, true);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/users/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(@PathVariable Long id) {
        try {
            User user = adminService.suspendUser(id, false);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<SystemStatsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getSystemStats());
    }
}
