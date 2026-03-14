package com.plannex.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.Booking;
import com.plannex.security.services.UserDetailsImpl;
import com.plannex.services.BookingService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Long> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long eventId = payload.get("eventId");
            Booking booking = bookingService.createBooking(userDetails.getId(), eventId);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('USER')")
    public List<Booking> getMyBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return bookingService.getUserBookings(userDetails.getId());
    }

    @GetMapping("/vendor-bookings")
    @PreAuthorize("hasRole('VENDOR')")
    public List<Booking> getVendorBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return bookingService.getVendorBookings(userDetails.getId());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody String status) {
        // Status might come in quotes if sent as raw string JSON
        String cleanStatus = status.replace("\"", "");
        try {
            Booking booking = bookingService.updateStatus(id, cleanStatus);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('VENDOR')")
    public ResponseEntity<?> getBooking(@PathVariable Long id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
