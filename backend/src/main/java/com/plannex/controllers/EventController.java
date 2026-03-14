package com.plannex.controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.plannex.models.Event;
import com.plannex.security.services.UserDetailsImpl;
import com.plannex.services.EventService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/event")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private com.plannex.services.EmailService emailService;

    @GetMapping
    public List<Event> getAllEvents(
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sort,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // Strict Location Enforcement for Vendors
        if (userDetails != null) {
            boolean isVendor = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_VENDOR"));
            if (isVendor) {
                location = userDetails.getLocation(); // Force vendor's location
            }
        }

        return eventService.getAllEvents(minPrice, maxPrice, location, sort);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createEvent(@RequestBody Event event,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Event createdEvent = eventService.createEvent(event, userDetails.getId());
            // Send event creation confirmation
            emailService.sendEventCreatedConfirmation(userDetails.getEmail(), userDetails.getUsername(),
                    createdEvent.getTitle());
            return ResponseEntity.ok(createdEvent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<?> applyToEvent(@PathVariable Long id,
            @RequestBody java.util.Map<String, Object> data,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            System.out.println("DEBUG: Application Request Data: " + data);
            Double price = null;
            if (data.containsKey("price")) {
                Object priceObj = data.get("price");
                System.out.println(
                        "DEBUG: Raw specific price object: " + priceObj + " Type: " + priceObj.getClass().getName());
                price = Double.parseDouble(priceObj.toString());
                System.out.println("DEBUG: Parsed Price: " + price);
            } else {
                System.out.println("DEBUG: No price key found in data map!");
            }
            return ResponseEntity.ok(eventService.applyToEvent(id, userDetails.getId(), price));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('VENDOR') or hasRole('USER')")
    public List<Event> getMyEvents(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isVendor = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_VENDOR"));

        if (isVendor) {
            return eventService.getVendorEvents(userDetails.getId());
        } else {
            return eventService.getClientEvents(userDetails.getId());
        }
    }

    @PutMapping("/{eventId}/applications/{appId}/status")
    @PreAuthorize("hasRole('USER')") // Assuming the user (customer) approves/rejects vendor applications
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long eventId, @PathVariable Long appId,
            @RequestBody String status) {
        String cleanStatus = status.replace("\"", "");
        try {
            return ResponseEntity.ok(eventService.updateApplicationStatus(appId, cleanStatus));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
