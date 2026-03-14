package com.plannex.controllers;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.EventApplication;
import com.plannex.models.Event;
import com.plannex.models.User;
import com.plannex.repository.EventApplicationRepository;
import com.plannex.repository.EventRepository;
import com.plannex.repository.UserRepository;
import com.plannex.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/applications")
public class EventApplicationController {

    @Autowired
    private EventApplicationRepository applicationRepository;

    @Autowired
    private com.plannex.services.BookingService bookingService;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.plannex.services.EmailService emailService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createApplication(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long eventId = Long.parseLong(payload.get("eventId").toString());
            Long vendorId = Long.parseLong(payload.get("vendorId").toString());
            Double price = Double.parseDouble(payload.get("price").toString());

            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            User vendor = userRepository.findById(vendorId)
                    .orElseThrow(() -> new RuntimeException("Vendor not found"));

            if (applicationRepository.existsByEventAndVendor(event, vendor)) {
                return ResponseEntity.badRequest().body("Request already sent to this vendor for this event.");
            }

            // Check if vendor is available on that day (no other ACCEPTED application)
            if (!isVendorAvailable(vendor, event.getDate())) {
                return ResponseEntity.badRequest().body("Vendor is already booked for another event on this date.");
            }

            EventApplication application = new EventApplication(event, vendor, price, vendor.getCategory());
            application.setStatus("PENDING");

            // Ensure bi-directional consistency
            if (event.getApplications() == null) {
                event.setApplications(new java.util.ArrayList<>());
            }
            event.getApplications().add(application);

            EventApplication savedApp = applicationRepository.save(application);

            // Notify Customer (Event Owner)
            emailService.sendVendorAppliedEmail(event.getClient().getEmail(),
                    event.getClient().getUsername(),
                    vendor.getUsername(),
                    event.getTitle(),
                    price);

            return ResponseEntity.ok(savedApp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/vendor")
    @PreAuthorize("hasRole('VENDOR')")
    public List<EventApplication> getVendorApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User vendor = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        return applicationRepository.findByVendor(vendor);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public List<EventApplication> getUserApplications(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return applicationRepository.findByEvent_Client(user);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            EventApplication app = applicationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));

            // Verify the vendor owns this application
            if (!app.getVendor().getId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            String status = payload.get("status");

            if ("ACCEPTED".equals(status)) {
                // Check if vendor is available on that day (no other ACCEPTED application)
                // We exclude the current application if it was already somehow accepted? No,
                // status change.
                if (!isVendorAvailable(app.getVendor(), app.getEvent().getDate())) {
                    return ResponseEntity.badRequest().body("You are already booked for another event on this date.");
                }
            }
            app.setStatus(status);
            EventApplication savedApp = applicationRepository.save(app);

            // Notify Vendor of status change
            if ("ACCEPTED".equals(status)) {
                emailService.sendVendorApprovedEmail(
                        app.getVendor().getEmail(),
                        app.getVendor().getUsername(),
                        app.getEvent().getTitle(),
                        app.getEvent().getClient().getUsername());
            } else if ("REJECTED".equals(status)) {
                emailService.sendVendorRejectedEmail(
                        app.getVendor().getEmail(),
                        app.getVendor().getUsername(),
                        app.getEvent().getTitle());
            }

            // Sync with Booking
            if ("WORK_COMPLETED".equals(status)) {
                try {
                    com.plannex.models.Booking booking = bookingService.getBookingByEventAndVendor(app.getEvent(),
                            app.getVendor());
                    if (booking != null) {
                        booking.setStatus("WORK_COMPLETED");
                        bookingService.saveBooking(booking);
                    }
                } catch (Exception e) {
                    System.out.println("Warning: Could not sync booking status: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(savedApp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private boolean isVendorAvailable(User vendor, java.time.LocalDateTime date) {
        // Vendor is considered detailed booked if they have an ACCEPTED application on
        // the same day
        java.time.LocalDateTime startOfDay = date.toLocalDate().atStartOfDay();
        java.time.LocalDateTime endOfDay = date.toLocalDate().plusDays(1).atStartOfDay();
        return !applicationRepository.existsByVendorAndStatusAndEvent_DateBetween(vendor, "ACCEPTED", startOfDay,
                endOfDay);
    }
}
